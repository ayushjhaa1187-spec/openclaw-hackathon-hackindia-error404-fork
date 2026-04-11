/**
 * Convert a Firebase UID (non-UUID string) to a deterministic UUID v4-format string.
 * This ensures compatibility with Supabase tables that have UUID-typed id columns.
 * @param {string} uid - Firebase UID
 * @returns {string} - Valid UUID-format string
 */
export const firebaseUidToUuid = (uid) => {
  // Convert any non-hex chars to their charCode hex, pad/trim to 32 chars
  const hex = uid
    .replace(/[^a-fA-F0-9]/g, (c) => c.charCodeAt(0).toString(16))
    .padEnd(32, '0')
    .substring(0, 32)
  // Format as UUID: 8-4-4-4-12
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '4' + hex.slice(13, 16),
    'a' + hex.slice(17, 20),
    hex.slice(20, 32)
  ].join('-')
}