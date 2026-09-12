package com.gitgud.listener;

import com.gitgud.dto.PlayerMapper;
import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.dto.events.PlayerLeftPayload;
import com.gitgud.service.RoomDeparture;
import com.gitgud.service.RoomService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketDisconnectListener {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketDisconnectListener(RoomService roomService, SimpMessagingTemplate messagingTemplate) {
        this.roomService = roomService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        for (RoomDeparture departure : roomService.leaveAll(event.getSessionId())) {
            messagingTemplate.convertAndSend("/topic/room/" + departure.roomCode(),
                    new GameEventDto(GameEventType.PLAYER_LEFT,
                            new PlayerLeftPayload(departure.playerName(),
                                    PlayerMapper.toDtos(roomService.players(departure.roomCode())))));
        }
    }
}
