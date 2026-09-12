package com.gitgud.controller;

import com.gitgud.dto.JoinRoomRequest;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.model.GameRoom;
import com.gitgud.service.RoomService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@SuppressWarnings("null")
class GameWsControllerTest {

    private static final long TIMEOUT_SECONDS = 5;

    @LocalServerPort
    private int port;

    @Autowired
    private RoomService roomService;

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
    void joiningBroadcastsTheUpdatedRoster() throws Exception {
        GameRoom room = roomService.create();
        StompSession session = connect();
        BlockingQueue<GameEventDto> events = subscribe(session, room.getCode());

        session.send("/app/room/" + room.getCode() + "/join", joinRequest("Alex"));

        GameEventDto event = nextEvent(events);
        assertEquals(GameEventType.PLAYER_JOINED, event.type());
        assertEquals("Alex", payload(event).get("playerName"));
        assertEquals(1, players(event).size());
    }

    @Test
    void bothPlayersAppearInTheRosterAfterTwoJoins() throws Exception {
        GameRoom room = roomService.create();
        StompSession alex = connect();
        StompSession sam = connect();
        BlockingQueue<GameEventDto> alexEvents = subscribe(alex, room.getCode());

        alex.send("/app/room/" + room.getCode() + "/join", joinRequest("Alex"));
        nextEvent(alexEvents);

        sam.send("/app/room/" + room.getCode() + "/join", joinRequest("Sam"));

        GameEventDto event = nextEvent(alexEvents);
        assertEquals(GameEventType.PLAYER_JOINED, event.type());
        assertEquals(2, players(event).size());
    }

    @Test
    void leavingBroadcastsTheDepartingPlayerAndRemainingRoster() throws Exception {
        GameRoom room = roomService.create();
        StompSession session = connect();
        BlockingQueue<GameEventDto> events = subscribe(session, room.getCode());

        session.send("/app/room/" + room.getCode() + "/join", joinRequest("Alex"));
        nextEvent(events);

        session.send("/app/room/" + room.getCode() + "/leave", new byte[0]);

        GameEventDto event = nextEvent(events);
        assertEquals(GameEventType.PLAYER_LEFT, event.type());
        assertEquals("Alex", payload(event).get("playerName"));
        assertEquals(0, players(event).size());
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

    private JoinRoomRequest joinRequest(String playerName) {
        JoinRoomRequest request = new JoinRoomRequest();
        request.setPlayerName(playerName);
        return request;
    }

    private GameEventDto nextEvent(BlockingQueue<GameEventDto> events) throws InterruptedException {
        GameEventDto event = Objects.requireNonNull(events.poll(TIMEOUT_SECONDS, TimeUnit.SECONDS),
                "expected a websocket event but none arrived");
        assertNotNull(event.type());
        return event;
    }

    private Map<?, ?> payload(GameEventDto event) {
        return (Map<?, ?>) Objects.requireNonNull(event.payload());
    }

    private List<?> players(GameEventDto event) {
        return (List<?>) Objects.requireNonNull(payload(event).get("players"));
    }
}
