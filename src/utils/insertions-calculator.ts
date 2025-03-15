import type { Insertions } from '../types';

export function calculateTypeInsertions(
  typeData?: Readonly<{ code: number; test?: number }>,
): number {
  return (typeData?.code ?? 0) + (typeData?.test ?? 0);
}

export function calculateTotalInsertions(insertions?: Insertions): number {
  if (!insertions) return 0;

  return (
    insertions.others +
    calculateTypeInsertions(insertions.frontend) +
    calculateTypeInsertions(insertions.backend) +
    calculateTypeInsertions(insertions.infra)
  );
}
