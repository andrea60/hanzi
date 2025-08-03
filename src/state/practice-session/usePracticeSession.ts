import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { BucketDef, selectPracticeWords } from "./select-practice-words";
import { updateWordStats } from "../database/commands/updateWordStats";
import { getAuthenticatedUser } from "../../auth/useAuth";
import { useMemo } from "react";
import { saveSessionStats } from "../database/commands/saveSessionStats";
import { showToast } from "../../components/toastr/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "../database/queries/queryKey";

export type WordPracticeStats = {
  word: string;
  accuracy: number;
};

export type WordPracticeData = {
  uuid: string;
  word: string;
  pinyin: string;
  definitions: string[];
  avgAccuracy: number | undefined;
  practiceCount: number | undefined;
  lastPracticed: Date | undefined;
};

type InProgressSessionState = {
  state: "InProgress";
  id: string;
  totalWords: number;
  queue: WordPracticeData[];
  startTime: string;
  completed: Record<string, WordPracticeStats>;
};

type CompletedSessionState = {
  state: "Completed";
  id: string;
  totalWords: number;
  avgAccuracy: number;
  timeTakenSeconds: number;
  stats: WordPracticeStats[];
  startTime: string;
  endTime: string;
};

type PracticeSessionState = InProgressSessionState | CompletedSessionState;

const storageKey = "hanzi-current-session";
const sessionAtom = atomWithStorage<PracticeSessionState | undefined>(
  storageKey,
  undefined
);

export const forceDeleteSession = () => {
  localStorage.removeItem(storageKey);
}

export const usePracticeSession = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const queryClient = useQueryClient();

  const startSession = async (numWords: number, buckets: BucketDef[]) => {
    if (session) throw new Error("Session already in progress");

    // get the random words from the database
    const words = await selectPracticeWords(numWords, buckets);

    setSession({
      state: "InProgress",
      id: crypto.randomUUID(),
      totalWords: words.length,
      completed: {},
      queue: words,
      startTime: new Date().toISOString(),
    });
  };

  const markWordComplete = (stats: WordPracticeStats) => {
    setSession((prev) => {
      if (!prev || prev.state !== "InProgress") return prev;
      const [, ...queue] = prev.queue;
      const completed = { ...prev.completed };
      // Add the stats only if they weren't added before. The first stats are the only significant ones
      if (!completed[stats.word]) completed[stats.word] = stats;

      if (queue.length === 0) {
        const endTime = new Date();
        const startTime = new Date(prev.startTime);
        const timeTakenSeconds =
          (endTime.valueOf() - startTime.valueOf()) / 1000;

        const stats = Object.values(completed);
        const avgAccuracy = getAvgAccuracy(stats);
        // session completed
        return {
          state: "Completed",
          timeTakenSeconds,
          avgAccuracy,
          stats,
          startTime: prev.startTime,
          endTime: endTime.toISOString(),
          id: prev.id,
          totalWords: stats.length,
        };
      }
      return {
        ...prev,
        completed: { ...prev.completed, [stats.word]: stats },
        queue,
      };
    });
  };

  const repracticeWord = (stats: WordPracticeStats) => {
    setSession((prev) => {
      if (!prev || prev.state !== "InProgress") return prev;
      const [word, ...queue] = prev.queue;

      return {
        ...prev,
        queue: [...queue, { ...word, uuid: crypto.randomUUID() }],
        completed: { ...prev.completed, [stats.word]: stats },
      };
    });
  };

  const closeSession = async () => {
    if (!session || session.state !== "Completed") return;
    const user = getAuthenticatedUser();
    const startTime = new Date(session.startTime);
    try {
      await updateWordStats(user.uid, session.stats, startTime);

      await saveSessionStats(
        session.id,
        startTime,
        session.timeTakenSeconds,
        session.avgAccuracy,
        session.stats.map((s) => s.word),
        user.uid
      );
    } catch (error) {
      if (error instanceof Error)
        showToast({
          severity: "error",
          title: "Error occured while trying to save this session",
          content: `Error: ${error.message}`,
          type: "sticky",
        });
      else
        showToast({
          severity: "error",
          content: "Unknown error occured while trying to save this session",
          type: "sticky",
        });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: QueryKey.Stats() });
    setSession(undefined);
  };

  const discardSession = () => {
    setSession(undefined);
  };

  if (!session) {
    return {
      isRunning: false,
      startSession,
    } as const;
  }
  if (session.state === "InProgress") {
    const currentWord = session.queue[0];

    return {
      markWordComplete,
      repracticeWord,
      discardSession,
      currentWord,
      progress: getProgress(session),
      isCompleted: false,
      isRunning: true,
    } as const;
  }

  // completed session

  return {
    closeSession,
    discardSession,
    isCompleted: true,
    isRunning: true,
    stats: session.stats,
    avgAccuracy: session.avgAccuracy,
    timeTakenSeconds: session.timeTakenSeconds,
  } as const;
};

const getProgress = (state: InProgressSessionState): number => {
  if (state.totalWords === 0) return 1;
  const completedCount = state.totalWords - state.queue.length;

  return completedCount / state.totalWords;
};

const getAvgAccuracy = (stats: WordPracticeStats[]) => {
  if (stats.length === 1) return stats[0].accuracy;

  return stats.map((s) => s.accuracy).reduce((c, n) => c + n) / stats.length;
};
