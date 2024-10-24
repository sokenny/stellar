const minMaxMapper = {
  'h1 Experiment': [12, 20],
  'cta Experiment': [8, 17],
  'description Experiment': [5, 13],
  'biggestText Experiment': [10, 21],
  [undefined]: [8, 13],
};

function getRandomConversionRate({ seed, experimentType = undefined }) {
  // Parameters for the LCG algorithm
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  // Create a pseudorandom number from the seed
  seed = (a * seed + c) % m;

  // Scale the result to the range [10, 30]
  const min = minMaxMapper[experimentType][0];
  const max = minMaxMapper[experimentType][1];
  return Math.floor(min + (seed / m) * (max - min + 1));
}

export default getRandomConversionRate;
