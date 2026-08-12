import { Dataset } from './types';

export type UnseenPolicy = 'ignore' | 'error' | 'extra-column';

export interface OneHotParams {
  column: string;
  categories: string[];
  unseenPolicy: UnseenPolicy;
}

export function fitOneHot(
  data: Dataset,
  column: string,
  options: { unseenPolicy?: UnseenPolicy } = {}
): OneHotParams {
  const categories = Array.from(
    new Set(
      data
        .map((r) => r[column])
        .filter((v) => v !== null && v !== undefined)
        .map((v) => String(v))
    )
  ).sort();
  return { column, categories, unseenPolicy: options.unseenPolicy ?? 'ignore' };
}

/** Expands `column` into one `<column>_<category>` boolean column per fitted category.
 *  A value not among the fitted categories is handled per `unseenPolicy`:
 *  'ignore' (all-zero row), 'error' (throws), or 'extra-column' (`<column>_unknown` = 1). */
export function applyOneHot(data: Dataset, params: OneHotParams): Dataset {
  return data.map((row) => {
    const raw = row[params.column];
    const value = raw === null || raw === undefined ? '' : String(raw);
    const out: Dataset[number] = { ...row };
    delete out[params.column];

    let seen = false;
    for (const category of params.categories) {
      const isMatch = value === category;
      out[`${params.column}_${category}`] = isMatch ? 1 : 0;
      if (isMatch) seen = true;
    }

    if (!seen) {
      if (params.unseenPolicy === 'error') {
        throw new Error(`applyOneHot: unseen category "${value}" for column "${params.column}"`);
      }
      if (params.unseenPolicy === 'extra-column') {
        out[`${params.column}_unknown`] = 1;
      }
    }

    return out;
  });
}
