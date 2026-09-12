package com.gitgud.model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class GameRoom {

    private final String code;
    private String hostSessionId;
    private GameState state;
    private List<Question> questions;
    private int currentQuestionIndex;

    private final ConcurrentHashMap<String, Player> players;

    public GameRoom(String code) {
        this.code = code;
        this.state = GameState.LOBBY;
        this.questions = new ArrayList<>();
        this.currentQuestionIndex = 0;
        this.players = new ConcurrentHashMap<>();
    }

    public Question currentQuestion() {
        if (currentQuestionIndex >= questions.size()) return null;
        return questions.get(currentQuestionIndex);
    }

    public boolean advanceQuestion() {
        currentQuestionIndex++;
        for (Player player : players.values()) {
            player.resetAnswerState();
        }
        return currentQuestionIndex < questions.size();
    }

    public boolean allPlayersAnswered() {
        for (Player player : players.values()) {
            if (!player.hasAnswered()) {
                return false;
            }
        }
        return true;
    }

    public void addPlayer(Player player) {
        players.put(player.getSessionId(), player);
    }

    public Player removePlayer(String sessionId) {
        return players.remove(sessionId);
    }

    public synchronized void assignHostIfAbsent(String sessionId) {
        if (hostSessionId == null) {
            hostSessionId = sessionId;
        }
    }

    public synchronized void promoteNewHost() {
        hostSessionId = players.keySet().stream().findFirst().orElse(null);
    }

    public boolean isHost(String sessionId) {
        return hostSessionId != null && hostSessionId.equals(sessionId);
    }

    public String getCode() { return code; }
    public String getHostSessionId() { return hostSessionId; }
    public GameState getState() { return state; }
    public void setState(GameState state) { this.state = state; }
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public ConcurrentHashMap<String, Player> getPlayers() { return players; }
}

