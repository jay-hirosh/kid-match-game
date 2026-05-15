export const generateRound = (maxNumber = 10, numOptions = 6) => {
  // 1. Pick a target number
  const targetNumber = Math.floor(Math.random() * maxNumber) + 1;
  
  // 2. Generate options (must include targetNumber)
  const options = new Set();
  options.add(targetNumber);

  while (options.size < numOptions) {
    const wrongNumber = Math.floor(Math.random() * maxNumber) + 1;
    options.add(wrongNumber);
  }

  // 3. Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return {
    targetNumber,
    options: shuffledOptions,
  };
};
