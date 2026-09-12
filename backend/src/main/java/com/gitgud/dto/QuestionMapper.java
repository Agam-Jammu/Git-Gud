package com.gitgud.dto;

import com.gitgud.model.Question;

import java.util.List;

public final class QuestionMapper {

    private QuestionMapper() {
    }

    public static QuestionDto toDto(Question question, long deadlineEpochMs) {
        return new QuestionDto(question.getId(), question.getCategory(), question.getText(),
                question.getCodeSnippet(), List.copyOf(question.getOptions()), deadlineEpochMs);
    }

    public static PracticeQuestionDto toPracticeDto(Question question) {
        return new PracticeQuestionDto(question.getId(), question.getCategory(), question.getText(),
                question.getCodeSnippet(), List.copyOf(question.getOptions()),
                question.getCorrectOptionIndex(), question.getExplanation());
    }
}
