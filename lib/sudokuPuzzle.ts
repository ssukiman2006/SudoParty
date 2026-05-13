export type PuzzleSet = {
  puzzle: readonly (readonly number[])[];
  solution: readonly (readonly number[])[];
};

const BASE_SOLUTIONS: readonly (readonly (readonly number[])[])[] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9],
  ],
  [
    [5, 8, 1, 6, 7, 2, 4, 3, 9],
    [7, 9, 2, 8, 4, 3, 6, 5, 1],
    [3, 6, 4, 5, 9, 1, 7, 8, 2],
    [4, 3, 8, 9, 5, 7, 2, 1, 6],
    [2, 5, 6, 1, 8, 4, 9, 7, 3],
    [1, 7, 9, 3, 2, 6, 8, 4, 5],
    [8, 4, 5, 2, 1, 9, 3, 6, 7],
    [9, 1, 3, 7, 6, 8, 5, 2, 4],
    [6, 2, 7, 4, 3, 5, 1, 9, 8],
  ],
  [
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [2, 4, 6, 1, 7, 3, 9, 8, 5],
    [3, 5, 1, 9, 2, 8, 7, 4, 6],
    [1, 2, 8, 5, 3, 7, 6, 9, 4],
    [6, 3, 4, 8, 9, 2, 1, 5, 7],
    [7, 9, 5, 4, 6, 1, 8, 3, 2],
    [5, 1, 9, 2, 8, 6, 4, 7, 3],
    [4, 7, 2, 3, 1, 9, 5, 6, 8],
    [8, 6, 3, 7, 4, 5, 2, 1, 9],
  ],
  [
    [1, 2, 6, 4, 3, 7, 9, 5, 8],
    [8, 9, 5, 6, 2, 1, 4, 7, 3],
    [3, 7, 4, 9, 8, 5, 1, 2, 6],
    [4, 5, 7, 1, 9, 3, 8, 6, 2],
    [9, 8, 3, 2, 4, 6, 5, 1, 7],
    [6, 1, 2, 5, 7, 8, 3, 9, 4],
    [2, 6, 9, 3, 1, 4, 7, 8, 5],
    [5, 4, 8, 7, 6, 9, 2, 3, 1],
    [7, 3, 1, 8, 5, 2, 6, 4, 9],
  ],
] as const;

const BLANK_COUNTS = {
  Easy: 32,
  Medium: 42,
  Hard: 52,
  Chaos: 58,
} as const;

function shuffledCellIndexes(seed: number): number[] {
  const cells = Array.from({ length: 81 }, (_, index) => index);
  let state = seed;

  for (let index = cells.length - 1; index > 0; index--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
  }

  return cells;
}

function makePuzzle(solution: readonly (readonly number[])[], blankCount: number, seed: number): number[][] {
  const blanks = new Set(shuffledCellIndexes(seed).slice(0, blankCount));

  return solution.map((row, rowIndex) =>
    row.map((value, colIndex) => (blanks.has(rowIndex * 9 + colIndex) ? 0 : value)),
  );
}

function cloneGrid(grid: readonly (readonly number[])[]): number[][] {
  return grid.map((row) => [...row]);
}

function buildPool(blankCount: number, seedOffset: number): PuzzleSet[] {
  return BASE_SOLUTIONS.map((solution, index) => ({
    puzzle: makePuzzle(solution, blankCount, seedOffset + index + 1),
    solution: cloneGrid(solution),
  }));
}

const EASY: PuzzleSet[] = buildPool(BLANK_COUNTS.Easy, 10);
const MEDIUM: PuzzleSet[] = buildPool(BLANK_COUNTS.Medium, 30);
const HARD: PuzzleSet[] = buildPool(BLANK_COUNTS.Hard, 50);
const CHAOS: PuzzleSet[] = buildPool(BLANK_COUNTS.Chaos, 70);

export function getPuzzle(difficulty: string): PuzzleSet {
  let pool: PuzzleSet[];
  if (difficulty === "Hard") pool = HARD;
  else if (difficulty === "Medium") pool = MEDIUM;
  else if (difficulty === "Chaos") pool = CHAOS;
  else pool = EASY;
  return pool[Math.floor(Math.random() * pool.length)];
}

const defaultPuzzle = getPuzzle("Easy");
export const PUZZLE = defaultPuzzle.puzzle;
export const SOLUTION = defaultPuzzle.solution;
