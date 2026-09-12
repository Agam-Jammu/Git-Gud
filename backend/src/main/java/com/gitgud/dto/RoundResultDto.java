package com.gitgud.dto;

import java.util.List;

public class RoundResultDto {

    private int correctOptionIndex;
    private String explanation;
    private List<PlayerDto> scoreboard;

    public RoundResultDto() {}

    public RoundResultDto(int correctOptionIndex, String explanation, List<PlayerDto> scoreboard) {
        this.correctOptionIndex = correctOptionIndex;
        this.explanation = explanation;
        this.scoreboard = scoreboard;
    }

    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public String getExplanation() { return explanation; }
    public List<PlayerDto> getScoreboard() { return scoreboard; }
}

