import { useCallback, useEffect, useState } from "react";

import { fetchPracticeQuestions } from "../services/api";
import type { PracticeQuestionDto } from "../types";

const DEFAULT_LIMIT = 5;

export interface UsePracticeOptions {
  limit?: number;
  load?: (limit: number) => Promise<PracticeQuestionDto[]>;
}

export interface PracticeProgress {
  current: PracticeQuestionDto | null;
  index: number;
  total: number;
  selectedOptionIndex: number | null;
  answered: boolean;
  correctCount: number;
  finished: boolean;
  loading: boolean;
  error: string | null;
  select: (optionIndex: number) => void;
  next: () => void;
  restart: () => void;
}

export function usePractice(options: UsePracticeOptions = {}): PracticeProgress {
  const { limit = DEFAULT_LIMIT, load = fetchPracticeQuestions } = options;

  const [questions, setQuestions] = useState<PracticeQuestionDto[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    load(limit)
      .then((loaded) => {
        if (!active) {
          return;
        }
        setQuestions(loaded);
        setIndex(0);
        setSelectedOptionIndex(null);
        setCorrectCount(0);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setError(cause instanceof Error ? cause.message : "could not load practice questions");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, limit, load]);

  const current: PracticeQuestionDto | null = index < questions.length ? questions[index] : null;
  const answered = selectedOptionIndex !== null;

  const select = useCallback(
    (optionIndex: number) => {
      if (answered || !current) {
        return;
      }

      setSelectedOptionIndex(optionIndex);

      if (optionIndex === current.correctOptionIndex) {
        setCorrectCount((count) => count + 1);
      }
    },
    [answered, current],
  );

  const next = useCallback(() => {
    setIndex((currentIndex) => currentIndex + 1);
    setSelectedOptionIndex(null);
  }, []);

  const restart = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return {
    current,
    index,
    total: questions.length,
    selectedOptionIndex,
    answered,
    correctCount,
    finished: !loading && questions.length > 0 && index >= questions.length,
    loading,
    error,
    select,
    next,
    restart,
  };
}
