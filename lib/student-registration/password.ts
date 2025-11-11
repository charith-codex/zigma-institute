import crypto from "node:crypto";

const DEFAULT_ALPHABET =
  "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@$?";

export const DEFAULT_PASSWORD_LENGTH = 12;

export function generateRandomPassword(
  length: number = DEFAULT_PASSWORD_LENGTH,
  alphabet: string = DEFAULT_ALPHABET
): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Password length must be a positive integer");
  }

  if (alphabet.length === 0) {
    throw new Error("Alphabet must contain at least one character");
  }

  const randomBytes = crypto.randomBytes(length);
  const characters: string[] = [];

  for (let index = 0; index < length; index += 1) {
    const byte = randomBytes[index] ?? 0;
    const charIndex = byte % alphabet.length;
    characters.push(alphabet[charIndex] ?? alphabet[0]!);
  }

  return characters.join("");
}
