export interface Unit {
  kind: 'heading' | 'text';
  text: string;
}
export interface PageUnits {
  url: string;
  lang: string;
  units: Unit[];
}
export interface Duplicate {
  text: string;
  first: string;
  second: string;
  other: string;
}
export function extractUnitsInPage(): Unit[];
export function normalize(text: string): string;
export function findDuplicates(
  pages: PageUnits[],
  options?: { minWords?: number; nearThreshold?: number },
): { exact: Duplicate[]; near: Duplicate[] };
