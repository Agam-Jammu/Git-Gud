package com.gitgud.model;

public class Player {

    private final String sessionId;
    private final String name;
    private int score;
    private int streak;
    private boolean answeredCurrentQuestion;

    public Player(String sessionId, String name) {
        this.sessionId = sessionId;
        this.name = name;
        this.score = 0;
        this.streak = 0;
        this.answeredCurrentQuestion = false;
    }

    public void addScore(int points) {
        this.score += points;
    }

    public void incrementStreak() {
        this.streak++;
    }

    public void resetStreak() {
        this.streak = 0;
    }

    public void markAnswered() {
        this.answeredCurrentQuestion = true;
    }

    public void resetAnswerState() {
        this.answeredCurrentQuestion = false;
    }

    public String getSessionId() { return sessionId; }
    public String getName() { return name; }
    public int getScore() { return score; }
    public int getStreak() { return streak; }
    public boolean hasAnswered() { return answeredCurrentQuestion; }
}

