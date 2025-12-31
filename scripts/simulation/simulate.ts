import "../../src/utils/extensions";
import readline from "node:readline";
import { SimulationPlotter } from "./plot-simulation.ts";
import { InMemoryPracticeScheduler } from "./sim-practice-scheduler.ts";
import { SimulatedUser, User } from "./sim-user.ts";
import { daysSince } from "../../src/utils/daysSince.ts";
import { ALL_SKILLS } from "../../src/state/practice-session/usePracticeSession.ts";
import { toMap } from "../../src/utils/toMap.ts";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export class FakeTime {
  private currentTime = new Date("2024-06-01T00:00:00Z");
  now(): Date {
    return this.currentTime;
  }
  advanceDays(days: number) {
    this.currentTime = new Date(
      this.currentTime.valueOf() + days * 24 * 60 * 60 * 1000
    );
  }
}

const input = (query: string): Promise<string> => {
  let resolve: (data: string) => void;

  const answerPromise = new Promise<string>((res) => (resolve = res));
  rl.question(query, (response) => {
    resolve(response);
  });
  return answerPromise;
};

console.log("Starting simulation....");

/** SIMULATION CONSTANTS  */
const SPEED = 1; // number of days to simulate per iteration
const INITIAL_WORDS = 50;

const SESSIONS_PER_DAY = 3;
const SESSION_SIZE = 10;

const time = new FakeTime();
const scheduler = new InMemoryPracticeScheduler(
  time,
  "test-user",
  INITIAL_WORDS
);
const user = new SimulatedUser(time);
const plotter = new SimulationPlotter();

do {
  for (let i = 0; i < SPEED; i++) {
    time.advanceDays(1);

    for (let y = 0; y < SESSIONS_PER_DAY; y++) {
      const result = await scheduler.nextWords(SESSION_SIZE);
      for (const wordData of result) {
        const metrics = user.practice(wordData.word, wordData.objective);
        scheduler.recordStats(wordData.word, wordData.objective, metrics);
      }
    }
  }

  const userInput = await input(
    "Press Enter to simulate next day, 'q' to quit, `a` to add a new word, `i` to inspect word stats: "
  );
  if (userInput.toLowerCase() === "q") {
    console.log("Exiting simulation.");
    process.exit(0);
  }
  if (userInput.toLowerCase() === "a") {
    const newWord = await input("Enter the new word to add: ");
    scheduler.addNewWord(newWord);
    console.log(`Word [${newWord}] added to the pool`);
    continue;
  }

  const wordStats = await scheduler.nextWords(
    scheduler.wordsPoolSize * ALL_SKILLS.length
  );
  console.log(wordStats.length);

  plotter.plotGropedData(
    "User Memory Over Time",
    user.memory.map((item) => item.strength)
  );
  plotter.plotGropedData(
    "User Practice Counts Over Time",
    user.memory.map((item) => item.practiceCount)
  );
  plotter.plotGropedData(
    "Days since last practice",
    user.memory.map((item) => daysSince(time.now(), item.lastPracticed))
  );

  plotter.plotGropedData(
    "WordSkill Urgency",
    toMap(wordStats, (w) => `${w.word}:${w.objective}`).map((v) => v.urgency)
  );
} while (true);
