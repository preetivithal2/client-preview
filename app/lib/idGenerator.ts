// lib/idGenerator.ts
// Generates unique job IDs in format: sm-YYMMDDxxx
// Example: sm-260710001

let counter = 0;
const MAX_COUNTER = 999;

function pad(num: number, len: number): string {
  return String(num).padStart(len, '0');
}

export function generateJobId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = pad(now.getMonth() + 1, 2);
  const dd = pad(now.getDate(), 2);
  const datePart = `${yy}${mm}${dd}`;

  // Use last 3 digits of timestamp for millisecond precision
  const ms = now.getMilliseconds();
  const msPart = pad(ms, 3);

  // Combine with counter to avoid collisions within the same ms
  counter = (counter + 1) % MAX_COUNTER;
  const counterPart = pad(counter, 3);

  // Take first 3 chars from ms+ counter combo for the xxx portion
  const unique = String(Number(msPart) + counter).slice(-3).padStart(3, '0');

  return `sm-${datePart}${unique}`;
}
