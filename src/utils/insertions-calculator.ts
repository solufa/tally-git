import type { Insertions } from '../types';

export const calculateFrontendInsertions = (frontend?: { code: number; test?: number }): number => {
  return (frontend?.code ?? 0) + (frontend?.test ?? 0);
};

export const calculateBackendInsertions = (backend?: { code: number; test?: number }): number => {
  return (backend?.code ?? 0) + (backend?.test ?? 0);
};

export const calculateInfraInsertions = (infra?: { code: number; test?: number }): number => {
  return (infra?.code ?? 0) + (infra?.test ?? 0);
};

export const calculateTotalInsertions = (insertions?: Insertions): number => {
  if (!insertions) return 0;

  return (
    insertions.others +
    calculateFrontendInsertions(insertions.frontend) +
    calculateBackendInsertions(insertions.backend) +
    calculateInfraInsertions(insertions.infra)
  );
};
