package com.gitgud.dto;

import com.gitgud.model.GameRoom;
import com.gitgud.model.Player;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlayerMapperTest {

    @Test
    void flagsOnlyTheHostSession() {
        GameRoom room = new GameRoom("ABC123");
        room.addPlayer(new Player("session-1", "Alex"));
        room.addPlayer(new Player("session-2", "Sam"));
        room.assignHostIfAbsent("session-1");

        List<PlayerDto> players = PlayerMapper.toDtos(room);

        assertEquals(2, players.size());
        assertTrue(dtoNamed(players, "Alex").isHost());
        assertFalse(dtoNamed(players, "Sam").isHost());
    }

    @Test
    void reportsNobodyAsHostBeforeAnyoneJoins() {
        GameRoom room = new GameRoom("ABC123");
        room.addPlayer(new Player("session-1", "Alex"));

        List<PlayerDto> players = PlayerMapper.toDtos(room);

        assertFalse(players.get(0).isHost());
    }

    @Test
    void carriesScoreStreakAndAnsweredState() {
        GameRoom room = new GameRoom("ABC123");
        Player player = new Player("session-1", "Alex");
        player.addScore(1_250);
        player.incrementStreak();
        player.markAnswered();
        room.addPlayer(player);
        room.assignHostIfAbsent("session-1");

        PlayerDto dto = PlayerMapper.toDtos(room).get(0);

        assertEquals("Alex", dto.getName());
        assertEquals(1_250, dto.getScore());
        assertEquals(1, dto.getStreak());
        assertTrue(dto.isAnswered());
        assertTrue(dto.isHost());
    }

    @Test
    void mapsAnExplicitHostSessionForPreSortedRosters() {
        Player alex = new Player("session-1", "Alex");
        Player sam = new Player("session-2", "Sam");

        List<PlayerDto> players = PlayerMapper.toDtos(List.of(sam, alex), "session-2");

        assertTrue(players.get(0).isHost());
        assertFalse(players.get(1).isHost());
    }

    private PlayerDto dtoNamed(List<PlayerDto> players, String name) {
        for (PlayerDto dto : players) {
            if (dto.getName().equals(name)) {
                return dto;
            }
        }
        throw new AssertionError("no player named " + name);
    }
}
