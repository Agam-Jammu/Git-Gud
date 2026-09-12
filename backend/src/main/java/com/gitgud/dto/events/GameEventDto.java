package com.gitgud.dto.events;

public record GameEventDto(GameEventType type, Object payload) {
}
