package com.gitgud.dto.events;

import com.gitgud.dto.QuestionDto;

public record QuestionStartPayload(QuestionDto question, int questionNumber, int totalQuestions) {
}
