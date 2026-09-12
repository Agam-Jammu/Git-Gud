package com.gitgud.dto;

import com.gitgud.model.GameRoom;
import com.gitgud.model.Player;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class PlayerMapper {

    private PlayerMapper() {
    }

    public static List<PlayerDto> toDtos(GameRoom room) {
        return toDtos(room.getPlayers().values(), room.getHostSessionId());
    }

    public static List<PlayerDto> toDtos(Collection<Player> players, String hostSessionId) {
        List<PlayerDto> dtos = new ArrayList<>();
        for (Player player : players) {
            dtos.add(new PlayerDto(player.getName(), player.getScore(), player.getStreak(),
                    player.hasAnswered(), player.getSessionId().equals(hostSessionId)));
        }
        return dtos;
    }
}
