/** Which spot illustration represents each service icon. */
import type { IconName } from '../icons';

export const SPOT_NAMES = [
  'isolate',
  'timeline',
  'restore',
  'recoverDeleted',
  'database',
  'cloud',
  'harden',
] as const;
export type SpotName = (typeof SPOT_NAMES)[number];

const SPOT_FOR_ICON: Partial<Record<IconName, SpotName>> = {
  fileLock: 'restore',
  fileRestore: 'recoverDeleted',
  timeline: 'timeline',
  database: 'database',
  cloud: 'cloud',
  layers: 'harden',
};

export function spotFor(icon: IconName): SpotName {
  return SPOT_FOR_ICON[icon] ?? 'restore';
}
