package com.gitgud.controller;

import com.gitgud.dto.JoinRoomRequest;
import com.gitgud.dto.PlayerDto;
import com.gitgud.dto.PlayerMapper;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.dto.events.PlayerJoinedPayload;
import com.gitgud.dto.events.PlayerLeftPayload;
import com.gitgud.model.Player;
import com.gitgud.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class GameWsController {

    private final RoomService roomService;

    public GameWsController(RoomService roomService) {
        this.roomService = roomService;
    }

    @MessageMapping("/room/{code}/join")
    @SendTo("/topic/room/{code}")
    public GameEventDto join(@DestinationVariable String code,
                             @Valid @Payload JoinRoomRequest request,
                             SimpMessageHeaderAccessor headers) {
        roomService.join(code, requireSessionId(headers), request.getPlayerName());
        return new GameEventDto(GameEventType.PLAYER_JOINED,
                new PlayerJoinedPayload(request.getPlayerName(), roster(code)));
    }

    @MessageMapping("/room/{code}/leave")
    @SendTo("/topic/room/{code}")
    public GameEventDto leave(@DestinationVariable String code, SimpMessageHeaderAccessor headers) {
        Optional<Player> departed = roomService.leave(code, requireSessionId(headers));
        return new GameEventDto(GameEventType.PLAYER_LEFT,
                new PlayerLeftPayload(playerNameOrNull(departed), roster(code)));
    }

    private List<PlayerDto> roster(String code) {
        return PlayerMapper.toDtos(roomService.players(code));
    }

    private String playerNameOrNull(Optional<Player> player) {
        return player.isPresent() ? player.get().getName() : null;
    }

    private String requireSessionId(SimpMessageHeaderAccessor headers) {
        String sessionId = headers.getSessionId();
        if (sessionId == null) {
            throw new IllegalStateException("missing websocket session id");
        }
        return sessionId;
    }
}
