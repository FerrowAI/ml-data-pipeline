import { Dataset } from './types';

function numericValues(data: Dataset, column: string): number[] {
  return data
    .map((r) => r[column])
    .filter((v) => v !== null && v !== undefined)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
}

function asNumber(v: unknown): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export interface MinMaxParams {
  min: number;
  max: number;
}

/** Fit min-max params on the given (training) data. Does not touch `data`. */
export function fitMinMax(data: Dataset, column: string): MinMaxParams {
  const values = numericValues(data, column);
  if (values.length === 0) throw new Error(`fitMinMax: column "${column}" has no numeric values`);
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Applies previously-fit params to (possibly different) data — this is what prevents leakage:
 *  transforming test data always uses the params fit on train data. */
export function applyMinMax(data: Dataset, column: string, params: MinMaxParams): Dataset {
  const range = params.max - params.min || 1;
  return data.map((row) => ({ ...row, [column]: (asNumber(row[column]) - params.min) / range }));
}

export interface ZScoreParams {
  mean: number;
  std: number;
}

export function fitZScore(data: Dataset, column: string): ZScoreParams {
  const values = numericValues(data, column);
  if (values.length === 0) throw new Error(`fitZScore: column "${column}" has no numeric values`);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, std: Math.sqrt(variance) || 1 };
}

export function applyZScore(data: Dataset, column: string, params: ZScoreParams): Dataset {
  return data.map((row) => ({ ...row, [column]: (asNumber(row[column]) - params.mean) / params.std }));
}
