package com.gitgud.dto;

public class SubmitAnswerRequest {

    private Long questionId;
    private int selectedOptionIndex;

    public SubmitAnswerRequest() {}

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public int getSelectedOptionIndex() { return selectedOptionIndex; }
    public void setSelectedOptionIndex(int selectedOptionIndex) { this.selectedOptionIndex = selectedOptionIndex; }
}

