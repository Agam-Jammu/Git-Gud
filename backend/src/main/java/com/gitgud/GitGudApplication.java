package com.gitgud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GitGudApplication {

    public static void main(String[] args) {
        SpringApplication.run(GitGudApplication.class, args);
    }
}
