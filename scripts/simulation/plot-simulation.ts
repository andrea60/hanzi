import { Plot } from "nodeplotlib";
import * as plt from "nodeplotlib";
import { Subject } from "rxjs";
import { Skill } from "../../src/state/practice-session/PracticeScheduler";

export class SimulationPlotter {
  private plotData: Record<string, Subject<Plot[]>> = {};

  public plotGropedData(name: string, data: Map<string, number>) {
    if (!this.plotData[name]) {
      this.plotData[name] = new Subject<Plot[]>();

      plt.plot(this.plotData[name], { title: name });
    }

    // Prepare data for plotting
    const plotData: Plot[] = [];

    // Group memory by skill
    const skillCounts: Record<Skill, number[]> = {
      read: [],
      "type-hanzi": [],
      "type-pinyi": [],
      write: [],
    };
    const skillLabels: Record<Skill, string[]> = {
      read: [],
      "type-hanzi": [],
      "type-pinyi": [],
      write: [],
    };

    for (const [key, val] of data.entries()) {
      const [word, skill] = key.split(":") as [string, Skill];
      skillCounts[skill].push(val);
      skillLabels[skill].push(word);
    }

    // Create a trace for each skill
    for (const skill of Object.keys(skillCounts).sort() as Skill[]) {
      plotData.push({
        x: skillLabels[skill],
        y: skillCounts[skill],
        type: "bar",
        name: skill,
      });
    }

    if (plotData.length > 0) {
      this.plotData[name].next(plotData);
    }
  }
}
