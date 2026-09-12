package com.gitgud.seed;

import com.gitgud.model.Question;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JavaSpringQuestions extends QuestionCategory {

    public static final String CATEGORY = "Java & Spring Boot";

    @Override
    public String category() {
        return CATEGORY;
    }

    @Override
    public List<Question> questions() {
        return List.of(
                questionWithSnippet(
                        "In Java 8+, a HashMap bucket converts from a linked list to a Red-Black tree once it exceeds which size?",
                        "static final int TREEIFY_THRESHOLD = ?;",
                        List.of("4", "6", "8", "16"),
                        2,
                        "TREEIFY_THRESHOLD is 8. A bucket untreeifies back to a list when it shrinks to UNTREEIFY_THRESHOLD (6)."),
                question(
                        "Calling a @Transactional method from another method in the same bean skips the transaction. Why?",
                        List.of("Spring caches the method result",
                                "Self-invocation never passes through the proxy",
                                "Transactions only apply to interfaces",
                                "The method must be public"),
                        1,
                        "The call is made on `this`, bypassing the Spring proxy, so the transaction advice is never applied."),
                question(
                        "Which garbage collector targets sub-millisecond pause times on very large heaps?",
                        List.of("Serial", "Parallel", "G1", "ZGC"),
                        3,
                        "ZGC is a concurrent, region-based collector designed for low pause times regardless of heap size."),
                question(
                        "What does a Java record automatically generate?",
                        List.of("Setters and a no-arg constructor",
                                "Canonical constructor, accessors, equals/hashCode/toString",
                                "Mutable fields",
                                "Annotation processing hooks"),
                        1,
                        "A record derives its canonical constructor, accessors, equals, hashCode and toString from its components."),
                question(
                        "Which Java 17 keyword restricts which classes may extend a type?",
                        List.of("final", "sealed", "static", "private"),
                        1,
                        "`sealed` types list permitted subclasses via `permits`, controlling the inheritance hierarchy."),
                question(
                        "By default, what is the scope of a Spring bean?",
                        List.of("prototype", "request", "singleton", "session"),
                        2,
                        "Singleton is the default scope: one shared instance per Spring container."),
                question(
                        "Why is constructor injection generally preferred over field injection?",
                        List.of("It runs faster at runtime",
                                "It makes dependencies explicit and allows final fields",
                                "It avoids Spring proxies entirely",
                                "It supports circular dependencies better"),
                        1,
                        "Constructor injection enforces required dependencies at construction time and keeps fields final and testable."),
                question(
                        "Which annotation directly triggers Spring Boot auto-configuration?",
                        List.of("@Configuration", "@EnableAutoConfiguration", "@ComponentScan", "@Bean"),
                        1,
                        "@EnableAutoConfiguration (bundled by @SpringBootApplication) activates the auto-configuration mechanism."),
                question(
                        "What is `var` in Java 17?",
                        List.of("A dynamic type", "Local variable type inference", "A keyword for fields", "Runtime typing"),
                        1,
                        "`var` infers the static type of a local variable from its initializer; it is still compile-time typed."),
                question(
                        "Which of these Stream operations is terminal?",
                        List.of("map", "filter", "collect", "peek"),
                        2,
                        "`collect` is terminal and produces a result; map, filter and peek are intermediate.")
        );
    }
}
