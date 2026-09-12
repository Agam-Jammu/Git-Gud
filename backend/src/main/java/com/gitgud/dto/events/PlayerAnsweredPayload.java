package com.gitgud.dto.events;

public record PlayerAnsweredPayload(String playerName, int answeredCount, int playerCount) {
}
