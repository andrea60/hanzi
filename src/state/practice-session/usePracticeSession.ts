import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { selectPracticeWords } from "./select-practice-words";
import { updateWordStats } from "../database/commands/updateWordStats";
import { getAuthenticatedUser } from "../../auth/useAuth";

export type WordPracticeStats = {
  word: string;
  confidence: number;
};

export type WordPracticeStepData = {
  char: string;
  pinyin: string;
  strokeData: unknown;
};
export type WordPracticeData = {
  word: string;
  pinyin: string;
  steps: WordPracticeStepData[];
  definitions: string[];
};

type PracticeSessionState = {
  id: string;
  totalWords: number;
  queue: WordPracticeData[];
  startTime: Date;
  completed: Record<string, WordPracticeStats>;
};

// todo implement atom

const sessionAtom = atomWithStorage<PracticeSessionState | undefined>(
  "current-session",
  undefined
);

export const usePracticeSession = () => {
  const [session, setSession] = useAtom(sessionAtom);

  const startSession = async (numWords: number) => {
    if (session) throw new Error("Session already in progress");

    // get the random words from the database
    const words = await selectPracticeWords(numWords);

    setSession({
      id: crypto.randomUUID(),
      totalWords: words.length,
      completed: {},
      queue: words,
      startTime: new Date(),
    });
  };

  const markWordComplete = (stats: WordPracticeStats) => {
    setSession((prev) => {
      if (!prev) return prev;
      const [, ...queue] = prev.queue;
      const completed = { ...prev.completed };
      // Add the stats only if they weren't added before. The first stats are the only significant ones
      if (!completed[stats.word]) completed[stats.word] = stats;
      return {
        ...prev,
        completed: { ...prev.completed, [stats.word]: stats },
        queue,
      };
    });
  };

  const repracticeWord = (stats: WordPracticeStats) => {
    setSession((prev) => {
      if (!prev) return prev;
      const [word, ...queue] = prev.queue;

      return {
        ...prev,
        queue: [...queue, word],
        completed: { ...prev.completed, [stats.word]: stats },
      };
    });
  };

  const closeSession = async () => {
    if (!session) return;
    const user = getAuthenticatedUser();

    await updateWordStats(
      user.uid,
      Object.values(session.completed),
      session.startTime
    );

    setSession(undefined);
  };

  const discardSession = () => {
    setSession(undefined);
  };

  const isCompleted = session && session.queue.length === 0;
  const currentWord = session?.queue[0];
  const isRunning = session !== undefined;

  const progress = session ? getProgress(session) : undefined;

  return {
    closeSession,
    startSession,
    markWordComplete,
    discardSession,
    repracticeWord,
    isCompleted,
    currentWord,
    isRunning,
    progress,
  };
};

const getProgress = (state: PracticeSessionState): number => {
  if (state.totalWords === 0) return 1;
  const completedCount = state.totalWords - state.queue.length;

  return completedCount / state.totalWords;
};
