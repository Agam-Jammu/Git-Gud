package com.gitgud.service;

import com.gitgud.exception.RoomNotFoundException;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.util.RoomCodeGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomServiceTest {

    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomService = new RoomService(new RoomCodeGenerator());
    }

    @Test
    void createsARoomInTheLobby() {
        GameRoom room = roomService.create();

        assertEquals(GameState.LOBBY, room.getState());
        assertTrue(room.getPlayers().isEmpty());
        assertNull(room.getHostSessionId());
        assertTrue(roomService.find(room.getCode()).isPresent());
    }

    @Test
    void generatesADifferentCodeForEachRoom() {
        assertNotEquals(roomService.create().getCode(), roomService.create().getCode());
    }

    @Test
    void findsARoomIgnoringCaseAndSurroundingWhitespace() {
        GameRoom room = roomService.create();

        assertTrue(roomService.find("  " + room.getCode().toLowerCase() + "  ").isPresent());
    }

    @Test
    void findReturnsEmptyForAnUnknownCode() {
        assertTrue(roomService.find("ZZZZZZ").isEmpty());
    }

    @Test
    void firstJoinerBecomesTheHost() {
        GameRoom room = roomService.create();

        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.join(room.getCode(), "session-2", "Sam");

        assertEquals("session-1", room.getHostSessionId());
        assertEquals(2, room.getPlayers().size());
        assertTrue(room.isHost("session-1"));
    }

    @Test
    void joiningAnUnknownRoomThrows() {
        assertThrows(RoomNotFoundException.class, () -> roomService.join("ZZZZZZ", "session-1", "Alex"));
    }

    @Test
    void leavingRemovesThePlayer() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.join(room.getCode(), "session-2", "Sam");

        roomService.leave(room.getCode(), "session-2");

        assertEquals(1, room.getPlayers().size());
    }

    @Test
    void leavingTheLastPlayerDeletesTheRoom() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");

        roomService.leave(room.getCode(), "session-1");

        assertTrue(roomService.find(room.getCode()).isEmpty());
    }

    @Test
    void leavingHostHandsTheRoomToAnotherPlayer() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.join(room.getCode(), "session-2", "Sam");

        roomService.leave(room.getCode(), "session-1");

        assertEquals("session-2", room.getHostSessionId());
    }

    @Test
    void leavingAnUnknownRoomIsIgnored() {
        roomService.leave("ZZZZZZ", "session-1");
    }

    @Test
    void hostCanStartTheMatch() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");

        GameRoom started = roomService.start(room.getCode(), "session-1");

        assertEquals(GameState.COUNTDOWN, started.getState());
    }

    @Test
    void nonHostCannotStartTheMatch() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.join(room.getCode(), "session-2", "Sam");

        assertThrows(IllegalStateException.class, () -> roomService.start(room.getCode(), "session-2"));
    }

    @Test
    void matchCannotStartTwice() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.start(room.getCode(), "session-1");

        assertThrows(IllegalStateException.class, () -> roomService.start(room.getCode(), "session-1"));
    }

    @Test
    void playersCannotJoinAfterTheMatchStarts() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.start(room.getCode(), "session-1");

        assertThrows(IllegalStateException.class, () -> roomService.join(room.getCode(), "session-2", "Sam"));
    }

    @Test
    void startingAnUnknownRoomThrows() {
        assertThrows(RoomNotFoundException.class, () -> roomService.start("ZZZZZZ", "session-1"));
    }

    @Test
    void playersListsTheCurrentRoster() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");

        List<Player> players = roomService.players(room.getCode());

        assertEquals(1, players.size());
        assertEquals("Alex", players.get(0).getName());
    }

    @Test
    void playersIsEmptyForAnUnknownRoom() {
        assertTrue(roomService.players("ZZZZZZ").isEmpty());
    }

    @Test
    void leaveAllRemovesTheSessionFromEveryRoomItJoined() {
        GameRoom first = roomService.create();
        GameRoom second = roomService.create();
        roomService.join(first.getCode(), "session-1", "Alex");
        roomService.join(second.getCode(), "session-1", "Alex");

        List<RoomDeparture> departures = roomService.leaveAll("session-1");

        assertEquals(2, departures.size());
        assertTrue(roomService.find(first.getCode()).isEmpty());
        assertTrue(roomService.find(second.getCode()).isEmpty());
    }

    @Test
    void leaveAllReportsTheRoomCodeAndPlayerName() {
        GameRoom room = roomService.create();
        roomService.join(room.getCode(), "session-1", "Alex");
        roomService.join(room.getCode(), "session-2", "Sam");

        List<RoomDeparture> departures = roomService.leaveAll("session-1");

        assertEquals(1, departures.size());
        assertEquals(room.getCode(), departures.get(0).roomCode());
        assertEquals("Alex", departures.get(0).playerName());
    }

    @Test
    void leaveAllIgnoresSessionsThatAreNotInAnyRoom() {
        roomService.create();

        assertTrue(roomService.leaveAll("session-unknown").isEmpty());
    }
}
