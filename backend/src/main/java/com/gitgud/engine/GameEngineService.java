package com.gitgud.engine;

import com.gitgud.dto.PlayerDto;
import com.gitgud.dto.PlayerMapper;
import com.gitgud.dto.QuestionMapper;
import com.gitgud.dto.RoundResultDto;
import com.gitgud.dto.SubmitAnswerRequest;
import com.gitgud.dto.events.CountdownTickPayload;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.dto.events.GameOverPayload;
import com.gitgud.dto.events.PlayerAnsweredPayload;
import com.gitgud.dto.events.QuestionStartPayload;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.model.Question;
import com.gitgud.service.QuestionService;
import com.gitgud.service.RoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GameEngineService {

    public static final int QUESTIONS_PER_MATCH = 5;
    public static final int COUNTDOWN_TICKS = 3;
    public static final long COUNTDOWN_TICK_MS = 1_000L;
    public static final long QUESTION_WINDOW_MS = ScoreCalculator.QUESTION_WINDOW_MS;
    public static final long REVEAL_MS = 3_000L;

    private final RoomService roomService;
    private final QuestionService questionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameLoopScheduler scheduler;
    private final Clock clock;

    public GameEngineService(RoomService roomService, QuestionService questionService,
                             SimpMessagingTemplate messagingTemplate, GameLoopScheduler scheduler, Clock clock) {
        this.roomService = roomService;
        this.questionService = questionService;
        this.messagingTemplate = messagingTemplate;
        this.scheduler = scheduler;
        this.clock = clock;
    }

    public void startMatch(String code, String sessionId) {
        List<Question> questions = questionService.findRandom(QUESTIONS_PER_MATCH);
        if (questions.isEmpty()) {
            throw new IllegalStateException("no questions available to start a match");
        }
        GameRoom room = roomService.start(code, sessionId);
        room.setQuestions(questions);
        countdownTick(room, COUNTDOWN_TICKS);
    }

    public Optional<ScoreResult> submitAnswer(String code, String sessionId, SubmitAnswerRequest request) {
        GameRoom room = roomService.require(code);
        Player player = requirePlayer(room, sessionId);

        if (room.getState() != GameState.QUESTION_ACTIVE || player.hasAnswered()) {
            return Optional.empty();
        }

        Question question = room.currentQuestion();
        if (question == null || question.getId() == null || !question.getId().equals(request.getQuestionId())) {
            return Optional.empty();
        }

        boolean correct = question.getCorrectOptionIndex() == request.getSelectedOptionIndex();
        long remainingMs = room.getQuestionDeadlineEpochMs() - clock.millis();
        ScoreResult result = ScoreCalculator.calculate(correct, player.getStreak(), remainingMs);

        player.addScore(result.points());
        if (correct) {
            player.incrementStreak();
        } else {
            player.resetStreak();
        }
        player.markAnswered();

        broadcastAnswer(room, player);

        if (room.allPlayersAnswered()) {
            endQuestion(room, room.getCurrentQuestionIndex());
        }
        return Optional.of(result);
    }

    private void countdownTick(GameRoom room, int secondsRemaining) {
        if (room.getState() != GameState.COUNTDOWN) {
            return;
        }
        broadcast(room, GameEventType.COUNTDOWN_TICK, new CountdownTickPayload(secondsRemaining));

        int index = room.getCurrentQuestionIndex();
        if (secondsRemaining > 1) {
            scheduler.schedule(() -> countdownTick(room, secondsRemaining - 1), COUNTDOWN_TICK_MS);
        } else {
            scheduler.schedule(() -> startRound(room, index), COUNTDOWN_TICK_MS);
        }
    }

    private void startRound(GameRoom room, int expectedIndex) {
        if (room.getCurrentQuestionIndex() != expectedIndex) {
            return;
        }
        if (room.getState() != GameState.COUNTDOWN && room.getState() != GameState.ROUND_REVIEW) {
            return;
        }
        Question question = room.currentQuestion();
        if (question == null) {
            finishMatch(room);
            return;
        }

        long deadline = clock.millis() + QUESTION_WINDOW_MS;
        room.setQuestionDeadlineEpochMs(deadline);
        room.setState(GameState.QUESTION_ACTIVE);
        broadcast(room, GameEventType.QUESTION_START,
                new QuestionStartPayload(QuestionMapper.toDto(question, deadline),
                        room.getCurrentQuestionIndex() + 1, room.getQuestions().size()));
        scheduler.schedule(() -> endQuestion(room, expectedIndex), QUESTION_WINDOW_MS);
    }

    private void endQuestion(GameRoom room, int expectedIndex) {
        synchronized (room) {
            if (room.getState() != GameState.QUESTION_ACTIVE || room.getCurrentQuestionIndex() != expectedIndex) {
                return;
            }
            room.setState(GameState.ROUND_REVIEW);
        }

        Question question = room.currentQuestion();
        if (question != null) {
            broadcast(room, GameEventType.ROUND_RESULT,
                    new RoundResultDto(question.getCorrectOptionIndex(), question.getExplanation(), standings(room)));
        }
        scheduler.schedule(() -> startNextRound(room, expectedIndex), REVEAL_MS);
    }

    private void startNextRound(GameRoom room, int expectedIndex) {
        if (room.getState() != GameState.ROUND_REVIEW || room.getCurrentQuestionIndex() != expectedIndex) {
            return;
        }
        if (room.advanceQuestion()) {
            startRound(room, room.getCurrentQuestionIndex());
        } else {
            finishMatch(room);
        }
    }

    private void finishMatch(GameRoom room) {
        room.setState(GameState.GAME_OVER);
        broadcast(room, GameEventType.GAME_OVER, new GameOverPayload(standings(room)));
    }

    private void broadcastAnswer(GameRoom room, Player answered) {
        int answeredCount = 0;
        for (Player player : room.getPlayers().values()) {
            if (player.hasAnswered()) {
                answeredCount++;
            }
        }
        broadcast(room, GameEventType.PLAYER_ANSWERED,
                new PlayerAnsweredPayload(answered.getName(), answeredCount, room.getPlayers().size()));
    }

    private void broadcast(GameRoom room, GameEventType type, Object payload) {
        messagingTemplate.convertAndSend("/topic/room/" + room.getCode(), new GameEventDto(type, payload));
    }

    private List<PlayerDto> standings(GameRoom room) {
        List<Player> ordered = new ArrayList<>(room.getPlayers().values());
        ordered.sort((first, second) -> Integer.compare(second.getScore(), first.getScore()));
        return PlayerMapper.toDtos(ordered);
    }

    private Player requirePlayer(GameRoom room, String sessionId) {
        Player player = room.getPlayers().get(sessionId);
        if (player == null) {
            throw new IllegalStateException("session " + sessionId + " is not in room " + room.getCode());
        }
        return player;
    }
}
