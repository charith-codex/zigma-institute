import crypto from "node:crypto";

export const DEFAULT_PASSWORD_LENGTH = 12;

export function generateRandomPassword(
  length: number = DEFAULT_PASSWORD_LENGTH
): string {
  if (length < 8) {
    throw new Error(
      "Password length must be at least 8 to satisfy security rules"
    );
  }

  const uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@$?";
  const allChars = uppercase + lowercase + numbers + symbols;

  // Guarantee at least one of each required type
  const required = [
    uppercase[crypto.randomInt(0, uppercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    numbers[crypto.randomInt(0, numbers.length)],
  ];

  // Fill the rest randomly
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => {
    return allChars[crypto.randomInt(0, allChars.length)];
  });

  // Shuffle the result
  const result = [...required, ...remaining];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }

  return result.join("");
}
