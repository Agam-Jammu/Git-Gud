package com.gitgud.service;

import com.gitgud.exception.RoomNotFoundException;
import com.gitgud.model.GameRoom;
import com.gitgud.model.GameState;
import com.gitgud.model.Player;
import com.gitgud.util.RoomCodeGenerator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {

    private static final int MAX_CODE_ATTEMPTS = 100;

    private final ConcurrentHashMap<String, GameRoom> rooms = new ConcurrentHashMap<>();
    private final RoomCodeGenerator codeGenerator;

    public RoomService(RoomCodeGenerator codeGenerator) {
        this.codeGenerator = codeGenerator;
    }

    public GameRoom create() {
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String code = codeGenerator.next();
            GameRoom room = new GameRoom(code);
            if (rooms.putIfAbsent(code, room) == null) {
                return room;
            }
        }
        throw new IllegalStateException("could not allocate a unique room code");
    }

    public Optional<GameRoom> find(String code) {
        if (code == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(rooms.get(normalize(code)));
    }

    public GameRoom join(String code, String sessionId, String playerName) {
        GameRoom room = require(code);
        if (room.getState() != GameState.LOBBY) {
            throw new IllegalStateException("room " + room.getCode() + " is no longer accepting players");
        }
        if (room.hasPlayerNamed(playerName)) {
            throw new IllegalStateException("room " + room.getCode() + " already has a player called " + playerName);
        }
        room.addPlayer(new Player(sessionId, playerName));
        room.assignHostIfAbsent(sessionId);
        return room;
    }

    public Optional<Player> leave(String code, String sessionId) {
        Optional<GameRoom> found = find(code);
        return found.isEmpty() ? Optional.empty() : removeFrom(found.get(), sessionId);
    }

    public List<RoomDeparture> leaveAll(String sessionId) {
        List<RoomDeparture> departures = new ArrayList<>();
        for (GameRoom room : List.copyOf(rooms.values())) {
            Player player = room.getPlayers().get(sessionId);
            if (player != null) {
                String playerName = player.getName();
                removeFrom(room, sessionId);
                departures.add(new RoomDeparture(room.getCode(), playerName));
            }
        }
        return departures;
    }

    public GameRoom start(String code, String sessionId) {
        GameRoom room = require(code);
        if (!room.isHost(sessionId)) {
            throw new IllegalStateException("only the host can start the match");
        }
        if (room.getState() == GameState.GAME_OVER) {
            room.resetForRematch();
        }
        if (room.getState() != GameState.LOBBY) {
            throw new IllegalStateException("room " + room.getCode() + " has already started");
        }
        room.setState(GameState.COUNTDOWN);
        return room;
    }

    private Optional<Player> removeFrom(GameRoom room, String sessionId) {
        Player removed = room.removePlayer(sessionId);
        if (room.getPlayers().isEmpty()) {
            rooms.remove(room.getCode());
        } else if (removed != null && room.isHost(sessionId)) {
            room.promoteNewHost();
        }
        return Optional.ofNullable(removed);
    }

    public GameRoom require(String code) {
        return find(code).orElseThrow(() -> new RoomNotFoundException(code));
    }

    private String normalize(String code) {
        return code.trim().toUpperCase();
    }
}
