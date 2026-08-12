export type CellValue = string | number | null;
export type Row = Record<string, CellValue>;
export type Dataset = Row[];
export type ColumnType = 'numeric' | 'categorical';
