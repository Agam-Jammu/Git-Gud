package com.gitgud.service;

import com.gitgud.dto.CategoryDto;
import com.gitgud.model.Question;
import com.gitgud.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<Question> findRandom(int limit) {
        if (limit < 1) {
            throw new IllegalArgumentException("limit must be at least 1");
        }
        return questionRepository.findRandom(limit);
    }

    public List<CategoryDto> getCategories() {
        return questionRepository.countGroupedByCategory().stream()
                .map(count -> new CategoryDto(count.getCategory(), count.getCount()))
                .toList();
    }
}
