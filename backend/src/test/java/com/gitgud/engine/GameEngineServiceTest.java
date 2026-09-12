package com.gitgud.engine;

import com.gitgud.dto.SubmitAnswerRequest;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.dto.events.PlayerAnsweredPayload;
import com.gitgud.dto.events.QuestionStartPayload;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.model.Question;
import com.gitgud.service.QuestionService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class GameEngineServiceTest {

    private static final long NOW = 1_000_000L;
    private static final String ROOM_CODE = "ABC123";
    private static final String SESSION_ID = "session-1";
    private static final String SECOND_SESSION_ID = "session-2";
    private static final String PLAYER_NAME = "Alex";
    private static final int CORRECT_OPTION = 2;
    private static final int WRONG_OPTION = 0;
    private static final long QUESTION_ID = 1L;
    private static final String TOPIC = "/topic/room/" + ROOM_CODE;

    @Mock
    private RoomService roomService;

    @Mock
    private QuestionService questionService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private RecordingScheduler scheduler;
    private GameEngineService engine;

    @BeforeEach
    void setUp() {
        scheduler = new RecordingScheduler();
        Clock clock = Clock.fixed(Instant.ofEpochMilli(NOW), ZoneOffset.UTC);
        engine = new GameEngineService(roomService, questionService, messagingTemplate, scheduler, clock);
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

    @Test
    void startMatchLoadsQuestionsAndBeginsTheCountdown() {
        GameRoom room = startableRoom();
        stubStart(room, 2);

        engine.startMatch(ROOM_CODE, SESSION_ID);

        assertEquals(GameState.COUNTDOWN, room.getState());
        assertEquals(2, room.getQuestions().size());
        assertEquals(List.of(GameEventType.COUNTDOWN_TICK), broadcastTypes());
        assertEquals(1, scheduler.pending());
    }

    @Test
    void countdownTicksThenStartTheFirstQuestion() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        engine.startMatch(ROOM_CODE, SESSION_ID);

        runCountdown();

        assertEquals(GameState.QUESTION_ACTIVE, room.getState());
        assertEquals(List.of(GameEventType.COUNTDOWN_TICK, GameEventType.COUNTDOWN_TICK,
                GameEventType.COUNTDOWN_TICK, GameEventType.QUESTION_START), broadcastTypes());
        assertEquals(1, scheduler.pending());
        assertEquals(GameEngineService.QUESTION_WINDOW_MS, scheduler.nextDelay());
    }

    @Test
    void questionStartPayloadCarriesTheQuestionAndDeadline() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        engine.startMatch(ROOM_CODE, SESSION_ID);

        runCountdown();

        QuestionStartPayload payload = (QuestionStartPayload) broadcastEvents().get(3).payload();
        assertEquals(1, payload.questionNumber());
        assertEquals(2, payload.totalQuestions());
        assertEquals(QUESTION_ID, payload.question().getId());
        assertEquals(NOW + GameEngineService.QUESTION_WINDOW_MS, payload.question().getDeadlineEpochMs());
    }

    @Test
    void questionTimerEndsTheRoundAndRevealsTheAnswer() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        engine.startMatch(ROOM_CODE, SESSION_ID);
        runCountdown();

        scheduler.runNext();

        assertEquals(GameState.ROUND_REVIEW, room.getState());
        assertTrue(broadcastTypes().contains(GameEventType.ROUND_RESULT));
    }

    @Test
    void revealAdvancesToTheNextQuestion() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        engine.startMatch(ROOM_CODE, SESSION_ID);
        runCountdown();

        scheduler.runNext();
        scheduler.runNext();

        assertEquals(GameState.QUESTION_ACTIVE, room.getState());
        assertEquals(1, room.getCurrentQuestionIndex());
    }

    @Test
    void matchEndsWithGameOverAfterTheLastQuestion() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        engine.startMatch(ROOM_CODE, SESSION_ID);

        scheduler.runUntilIdle();

        assertEquals(GameState.GAME_OVER, room.getState());
        List<GameEventType> types = broadcastTypes();
        assertEquals(GameEventType.GAME_OVER, types.get(types.size() - 1));
    }

    @Test
    void allPlayersAnsweringEndsTheRoundEarly() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        when(roomService.require(ROOM_CODE)).thenReturn(room);
        engine.startMatch(ROOM_CODE, SESSION_ID);
        runCountdown();

        engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));
        engine.submitAnswer(ROOM_CODE, SECOND_SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));

        assertEquals(GameState.ROUND_REVIEW, room.getState());
        assertTrue(broadcastTypes().contains(GameEventType.ROUND_RESULT));
    }

    @Test
    void staleQuestionTimerAfterAnEarlyEndChangesNothing() {
        GameRoom room = startableRoom();
        stubStart(room, 2);
        when(roomService.require(ROOM_CODE)).thenReturn(room);
        engine.startMatch(ROOM_CODE, SESSION_ID);
        runCountdown();
        engine.submitAnswer(ROOM_CODE, SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));
        engine.submitAnswer(ROOM_CODE, SECOND_SESSION_ID, answer(QUESTION_ID, CORRECT_OPTION));
        int broadcastsBeforeTimer = broadcastEvents().size();

        scheduler.runNext();

        assertEquals(broadcastsBeforeTimer, broadcastEvents().size());
    }

    private void runCountdown() {
        scheduler.runNext();
        scheduler.runNext();
        scheduler.runNext();
    }

    private GameRoom startableRoom() {
        GameRoom room = new GameRoom(ROOM_CODE);
        room.addPlayer(new Player(SESSION_ID, PLAYER_NAME));
        room.addPlayer(new Player(SECOND_SESSION_ID, "Sam"));
        return room;
    }

    private void stubStart(GameRoom room, int questionCount) {
        when(roomService.start(ROOM_CODE, SESSION_ID)).thenAnswer(invocation -> {
            room.setState(GameState.COUNTDOWN);
            return room;
        });
        when(questionService.findRandom(GameEngineService.QUESTIONS_PER_MATCH)).thenReturn(questions(questionCount));
    }

    private List<Question> questions(int count) {
        List<Question> questions = new ArrayList<>();
        for (int index = 0; index < count; index++) {
            questions.add(question(index + 1L, CORRECT_OPTION));
        }
        return questions;
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

    private List<GameEventDto> broadcastEvents() {
        ArgumentCaptor<GameEventDto> captor = ArgumentCaptor.forClass(GameEventDto.class);
        verify(messagingTemplate, atLeastOnce()).convertAndSend(eq(TOPIC), captor.capture());
        return captor.getAllValues();
    }

    private List<GameEventType> broadcastTypes() {
        List<GameEventType> types = new ArrayList<>();
        for (GameEventDto event : broadcastEvents()) {
            types.add(event.type());
        }
        return types;
    }

    private static final class RecordingScheduler implements GameLoopScheduler {

        private final List<Runnable> tasks = new ArrayList<>();
        private final List<Long> delays = new ArrayList<>();

        @Override
        public void schedule(Runnable task, long delayMillis) {
            tasks.add(task);
            delays.add(delayMillis);
        }

        int pending() {
            return tasks.size();
        }

        long nextDelay() {
            return delays.get(0);
        }

        void runNext() {
            delays.remove(0);
            tasks.remove(0).run();
        }

        void runUntilIdle() {
            int guard = 0;
            while (!tasks.isEmpty() && guard++ < 100) {
                runNext();
            }
        }
    }
}
