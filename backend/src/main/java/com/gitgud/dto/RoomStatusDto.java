package com.gitgud.dto;

import com.gitgud.model.GameState;

import java.util.List;

public record RoomStatusDto(String code, GameState state, List<PlayerDto> players) {
}
