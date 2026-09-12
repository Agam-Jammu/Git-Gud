package com.gitgud.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JoinRoomRequest {

    @NotBlank
    @Size(min = 1, max = 20)
    private String playerName;

    public JoinRoomRequest() {}

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
}

