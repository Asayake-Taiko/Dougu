// chunk the equipment into groups of size
export const chunkArray = <T>(items: T[], size: number) =>
  items.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, items.slice(i, i + size)]),
    [] as T[][],
  );