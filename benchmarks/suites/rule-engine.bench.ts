import { describe, bench } from "vitest";
import {
  buildDependencyGraph,
  evaluateAllRules,
  evaluateAffectedFields,
  topologicalSort,
} from "../../packages/core/src/helpers/RuleEngine";
import { generateFormConfig, generateEntityData } from "../generators/generateFormConfig";
import {
  generateChainDependency,
  generateFanOutDependency,
  generateDiamondDependency,
  generateDependencyValues,
} from "../generators/generateDependencyChain";

// --- buildDependencyGraph ---

describe("buildDependencyGraph", () => {
  const configs = {
    "10 fields": generateFormConfig({ fieldCount: 10, rulesPerField: 2 }),
    "50 fields": generateFormConfig({ fieldCount: 50, rulesPerField: 2 }),
    "100 fields": generateFormConfig({ fieldCount: 100, rulesPerField: 2 }),
    "500 fields": generateFormConfig({ fieldCount: 500, rulesPerField: 2 }),
  };

  for (const [label, config] of Object.entries(configs)) {
    bench(label, () => {
      buildDependencyGraph(config.fields);
    });
  }
});

describe("buildDependencyGraph - varying rule counts", () => {
  bench("100 fields, 1 rule each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 1 });
    buildDependencyGraph(config.fields);
  });

  bench("100 fields, 5 rules each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 5 });
    buildDependencyGraph(config.fields);
  });

  bench("100 fields, 10 rules each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 10 });
    buildDependencyGraph(config.fields);
  });
});

// --- topologicalSort ---

describe("topologicalSort", () => {
  const sizes = [10, 50, 100, 500];

  for (const size of sizes) {
    const config = generateFormConfig({ fieldCount: size, rulesPerField: 2 });
    const graph = buildDependencyGraph(config.fields);

    bench(`${size} fields`, () => {
      topologicalSort(graph);
    });
  }

  // Chain dependency (worst case for topological sort depth)
  const chainConfig = generateChainDependency(100);
  const chainGraph = buildDependencyGraph(chainConfig.fields);

  bench("100-field chain (linear graph)", () => {
    topologicalSort(chainGraph);
  });

  // Fan-out (all depend on one root)
  const fanConfig = generateFanOutDependency(100);
  const fanGraph = buildDependencyGraph(fanConfig.fields);

  bench("100-field fan-out (star graph)", () => {
    topologicalSort(fanGraph);
  });
});

// --- evaluateAllRules ---

describe("evaluateAllRules", () => {
  const fieldCounts = [10, 50, 100, 500];

  for (const count of fieldCounts) {
    const config = generateFormConfig({ fieldCount: count, rulesPerField: 2 });
    const values = generateEntityData(count);

    bench(`${count} fields, 2 rules each`, () => {
      evaluateAllRules(config.fields, values);
    });
  }
});

describe("evaluateAllRules - rule density", () => {
  const values = generateEntityData(100);

  bench("100 fields, 0 rules", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 0 });
    evaluateAllRules(config.fields, values);
  });

  bench("100 fields, 1 rule each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 1 });
    evaluateAllRules(config.fields, values);
  });

  bench("100 fields, 5 rules each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 5 });
    evaluateAllRules(config.fields, values);
  });

  bench("100 fields, 10 rules each", () => {
    const config = generateFormConfig({ fieldCount: 100, rulesPerField: 10 });
    evaluateAllRules(config.fields, values);
  });
});

describe("evaluateAllRules - dependency patterns", () => {
  bench("100-field chain", () => {
    const config = generateChainDependency(100);
    const values = generateDependencyValues(100);
    evaluateAllRules(config.fields, values);
  });

  bench("100-field fan-out", () => {
    const config = generateFanOutDependency(100);
    const values = generateDependencyValues(100);
    evaluateAllRules(config.fields, values);
  });

  bench("25 diamonds (100 fields)", () => {
    const config = generateDiamondDependency(25);
    const values = generateDependencyValues(100);
    evaluateAllRules(config.fields, values);
  });
});

// --- evaluateAffectedFields ---

describe("evaluateAffectedFields - chain dependency", () => {
  const sizes = [50, 100, 200];

  for (const size of sizes) {
    const config = generateChainDependency(size);
    const values = generateDependencyValues(size);
    const initialState = evaluateAllRules(config.fields, values);

    bench(`change root in ${size}-field chain`, () => {
      evaluateAffectedFields("field_0", config.fields, values, initialState);
    });

    bench(`change middle in ${size}-field chain`, () => {
      const mid = `field_${Math.floor(size / 2)}`;
      evaluateAffectedFields(mid, config.fields, values, initialState);
    });

    bench(`change last in ${size}-field chain`, () => {
      evaluateAffectedFields(`field_${size - 1}`, config.fields, values, initialState);
    });
  }
});

describe("evaluateAffectedFields - fan-out dependency", () => {
  const sizes = [50, 100, 200];

  for (const size of sizes) {
    const config = generateFanOutDependency(size);
    const values = generateDependencyValues(size);
    const initialState = evaluateAllRules(config.fields, values);

    bench(`change root in ${size}-field fan-out`, () => {
      evaluateAffectedFields("field_0", config.fields, values, initialState);
    });

    bench(`change leaf in ${size}-field fan-out`, () => {
      evaluateAffectedFields(`field_${size - 1}`, config.fields, values, initialState);
    });
  }
});

describe("evaluateAffectedFields - 100 fields mixed rules", () => {
  const config = generateFormConfig({ fieldCount: 100, rulesPerField: 3 });
  const values = generateEntityData(100);
  const initialState = evaluateAllRules(config.fields, values);

  bench("change field with many dependents", () => {
    evaluateAffectedFields("field_0", config.fields, values, initialState);
  });

  bench("change field with no dependents", () => {
    evaluateAffectedFields("field_99", config.fields, values, initialState);
  });
});
