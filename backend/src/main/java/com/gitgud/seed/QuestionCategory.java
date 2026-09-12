package com.gitgud.seed;

import com.gitgud.model.Question;

import java.util.List;

public abstract class QuestionCategory {

    public abstract String category();

    public abstract List<Question> questions();

    protected Question question(String text, List<String> options, int correctOptionIndex, String explanation) {
        return new Question(category(), text, null, options, correctOptionIndex, explanation);
    }

    protected Question questionWithSnippet(String text, String codeSnippet, List<String> options,
                                           int correctOptionIndex, String explanation) {
        return new Question(category(), text, codeSnippet, options, correctOptionIndex, explanation);
    }
}
