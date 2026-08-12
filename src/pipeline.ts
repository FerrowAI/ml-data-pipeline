import { CellValue, Dataset } from './types';
import { ImputeParams, ImputeStrategy, applyImpute, fitImpute } from './impute';
import { MinMaxParams, ZScoreParams, applyMinMax, applyZScore, fitMinMax, fitZScore } from './scale';
import { OneHotParams, UnseenPolicy, applyOneHot, fitOneHot } from './onehot';

type StepConfig =
  | { type: 'impute'; column: string; strategy: ImputeStrategy; constantValue?: CellValue }
  | { type: 'minmax'; column: string }
  | { type: 'zscore'; column: string }
  | { type: 'onehot'; column: string; unseenPolicy?: UnseenPolicy };

type StepParams = ImputeParams | MinMaxParams | ZScoreParams | OneHotParams;

interface FittedStep {
  config: StepConfig;
  params: StepParams;
}

/** Chains preprocessing steps. `.fit(train)` computes and stores each step's params (in order,
 *  applying prior steps first) — `.transform(anyData)` replays those SAVED params, never
 *  recomputing from the data passed to transform. That split is what prevents test-set leakage. */
export class Pipeline {
  private steps: StepConfig[] = [];
  private fitted: FittedStep[] = [];

  impute(column: string, strategy: ImputeStrategy, constantValue?: CellValue): this {
    this.steps.push({ type: 'impute', column, strategy, constantValue });
    return this;
  }

  minmax(column: string): this {
    this.steps.push({ type: 'minmax', column });
    return this;
  }

  zscore(column: string): this {
    this.steps.push({ type: 'zscore', column });
    return this;
  }

  onehot(column: string, unseenPolicy?: UnseenPolicy): this {
    this.steps.push({ type: 'onehot', column, unseenPolicy });
    return this;
  }

  /** Computes params for each configured step from `data`, in order. */
  fit(data: Dataset): this {
    this.fitted = [];
    let current = data;
    for (const step of this.steps) {
      let params: StepParams;
      switch (step.type) {
        case 'impute':
          params = fitImpute(current, step.column, step.strategy, step.constantValue);
          current = applyImpute(current, params);
          break;
        case 'minmax':
          params = fitMinMax(current, step.column);
          current = applyMinMax(current, step.column, params);
          break;
        case 'zscore':
          params = fitZScore(current, step.column);
          current = applyZScore(current, step.column, params);
          break;
        case 'onehot':
          params = fitOneHot(current, step.column, { unseenPolicy: step.unseenPolicy });
          current = applyOneHot(current, params);
          break;
      }
      this.fitted.push({ config: step, params });
    }
    return this;
  }

  /** Applies the SAVED (fit-time) params to `data` — safe to call on train, test, or new data. */
  transform(data: Dataset): Dataset {
    let current = data;
    for (const step of this.fitted) {
      switch (step.config.type) {
        case 'impute':
          current = applyImpute(current, step.params as ImputeParams);
          break;
        case 'minmax':
          current = applyMinMax(current, step.config.column, step.params as MinMaxParams);
          break;
        case 'zscore':
          current = applyZScore(current, step.config.column, step.params as ZScoreParams);
          break;
        case 'onehot':
          current = applyOneHot(current, step.params as OneHotParams);
          break;
      }
    }
    return current;
  }

  toJSON(): string {
    return JSON.stringify(this.fitted);
  }

  static fromJSON(json: string): Pipeline {
    const fitted = JSON.parse(json) as FittedStep[];
    const pipeline = new Pipeline();
    pipeline.steps = fitted.map((f) => f.config);
    pipeline.fitted = fitted;
    return pipeline;
  }
}
