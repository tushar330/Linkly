
export function calculateExpiry(expiresIn) {
  if (!expiresIn || expiresIn === "never") return null;

  const value = parseInt(expiresIn);
  const unit = expiresIn.slice(-1);

  const now = new Date();

  if (unit === "h") now.setHours(now.getHours() + value);
  else if (unit === "d") now.setDate(now.getDate() + value);
  else if (unit === "m") now.setMinutes(now.getMinutes() + value);
  else return null; // Default to null if format is weird or "never"

  return now;
}
