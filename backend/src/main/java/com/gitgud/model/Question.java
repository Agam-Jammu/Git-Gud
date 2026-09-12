package com.gitgud.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(length = 2000)
    private String codeSnippet;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;

    @Column(nullable = false)
    private int correctOptionIndex;

    @Column(length = 1000)
    private String explanation;

    public Question() {}

    public Question(String category, String text, String codeSnippet,
                    List<String> options, int correctOptionIndex, String explanation) {
        this.category = category;
        this.text = text;
        this.codeSnippet = codeSnippet;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.explanation = explanation;
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public String getText() { return text; }
    public String getCodeSnippet() { return codeSnippet; }
    public List<String> getOptions() { return options; }
    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public String getExplanation() { return explanation; }
}

