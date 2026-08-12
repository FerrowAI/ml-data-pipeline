import { Dataset } from './types';
import { seededShuffle } from './shuffle';

export interface SplitResult {
  train: Dataset;
  test: Dataset;
}

/** Deterministic (seeded) shuffle-then-slice train/test split. */
export function trainTestSplit(data: Dataset, trainRatio: number, seed = 42): SplitResult {
  if (trainRatio <= 0 || trainRatio >= 1) {
    throw new Error('trainTestSplit: trainRatio must be between 0 and 1 (exclusive)');
  }
  const shuffled = seededShuffle(data, seed);
  const cut = Math.round(shuffled.length * trainRatio);
  return { train: shuffled.slice(0, cut), test: shuffled.slice(cut) };
}
