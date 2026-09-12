package com.gitgud.model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class GameRoom {

    private final String code;
    private final String hostSessionId;
    private GameState state;
    private List<Question> questions;
    private int currentQuestionIndex;

    private final ConcurrentHashMap<String, Player> players;

    public GameRoom(String code, String hostSessionId) {
        this.code = code;
        this.hostSessionId = hostSessionId;
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
        players.values().forEach(Player::resetAnswerState);
        return currentQuestionIndex < questions.size();
    }

    public boolean allPlayersAnswered() {
        return players.values().stream().allMatch(Player::hasAnswered);
    }

    public void addPlayer(Player player) {
        players.put(player.getSessionId(), player);
    }

    public void removePlayer(String sessionId) {
        players.remove(sessionId);
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

