package com.gitgud.dto;

public class PlayerDto {

    private String name;
    private int score;
    private int streak;
    private boolean answered;

    public PlayerDto() {}

    public PlayerDto(String name, int score, int streak, boolean answered) {
        this.name = name;
        this.score = score;
        this.streak = streak;
        this.answered = answered;
    }

    public String getName() { return name; }
    public int getScore() { return score; }
    public int getStreak() { return streak; }
    public boolean isAnswered() { return answered; }
}

