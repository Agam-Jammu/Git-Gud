package com.gitgud.controller;

import com.gitgud.dto.CategoryDto;
import com.gitgud.dto.PracticeQuestionDto;
import com.gitgud.dto.QuestionMapper;
import com.gitgud.model.Question;
import com.gitgud.service.QuestionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class QuestionController {

    private static final String DEFAULT_PRACTICE_LIMIT = "5";

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return questionService.getCategories();
    }

    @GetMapping("/practice/questions")
    public List<PracticeQuestionDto> practiceQuestions(
            @RequestParam(defaultValue = DEFAULT_PRACTICE_LIMIT) int limit) {
        List<PracticeQuestionDto> questions = new ArrayList<>();
        for (Question question : questionService.findRandom(limit)) {
            questions.add(QuestionMapper.toPracticeDto(question));
        }
        return questions;
    }
}
