package com.gitgud.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createReturnsACreatedRoomWithACode() throws Exception {
        mockMvc.perform(post("/api/v1/rooms"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").isNotEmpty());
    }

    @Test
    void statusReturnsTheRoomStateAndRoster() throws Exception {
        String code = createRoom();

        mockMvc.perform(get("/api/v1/rooms/{code}", code))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.state").value("LOBBY"))
                .andExpect(jsonPath("$.players").isEmpty());
    }

    @Test
    void statusReturnsNotFoundForAnUnknownCode() throws Exception {
        mockMvc.perform(get("/api/v1/rooms/{code}", "ZZZZZZ"))
                .andExpect(status().isNotFound());
    }

    private String createRoom() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/rooms"))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("code").asText();
    }
}
