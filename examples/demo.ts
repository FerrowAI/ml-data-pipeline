import { Dataset, Pipeline, trainTestSplit } from '../src/index';

const data: Dataset = [
  { age: 20, city: 'NY' },
  { age: 30, city: 'LA' },
  { age: 40, city: 'NY' },
  { age: 50, city: 'SF' },
  { age: 60, city: 'LA' },
  { age: 70, city: 'NY' },
  { age: 80, city: 'SF' },
  { age: 90, city: 'LA' },
];

const { train, test } = trainTestSplit(data, 0.75, 7);

const pipeline = new Pipeline().minmax('age');
pipeline.fit(train);

const testTransformed = pipeline.transform(test);

const trainAges = train.map((r) => r.age as number);
const trainMin = Math.min(...trainAges);
const trainMax = Math.max(...trainAges);

// Manually recompute expected values using ONLY the train-fit min/max, prove the pipeline
// used those saved params (not test's own min/max) when transforming test.
const expected = test.map((r) => ((r.age as number) - trainMin) / (trainMax - trainMin));

console.log(`train ages: [${trainAges.join(', ')}]  (min=${trainMin}, max=${trainMax})`);
console.log(`test raw ages: [${test.map((r) => r.age).join(', ')}]`);
console.log(`test normalized (via pipeline): [${testTransformed.map((r) => r.age).join(', ')}]`);
console.log(
  `matches manual TRAIN-param calc: ${JSON.stringify(testTransformed.map((r) => r.age)) === JSON.stringify(expected)}`
);
console.log(`serialized fitted params: ${pipeline.toJSON()}`);
