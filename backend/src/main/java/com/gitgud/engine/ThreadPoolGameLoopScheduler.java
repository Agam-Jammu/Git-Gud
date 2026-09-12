package com.gitgud.engine;

import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class ThreadPoolGameLoopScheduler implements GameLoopScheduler {

    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(4);

    @Override
    public void schedule(Runnable task, long delayMillis) {
        executor.schedule(task, delayMillis, TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    public void shutdown() {
        executor.shutdownNow();
    }
}
