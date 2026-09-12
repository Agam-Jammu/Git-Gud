package com.gitgud.dto.events;

import com.gitgud.dto.PlayerDto;

import java.util.List;

public record GameOverPayload(List<PlayerDto> standings) {
}
