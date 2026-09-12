package com.gitgud.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void categoriesListsEachCategoryWithItsQuestionCount() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].name").isNotEmpty())
                .andExpect(jsonPath("$[0].questionCount").value(10));
    }

    @Test
    void practiceReturnsFiveQuestionsIncludingTheirAnswers() throws Exception {
        mockMvc.perform(get("/api/v1/practice/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].options.length()").value(4))
                .andExpect(jsonPath("$[0].correctOptionIndex").isNumber())
                .andExpect(jsonPath("$[0].explanation").isNotEmpty());
    }

    @Test
    void practiceHonoursTheRequestedLimit() throws Exception {
        mockMvc.perform(get("/api/v1/practice/questions").param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void practiceRejectsANonPositiveLimit() throws Exception {
        mockMvc.perform(get("/api/v1/practice/questions").param("limit", "0"))
                .andExpect(status().isBadRequest());
    }
}
