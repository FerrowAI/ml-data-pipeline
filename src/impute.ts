import { CellValue, Dataset } from './types';

export type ImputeStrategy = 'mean' | 'mode' | 'constant';

export interface ImputeParams {
  column: string;
  strategy: ImputeStrategy;
  value: CellValue;
}

export function fitImpute(
  data: Dataset,
  column: string,
  strategy: ImputeStrategy,
  constantValue?: CellValue
): ImputeParams {
  if (strategy === 'constant') {
    return { column, strategy, value: constantValue ?? null };
  }

  if (strategy === 'mean') {
    const values = data
      .map((r) => r[column])
      .filter((v) => v !== null && v !== undefined)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
    const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { column, strategy, value: mean };
  }

  // mode
  const counts = new Map<string, number>();
  for (const row of data) {
    const v = row[column];
    if (v === null || v === undefined) continue;
    const key = String(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return { column, strategy, value: best };
}

export function applyImpute(data: Dataset, params: ImputeParams): Dataset {
  return data.map((row) =>
    row[params.column] === null || row[params.column] === undefined
      ? { ...row, [params.column]: params.value }
      : row
  );
}
