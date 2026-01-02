import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { updateWordStats } from "../database/commands/updateWordStats";
import { getAuthenticatedUser } from "../../auth/useAuth";
import { saveSessionStats } from "../database/commands/saveSessionStats";
import { showToast } from "../../components/toastr/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "../database/queries/queryKey";
import {
  DefaultPracticeScheduler,
  Skill,
  SkillPracticeResult,
  WordPracticeData,
} from "./PracticeScheduler";

export type PracticeMode = "write" | "memo";

export type WordPracticeResult = {
  word: string;
  pinyin: string;
  objective: Skill;
  result: SkillPracticeResult;
};

type InProgressSessionState = {
  state: "InProgress";
  id: string;
  totalWords: number;
  queue: WordPracticeData[];
  startTime: string;
  completed: Record<string, WordPracticeResult>;
};

type CompletedSessionState = {
  state: "Completed";
  id: string;
  totalWords: number;
  timeTakenSeconds: number;
  stats: WordPracticeResult[];
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
};

export const usePracticeSession = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const queryClient = useQueryClient();

  const startSession = async (numWords: number, skills: Skill[]) => {
    if (session) throw new Error("Session already in progress");
    const user = getAuthenticatedUser();

    // get the random words from the database
    const scheduler = new DefaultPracticeScheduler(user.uid);
    const words = await scheduler.nextWords(numWords, skills);

    const shuffledWords = words.shuffle();

    setSession({
      state: "InProgress",
      id: crypto.randomUUID(),
      totalWords: words.length,
      completed: {},
      queue: shuffledWords,
      startTime: new Date().toISOString(),
    });
  };

  const markWordComplete = (result: SkillPracticeResult) => {
    setSession((prev) => {
      if (!prev || prev.state !== "InProgress") return prev;
      const [current, ...queue] = prev.queue;
      const completed = { ...prev.completed };
      // Add the stats only if they weren't added before. The first stats are the only significant ones
      if (!completed[statKey(current)]) {
        completed[statKey(current)] = {
          result,
          word: current.word,
          pinyin: current.pinyin,
          objective: current.objective,
        };
      }

      if (queue.length === 0) {
        const endTime = new Date();
        const startTime = new Date(prev.startTime);
        const timeTakenSeconds =
          (endTime.valueOf() - startTime.valueOf()) / 1000;

        const stats = Object.values(completed);
        // session completed
        return {
          state: "Completed",
          timeTakenSeconds,
          stats,
          startTime: prev.startTime,
          endTime: endTime.toISOString(),
          id: prev.id,
          totalWords: stats.length,
        };
      }
      return {
        ...prev,
        completed,
        queue,
      };
    });
  };

  const repracticeWord = (result: SkillPracticeResult) => {
    setSession((prev) => {
      if (!prev || prev.state !== "InProgress") return prev;
      const [current, ...queue] = prev.queue;

      return {
        ...prev,
        queue: [...queue, { ...current, uuid: crypto.randomUUID() }],
        completed: {
          ...prev.completed,
          [statKey(current)]: {
            result,
            word: current.word,
            pinyin: current.pinyin,
            objective: current.objective,
          },
        },
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
    timeTakenSeconds: session.timeTakenSeconds,
  } as const;
};

/** Syntax sugar around the existing hook `usePracticeSession` which assumes a session is running.
 *
 * This throws an exception if it's not
 */
export const useRunningPracticeSession = () => {
  const session = usePracticeSession();
  if (!session.isRunning || session.isCompleted)
    throw new Error(
      "No active session running. This component should not be rendered"
    );

  return session;
};

const getProgress = (state: InProgressSessionState): number => {
  if (state.totalWords === 0) return 1;
  const completedCount = state.totalWords - state.queue.length;

  return completedCount / state.totalWords;
};

const statKey = (w: WordPracticeData) => `${w.objective}-${w.word}`;
