package com.gitgud.engine;

import com.gitgud.dto.SubmitAnswerRequest;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.dto.events.PlayerAnsweredPayload;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.model.Question;
import com.gitgud.service.RoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.Optional;

@Service
public class GameEngineService {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Clock clock;

    public GameEngineService(RoomService roomService, SimpMessagingTemplate messagingTemplate, Clock clock) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
        this.clock = clock;
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
        return Optional.of(result);
    }

    private void broadcastAnswer(GameRoom room, Player answered) {
        int answeredCount = 0;
        for (Player player : room.getPlayers().values()) {
            if (player.hasAnswered()) {
                answeredCount++;
            }
        }
        messagingTemplate.convertAndSend("/topic/room/" + room.getCode(),
                new GameEventDto(GameEventType.PLAYER_ANSWERED,
                        new PlayerAnsweredPayload(answered.getName(), answeredCount, room.getPlayers().size())));
    }

    private Player requirePlayer(GameRoom room, String sessionId) {
        Player player = room.getPlayers().get(sessionId);
        if (player == null) {
            throw new IllegalStateException("session " + sessionId + " is not in room " + room.getCode());
        }
        return player;
    }
}
