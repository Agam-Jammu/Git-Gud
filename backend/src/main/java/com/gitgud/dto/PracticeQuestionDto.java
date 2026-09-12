package com.gitgud.dto;

import java.util.List;

public record PracticeQuestionDto(Long id, String category, String text, String codeSnippet,
                                  List<String> options, int correctOptionIndex, String explanation) {
}
