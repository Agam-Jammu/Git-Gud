package com.gitgud.dto.events;

import com.gitgud.dto.PlayerDto;

import java.util.List;

public record PlayerJoinedPayload(String playerName, List<PlayerDto> players) {
}
