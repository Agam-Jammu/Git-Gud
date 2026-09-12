package com.gitgud.service;

import com.gitgud.config.DataSeeder;
import com.gitgud.dto.CategoryDto;
import com.gitgud.model.Question;
import com.gitgud.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class QuestionServiceTest {

    private static final int CATEGORY_COUNT = 4;
    private static final int QUESTIONS_PER_CATEGORY = 10;
    private static final int TOTAL_QUESTIONS = CATEGORY_COUNT * QUESTIONS_PER_CATEGORY;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private DataSeeder dataSeeder;

    @Test
    void seedsFortyQuestionsAcrossFourCategories() {
        assertEquals(TOTAL_QUESTIONS, questionRepository.count());
    }

    @Test
    void seedingIsIdempotent() {
        assertEquals(0, dataSeeder.seed());
        assertEquals(TOTAL_QUESTIONS, questionRepository.count());
    }

    @Test
    @Transactional
    void everySeededQuestionIsWellFormed() {
        List<Question> questions = questionRepository.findAll();

        assertFalse(questions.isEmpty(), "seed data should not be empty");
        for (Question question : questions) {
            String id = String.valueOf(question.getId());
            assertEquals(4, question.getOptions().size(), "question " + id + " should have 4 options");
            assertTrue(question.getCorrectOptionIndex() >= 0
                            && question.getCorrectOptionIndex() < question.getOptions().size(),
                    "question " + id + " has an out-of-range correct option");
            assertNotNull(question.getExplanation(), "question " + id + " needs an explanation");
        }
    }

    @Test
    void findRandomReturnsRequestedNumberOfDistinctQuestions() {
        List<Question> questions = questionService.findRandom(5);

        assertEquals(5, questions.size());

        Set<Long> distinctIds = new HashSet<>();
        for (Question question : questions) {
            distinctIds.add(question.getId());
        }
        assertEquals(questions.size(), distinctIds.size());
    }

    @Test
    void findRandomRejectsNonPositiveLimit() {
        assertThrows(IllegalArgumentException.class, () -> questionService.findRandom(0));
    }

    @Test
    void getCategoriesReturnsEachCategoryWithItsQuestionCount() {
        List<CategoryDto> categories = questionService.getCategories();

        assertEquals(CATEGORY_COUNT, categories.size());
        assertTrue(categories.stream().allMatch(category -> category.questionCount() == QUESTIONS_PER_CATEGORY),
                "every category should hold " + QUESTIONS_PER_CATEGORY + " questions");
    }
}
