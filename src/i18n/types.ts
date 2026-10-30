import type { ar } from './ar';

/**
 * Turns the literal types of the reference dictionary into plain `string`s
 * while keeping its exact key structure, so other languages must provide the
 * same keys (no more, no fewer) but can of course use different text.
 */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof ar>;
