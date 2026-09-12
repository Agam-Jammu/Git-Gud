package com.gitgud.seed;

import com.gitgud.model.Question;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SqlDatabaseQuestions extends QuestionCategory {

    public static final String CATEGORY = "SQL & Databases";

    @Override
    public String category() {
        return CATEGORY;
    }

    @Override
    public List<Question> questions() {
        return List.of(
                question(
                        "When is a full table scan often preferable to an index scan?",
                        List.of("When selecting a small percentage of rows",
                                "When selecting a large percentage of rows",
                                "Never",
                                "Only when a primary key exists"),
                        1,
                        "For a large fraction of the table, scanning is cheaper than many random index lookups."),
                question(
                        "Which isolation level prevents dirty reads but still allows non-repeatable reads?",
                        List.of("READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"),
                        1,
                        "READ COMMITTED only sees committed data, but a row can change between two reads in the same transaction."),
                question(
                        "A phantom read occurs when...",
                        List.of("A row is read twice with different values",
                                "A new row appears in a repeated range query",
                                "Two transactions deadlock",
                                "A read sees uncommitted data"),
                        1,
                        "Phantoms are new or removed rows matching a predicate that reappear between reads."),
                question(
                        "A table is in third normal form (3NF) when it has no...",
                        List.of("Partial dependencies on a composite key",
                                "Transitive dependencies on non-key attributes",
                                "Atomic column values",
                                "Surrogate key"),
                        1,
                        "2NF removes partial dependencies; 3NF additionally removes transitive dependencies."),
                question(
                        "First normal form (1NF) requires that...",
                        List.of("Column values are atomic",
                                "There are no transitive dependencies",
                                "A composite primary key exists",
                                "Every table has a foreign key"),
                        0,
                        "1NF forbids repeating groups and non-atomic values in a column."),
                question(
                        "What is the main cost of adding an index to a table?",
                        List.of("Slower reads", "Slower writes and extra storage", "It blocks all transactions", "It removes the primary key"),
                        1,
                        "Every insert/update must also maintain the index, adding write overhead and storage."),
                question(
                        "A clustered index determines...",
                        List.of("The physical order of rows in the table",
                                "Only the order of NULL values",
                                "The order of foreign keys",
                                "Nothing about storage"),
                        0,
                        "In a clustered index the table rows are stored in the index key order."),
                question(
                        "The N+1 query problem is best addressed by...",
                        List.of("Adding more indexes", "Fetch joins or batch fetching", "Using SELECT *", "Disabling the query cache"),
                        1,
                        "Fetch joins or batch fetching collapse N follow-up queries into fewer round trips."),
                question(
                        "Optimistic locking typically relies on which column?",
                        List.of("A version number", "The transaction start time", "A hash of all columns", "A random UUID"),
                        0,
                        "A @Version column is checked on update; a mismatch means the row changed concurrently."),
                question(
                        "What does an EXPLAIN (query plan) show?",
                        List.of("How the database intends to execute the query",
                                "The table's DDL",
                                "The user's permissions",
                                "The transaction log"),
                        0,
                        "EXPLAIN reveals access methods, join order and estimated costs used by the optimizer.")
        );
    }
}
