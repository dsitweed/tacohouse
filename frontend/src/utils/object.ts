export function typedEntries<T extends object>(object: T) {
  return Object.entries(object) as [keyof T, T[keyof T]][];
}
