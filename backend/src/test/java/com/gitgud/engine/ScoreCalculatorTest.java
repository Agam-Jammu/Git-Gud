package com.gitgud.engine;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoreCalculatorTest {

    @Test
    void correctAnswerWithNoTimeLeftScoresBasePoints() {
        ScoreResult result = ScoreCalculator.calculate(true, 0, 0);

        assertEquals(1_000, result.points());
        assertEquals(1, result.streak());
    }

    @Test
    void correctAnswerAtFullTimeScoresBasePlusMaxSpeedBonus() {
        ScoreResult result = ScoreCalculator.calculate(true, 0, 10_000);

        assertEquals(1_500, result.points());
    }

    @Test
    void speedBonusScalesWithTimeRemaining() {
        assertEquals(0, ScoreCalculator.speedBonus(0));
        assertEquals(250, ScoreCalculator.speedBonus(5_000));
        assertEquals(500, ScoreCalculator.speedBonus(10_000));
    }

    @Test
    void speedBonusIsClampedToTheQuestionWindow() {
        assertEquals(0, ScoreCalculator.speedBonus(-1_000));
        assertEquals(500, ScoreCalculator.speedBonus(60_000));
    }

    @Test
    void secondCorrectAnswerAppliesTheStreakMultiplier() {
        ScoreResult result = ScoreCalculator.calculate(true, 1, 5_000);

        assertEquals(1_500, result.points());
        assertEquals(2, result.streak());
    }

    @Test
    void thirdCorrectAnswerAppliesTheStreakMultiplier() {
        ScoreResult result = ScoreCalculator.calculate(true, 2, 0);

        assertEquals(1_500, result.points());
        assertEquals(3, result.streak());
    }

    @Test
    void fourthCorrectAnswerDoublesTheScore() {
        ScoreResult result = ScoreCalculator.calculate(true, 3, 10_000);

        assertEquals(3_000, result.points());
        assertEquals(4, result.streak());
    }

    @Test
    void longStreaksStayAtTheTopMultiplier() {
        ScoreResult result = ScoreCalculator.calculate(true, 9, 10_000);

        assertEquals(3_000, result.points());
        assertEquals(10, result.streak());
    }

    @Test
    void pointsAreFlooredWhenTheMultiplierIsNotWhole() {
        ScoreResult result = ScoreCalculator.calculate(true, 1, 20);

        assertEquals(1_201, result.points());
    }

    @Test
    void incorrectAnswerScoresNothingAndResetsTheStreak() {
        ScoreResult result = ScoreCalculator.calculate(false, 5, 10_000);

        assertEquals(0, result.points());
        assertEquals(0, result.streak());
    }

    @Test
    void streakMultiplierFollowsTheConfiguredTiers() {
        assertEquals(1.0, ScoreCalculator.streakMultiplier(1), 1e-9);
        assertEquals(1.2, ScoreCalculator.streakMultiplier(2), 1e-9);
        assertEquals(1.5, ScoreCalculator.streakMultiplier(3), 1e-9);
        assertEquals(2.0, ScoreCalculator.streakMultiplier(4), 1e-9);
        assertEquals(2.0, ScoreCalculator.streakMultiplier(12), 1e-9);
    }
}
