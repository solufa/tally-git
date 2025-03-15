export function isValidContributor(value: number, contributor: string | undefined): boolean {
  return value > 0 && typeof contributor === 'string';
}
