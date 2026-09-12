package com.gitgud.dto;

import java.util.List;

public class QuestionDto {

    private Long id;
    private String category;
    private String text;
    private String codeSnippet;
    private List<String> options;
    private long deadlineEpochMs;

    public QuestionDto() {}

    public QuestionDto(Long id, String category, String text, String codeSnippet,
                       List<String> options, long deadlineEpochMs) {
        this.id = id;
        this.category = category;
        this.text = text;
        this.codeSnippet = codeSnippet;
        this.options = options;
        this.deadlineEpochMs = deadlineEpochMs;
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public String getText() { return text; }
    public String getCodeSnippet() { return codeSnippet; }
    public List<String> getOptions() { return options; }
    public long getDeadlineEpochMs() { return deadlineEpochMs; }
}

