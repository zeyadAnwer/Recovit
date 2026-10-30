/**
 * Case reference shown to the customer and used as the email subject key,
 * e.g. "RCV-261028-7KQ4". Date part for humans, random part to avoid
 * collisions and guessing. Avoids look-alike characters (0/O, 1/I).
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateCaseRef(date: Date = new Date(), random: () => number = cryptoRandom): string {
  const yy = String(date.getUTCFullYear()).slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? 'X';
  }
  return `RCV-${yy}${mm}${dd}-${suffix}`;
}

export const CASE_REF_PATTERN = /^RCV-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

function cryptoRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) / 2 ** 32;
}
