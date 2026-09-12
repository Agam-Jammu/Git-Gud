package com.gitgud;

import com.gitgud.dto.JoinRoomRequest;
import com.gitgud.dto.RoomCreatedResponse;
import com.gitgud.dto.SubmitAnswerRequest;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@SuppressWarnings("null")
class GameFlowIntegrationTest {

    private static final long TIMEOUT_SECONDS = 15;

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private final List<StompSession> sessions = new ArrayList<>();

    private WebSocketStompClient stompClient;

    @BeforeEach
    void setUp() {
        List<Transport> transports = new ArrayList<>();
        transports.add(new WebSocketTransport(new StandardWebSocketClient()));
        stompClient = new WebSocketStompClient(new SockJsClient(transports));
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    }

    @AfterEach
    void tearDown() {
        for (StompSession session : sessions) {
            if (session.isConnected()) {
                session.disconnect();
            }
        }
        sessions.clear();
        stompClient.stop();
    }

    @Test
    void twoPlayersPlayTheFirstRoundThroughToTheReveal() throws Exception {
        String code = createRoom();

        StompSession alex = connect();
        StompSession sam = connect();
        BlockingQueue<GameEventDto> events = subscribe(alex, code);

        alex.send("/app/room/" + code + "/join", joinRequest("Alex"));
        awaitEvent(events, GameEventType.PLAYER_JOINED);
        sam.send("/app/room/" + code + "/join", joinRequest("Sam"));
        awaitEvent(events, GameEventType.PLAYER_JOINED);

        alex.send("/app/room/" + code + "/start", new byte[0]);
        awaitEvent(events, GameEventType.COUNTDOWN_TICK);
        awaitEvent(events, GameEventType.COUNTDOWN_TICK);
        awaitEvent(events, GameEventType.COUNTDOWN_TICK);

        GameEventDto questionStart = awaitEvent(events, GameEventType.QUESTION_START);
        Map<?, ?> question = (Map<?, ?>) Objects.requireNonNull(payload(questionStart).get("question"));
        assertFalse(question.containsKey("correctOptionIndex"), "the correct answer must not leak before the reveal");
        assertFalse(question.containsKey("explanation"), "the explanation must not leak before the reveal");
        long questionId = ((Number) Objects.requireNonNull(question.get("id"))).longValue();

        alex.send("/app/room/" + code + "/answer", answerRequest(questionId, 0));
        awaitEvent(events, GameEventType.PLAYER_ANSWERED);
        sam.send("/app/room/" + code + "/answer", answerRequest(questionId, 0));
        awaitEvent(events, GameEventType.PLAYER_ANSWERED);

        GameEventDto roundResult = awaitEvent(events, GameEventType.ROUND_RESULT);
        Map<?, ?> result = payload(roundResult);
        assertNotNull(result.get("correctOptionIndex"));
        assertNotNull(result.get("explanation"));
        assertEquals(2, ((List<?>) Objects.requireNonNull(result.get("scoreboard"))).size());
    }

    @Test
    void roomStatusReportsPlayersAfterTheyJoin() throws Exception {
        String code = createRoom();
        StompSession alex = connect();
        BlockingQueue<GameEventDto> events = subscribe(alex, code);

        alex.send("/app/room/" + code + "/join", joinRequest("Alex"));
        awaitEvent(events, GameEventType.PLAYER_JOINED);

        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/rooms/" + code, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(Objects.requireNonNull(response.getBody()).contains("Alex"));
    }

    private String createRoom() {
        ResponseEntity<RoomCreatedResponse> response =
                restTemplate.postForEntity("/api/v1/rooms", null, RoomCreatedResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        return Objects.requireNonNull(response.getBody()).code();
    }

    private StompSession connect() throws Exception {
        StompSession session = stompClient
                .connectAsync("ws://localhost:" + port + "/ws", new StompSessionHandlerAdapter() {
                })
                .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        sessions.add(session);
        return session;
    }

    private BlockingQueue<GameEventDto> subscribe(StompSession session, String code) {
        BlockingQueue<GameEventDto> events = new LinkedBlockingQueue<>();
        session.subscribe("/topic/room/" + code, new StompFrameHandler() {

            @Override
            public Type getPayloadType(StompHeaders headers) {
                return GameEventDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                events.add((GameEventDto) payload);
            }
        });
        return events;
    }

    private GameEventDto awaitEvent(BlockingQueue<GameEventDto> events, GameEventType expected)
            throws InterruptedException {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(TIMEOUT_SECONDS);
        while (true) {
            long remaining = deadline - System.nanoTime();
            if (remaining <= 0) {
                throw new AssertionError("timed out waiting for " + expected);
            }
            GameEventDto event = events.poll(remaining, TimeUnit.NANOSECONDS);
            if (event != null && event.type() == expected) {
                return event;
            }
        }
    }

    private Map<?, ?> payload(GameEventDto event) {
        return (Map<?, ?>) Objects.requireNonNull(event.payload());
    }

    private JoinRoomRequest joinRequest(String playerName) {
        JoinRoomRequest request = new JoinRoomRequest();
        request.setPlayerName(playerName);
        return request;
    }

    private SubmitAnswerRequest answerRequest(long questionId, int selectedOptionIndex) {
        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(questionId);
        request.setSelectedOptionIndex(selectedOptionIndex);
        return request;
    }
}
