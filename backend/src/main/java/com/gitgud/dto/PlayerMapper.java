package com.gitgud.dto;

import com.gitgud.model.Player;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class PlayerMapper {

    private PlayerMapper() {
    }

    public static List<PlayerDto> toDtos(Collection<Player> players) {
        List<PlayerDto> dtos = new ArrayList<>();
        for (Player player : players) {
            dtos.add(new PlayerDto(player.getName(), player.getScore(), player.getStreak(), player.hasAnswered()));
        }
        return dtos;
    }
}
