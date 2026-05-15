export const ANIMALS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];

export const getRandomAnimal = () => {
  const index = Math.floor(Math.random() * ANIMALS.length);
  return ANIMALS[index];
};

export const generateRound = (maxNumber = 5, numOptions = 3) => {
  // 1. Pick a target number
  const targetNumber = Math.floor(Math.random() * maxNumber) + 1;
  
  // 2. Pick a random animal for this round
  const animal = getRandomAnimal();

  // 3. Generate options (must include targetNumber)
  const options = new Set();
  options.add(targetNumber);

  while (options.size < numOptions) {
    const wrongNumber = Math.floor(Math.random() * maxNumber) + 1;
    options.add(wrongNumber);
  }

  // 4. Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return {
    targetNumber,
    animal,
    options: shuffledOptions,
  };
};
