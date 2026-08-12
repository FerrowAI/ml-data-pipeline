import { ColumnType, Dataset } from './types';

/** A column is 'numeric' if every non-null value is a number or a numeric string. */
export function inferColumnTypes(data: Dataset): Record<string, ColumnType> {
  const columns = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) columns.add(key);
  }

  const result: Record<string, ColumnType> = {};
  for (const col of columns) {
    const values = data
      .map((r) => r[col])
      .filter((v) => v !== null && v !== undefined && v !== '');

    const numeric =
      values.length > 0 &&
      values.every((v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))));

    result[col] = numeric ? 'numeric' : 'categorical';
  }
  return result;
}
