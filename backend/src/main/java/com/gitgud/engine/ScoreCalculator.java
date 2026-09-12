package com.gitgud.engine;

public final class ScoreCalculator {

    public static final int BASE_POINTS = 1_000;
    public static final int MAX_SPEED_BONUS = 500;
    public static final long QUESTION_WINDOW_MS = 10_000L;

    private static final int[] STREAK_NUMERATORS = {10, 12, 15, 20};
    private static final int MULTIPLIER_DENOMINATOR = 10;

    private ScoreCalculator() {
    }

    public static ScoreResult calculate(boolean correct, int currentStreak, long msRemaining) {
        if (!correct) {
            return new ScoreResult(0, 0);
        }

        int newStreak = Math.max(currentStreak, 0) + 1;
        int multiplierIndex = Math.min(newStreak, STREAK_NUMERATORS.length) - 1;
        int points = (BASE_POINTS + speedBonus(msRemaining)) * STREAK_NUMERATORS[multiplierIndex]
                / MULTIPLIER_DENOMINATOR;

        return new ScoreResult(points, newStreak);
    }

    public static int speedBonus(long msRemaining) {
        long clamped = Math.max(0, Math.min(msRemaining, QUESTION_WINDOW_MS));
        return (int) (MAX_SPEED_BONUS * clamped / QUESTION_WINDOW_MS);
    }

    public static double streakMultiplier(int streak) {
        int index = Math.min(Math.max(streak, 1), STREAK_NUMERATORS.length) - 1;
        return STREAK_NUMERATORS[index] / (double) MULTIPLIER_DENOMINATOR;
    }
}
