package com.gitgud.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class PlayerTest {

    @Test
    void startsWithNoScoreStreakOrAnswer() {
        Player player = new Player("session-1", "Alex");

        assertEquals("session-1", player.getSessionId());
        assertEquals("Alex", player.getName());
        assertEquals(0, player.getScore());
        assertEquals(0, player.getStreak());
        assertFalse(player.hasAnswered());
    }

    @Test
    void resetForMatchClearsScoreStreakAndAnswerState() {
        Player player = new Player("session-1", "Alex");
        player.addScore(1_250);
        player.incrementStreak();
        player.markAnswered();

        player.resetForMatch();

        assertEquals(0, player.getScore());
        assertEquals(0, player.getStreak());
        assertFalse(player.hasAnswered());
    }

    @Test
    void resetAnswerStateLeavesTheScoreAndStreakAlone() {
        Player player = new Player("session-1", "Alex");
        player.addScore(1_250);
        player.incrementStreak();
        player.markAnswered();

        player.resetAnswerState();

        assertEquals(1_250, player.getScore());
        assertEquals(1, player.getStreak());
        assertFalse(player.hasAnswered());
    }
}
