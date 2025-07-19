import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { selectPracticeWords } from "./select-practice-words";
import { updateWordStats } from "../database/commands/updateWordStats";
import { getAuthenticatedUser } from "../../auth/useAuth";
export type WordPracticeStats = {
  word: string;
  confidence: number;
};

type PracticeSessionState = {
  id: string;
  queue: string[];
  startTime: Date;
  completed: WordPracticeStats[];
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
      completed: [],
      queue: words,
      startTime: new Date(),
    });
  };

  const markWordComplete = (stats: WordPracticeStats) => {
    setSession((prev) => {
      if (!prev) return prev;
      const [, ...queue] = prev.queue;
      return {
        ...prev,
        completed: [...prev.completed, stats],
        queue,
      };
    });
  };

  const closeSession = async () => {
    if (!session) return;
    const user = getAuthenticatedUser();

    await updateWordStats(user.uid, session.completed, session.startTime);

    setSession(undefined);
  };

  const discardSession = () => {
    setSession(undefined);
  };

  const isCompleted = session && session.queue.length === 0;
  const currentWord = session?.queue[0];
  const isRunning = session !== undefined;

  return {
    closeSession,
    startSession,
    markWordComplete,
    discardSession,
    isCompleted,
    currentWord,
    isRunning,
  };
};
