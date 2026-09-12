package com.gitgud.listener;

import com.gitgud.dto.events.GameEventDto;
import com.gitgud.dto.events.GameEventType;
import com.gitgud.service.RoomDeparture;
import com.gitgud.service.RoomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class WebSocketDisconnectListenerTest {

    @Mock
    private RoomService roomService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketDisconnectListener listener;

    @Test
    void broadcastsPlayerLeftForEachRoomTheSessionWasIn() {
        SessionDisconnectEvent event = disconnectEvent("session-1");
        when(roomService.leaveAll("session-1"))
                .thenReturn(List.of(new RoomDeparture("ABC123", "Alex")));
        when(roomService.players("ABC123")).thenReturn(List.of());

        listener.onDisconnect(event);

        ArgumentCaptor<GameEventDto> captor = ArgumentCaptor.forClass(GameEventDto.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/room/ABC123"), captor.capture());
        assertEquals(GameEventType.PLAYER_LEFT, captor.getValue().type());
    }

    @Test
    void broadcastsNothingWhenTheSessionWasNotInARoom() {
        SessionDisconnectEvent event = disconnectEvent("session-9");
        when(roomService.leaveAll("session-9")).thenReturn(List.of());

        listener.onDisconnect(event);

        verifyNoInteractions(messagingTemplate);
    }

    private SessionDisconnectEvent disconnectEvent(String sessionId) {
        SessionDisconnectEvent event = mock(SessionDisconnectEvent.class);
        when(event.getSessionId()).thenReturn(sessionId);
        return event;
    }
}
