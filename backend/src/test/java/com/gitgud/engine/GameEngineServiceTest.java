package com.gitgud.engine;

import com.gitgud.dto.SubmitAnswerRequest;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.PlayerAnsweredPayload;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.model.Question;
import com.gitgud.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class GameEngineServiceTest {

    private static final long NOW = 1_000_000L;
    private static final String ROOM_CODE = "ABC123";
    private static final String SESSION_ID = "session-1";
    private static final String PLAYER_NAME = "Alex";
    private static final int CORRECT_OPTION = 2;
    private static final int WRONG_OPTION = 0;
    private static final long QUESTION_ID = 1L;

    @Mock
    private RoomService roomService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private GameEngineService engine;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.ofEpochMilli(NOW), ZoneOffset.UTC);
        engine = new GameEngineService(roomService, messagingTemplate, clock);
    }

    @Test
    void correctAnswerAwardsBasePointsAndSpeedBonus() {
        GameRoom room = activeRoom(5_000);
        Player player = player(room);
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertTrue(result.isPresent());
        assertEquals(1_250, result.get().points());
        assertEquals(1, result.get().streak());
        assertEquals(1_250, player.getScore());
        assertTrue(player.hasAnswered());
    }

    @Test
    void correctAnswerAwardsMoreWithNoTimeSpent() {
        GameRoom room = activeRoom(10_000);
        Player player = player(room);
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertEquals(1_500, result.orElseThrow().points());
        assertEquals(1_500, player.getScore());
    }

    @Test
    void consecutiveCorrectAnswersApplyTheStreakMultiplier() {
        GameRoom room = activeRoom(5_000);
        Player player = player(room);
        player.incrementStreak();
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertEquals(1_500, result.orElseThrow().points());
        assertEquals(2, result.orElseThrow().streak());
        assertEquals(2, player.getStreak());
    }

    @Test
    void incorrectAnswerScoresNothingAndResetsTheStreak() {
        GameRoom room = activeRoom(5_000);
        Player player = player(room);
        player.incrementStreak();
        player.incrementStreak();
        player.incrementStreak();
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, WRONG_OPTION));

        assertEquals(0, result.orElseThrow().points());
        assertEquals(0, player.getStreak());
        assertEquals(0, player.getScore());
        assertTrue(player.hasAnswered());
    }

    @Test
    void broadcastReportsHowManyPlayersHaveAnswered() {
        GameRoom room = activeRoom(5_000);
        player(room);
        room.addPlayer(new Player("session-2", "Sam"));
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        ArgumentCaptor<GameEventDto> captor = ArgumentCaptor.forClass(GameEventDto.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/room/" + ROOM_CODE), captor.capture());
        PlayerAnsweredPayload payload = (PlayerAnsweredPayload) captor.getValue().payload();
        assertEquals(PLAYER_NAME, payload.playerName());
        assertEquals(1, payload.answeredCount());
        assertEquals(2, payload.playerCount());
    }

    @Test
    void secondAnswerFromTheSamePlayerIsIgnored() {
        GameRoom room = activeRoom(5_000);
        Player player = player(room);
        when(roomService.require(ROOM_CODE)).thenReturn(room);
        engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        Optional<ScoreResult> second = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertTrue(second.isEmpty());
        assertEquals(1_250, player.getScore());
    }

    @Test
    void answerOutsideAnActiveQuestionIsIgnored() {
        GameRoom room = new GameRoom(ROOM_CODE);
        room.setQuestions(List.of(question(QUESTION_ID, CORRECT_OPTION)));
        Player player = player(room);
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertTrue(result.isEmpty());
        assertFalse(player.hasAnswered());
        assertEquals(0, player.getScore());
    }

    @Test
    void answerForAStaleQuestionIsIgnored() {
        GameRoom room = activeRoom(5_000);
        Player player = player(room);
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        Optional<ScoreResult> result = engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(999L, CORRECT_OPTION));

        assertTrue(result.isEmpty());
        assertFalse(player.hasAnswered());
    }

    @Test
    void answerFromASessionOutsideTheRoomThrows() {
        GameRoom room = activeRoom(5_000);
        when(roomService.require(ROOM_CODE)).thenReturn(room);

        assertThrows(IllegalStateException.class,
                () -> engine.submitAnswer(ROOM_CODE, "session-unknown", answer(QUESTION_ID, CORRECT_OPTION)));
    }

    private GameRoom activeRoom(long msRemaining) {
        GameRoom room = new GameRoom(ROOM_CODE);
        room.setQuestions(List.of(question(QUESTION_ID, CORRECT_OPTION)));
        room.setState(GameState.QUESTION_ACTIVE);
        room.setQuestionDeadlineEpochMs(NOW + msRemaining);
        return room;
    }

    private Player player(GameRoom room) {
        Player player = new Player(SESSION_ID, PLAYER_NAME);
        room.addPlayer(player);
        return player;
    }

    private Question question(long id, int correctOptionIndex) {
        Question question = new Question("Java & Spring Boot", "Which statement is true?", null,
                List.of("A", "B", "C", "D"), correctOptionIndex, "because");
        ReflectionTestUtils.setField(question, "id", id);
        return question;
    }

    private SubmitAnswerRequest answer(Long questionId, int selectedOptionIndex) {
        SubmitAnswerRequest request = new SubmitAnswerRequest();
        request.setQuestionId(questionId);
        request.setSelectedOptionIndex(selectedOptionIndex);
        return request;
    }
}
