# ml-data-pipeline
![CI](https://github.com/FerrowAI/ml-data-pipeline/actions/workflows/ci.yml/badge.svg)

Lightweight tabular data prep — no tensor/ML framework dependency. Column
typing, normalization, one-hot encoding, seeded shuffling, splitting, and
imputation, all built around a **fit/transform split**: params are computed
once on training data and then replayed on other data, so you can't
accidentally leak test-set statistics into your features.

## What this is
- `inferColumnTypes(data)` — numeric vs categorical, per column.
- `fitMinMax` / `applyMinMax` and `fitZScore` / `applyZScore` — normalization
  and standardization, each split into a `fit` step (computes params from
  data) and an `apply` step (uses SAVED params — never recomputed from
  whatever data you pass it).
- `fitOneHot` / `applyOneHot` — one-hot encoding with an explicit unseen-
  category policy: `'ignore'` (all-zero row), `'error'` (throws), or
  `'extra-column'` (`<column>_unknown`).
- `mulberry32(seed)` — a small seeded PRNG; `seededShuffle(data, seed)` —
  deterministic Fisher-Yates shuffle built on it.
- `trainTestSplit(data, ratio, seed)` — seeded shuffle-then-slice.
- `fitImpute` / `applyImpute` — mean / mode / constant imputation, same
  fit/apply split.
- `Pipeline` — chains steps (`.impute()`, `.minmax()`, `.zscore()`,
  `.onehot()`), `.fit(train)` computes and stores every step's params,
  `.transform(anyData)` replays those saved params, and `.toJSON()` /
  `Pipeline.fromJSON()` serialize/restore the fitted state.

## What this is NOT
- No tensors, no GPU, no model training — this is preprocessing only.
- No CSV/file I/O — bring your own parsed `Row[]` (`Record<string, string |
  number | null>`).
- No image/text feature extraction — tabular columns only.

## Quickstart

```bash
npm install
npm run build
node dist/examples/demo.js
```

## API

```ts
import { Pipeline, trainTestSplit } from 'ml-data-pipeline';

const { train, test } = trainTestSplit(data, 0.75, 7); // seed=7, deterministic

const pipeline = new Pipeline().minmax('age');
pipeline.fit(train);              // computes min/max from TRAIN only
const testOut = pipeline.transform(test); // applies TRAIN's min/max to test

const saved = pipeline.toJSON();
const restored = Pipeline.fromJSON(saved);
```

### Demo: proving no leakage

`examples/demo.ts` fits a min-max scaler on the train split, transforms the
test split, and shows the test output matches a manual calculation done with
**only** the train min/max — never test's own range:

```
$ node dist/examples/demo.js
train ages: [60, 80, 30, 40, 50, 70]  (min=30, max=80)
test raw ages: [90, 20]
test normalized (via pipeline): [1.2, -0.2]
matches manual TRAIN-param calc: true
```

Note the test values fall outside `[0, 1]` — expected, since they're scaled
by the training range, not their own.

## License
MIT

---
Sponsored by [Ferrow](https://ferrow.ai)

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
