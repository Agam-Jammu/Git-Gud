package com.gitgud.config;

import com.gitgud.model.Question;
import com.gitgud.repository.QuestionRepository;
import com.gitgud.seed.QuestionCategory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private final QuestionRepository questionRepository;
    private final List<QuestionCategory> categories;

    public DataSeeder(QuestionRepository questionRepository, List<QuestionCategory> categories) {
        this.questionRepository = questionRepository;
        this.categories = categories;
    }

    @Override
    public void run(ApplicationArguments args) {
        seed();
    }

    @SuppressWarnings("null")
    public int seed() {
        if (questionRepository.count() > 0) {
            return 0;
        }
        List<Question> questions = allQuestions();
        questionRepository.saveAll(List.copyOf(questions));
        return questions.size();
    }

    private List<Question> allQuestions() {
        List<QuestionCategory> ordered = new ArrayList<>(categories);
        ordered.sort(Comparator.comparing(category -> category.category()));

        List<Question> questions = new ArrayList<>();
        for (QuestionCategory category : ordered) {
            questions.addAll(category.questions());
        }
        return questions;
    }
}
