package com.gitgud.engine;

public interface GameLoopScheduler {

    void schedule(Runnable task, long delayMillis);
}
