/**
 * Generates a unique student ID
 * Format: ONLS-YYYY-XXXXX (e.g., ONLS-2025-A7B3D)
 * Combines letters and numbers for uniqueness
 */
export function generateStudentId() {
  const currentYear = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  // Generate 5-character unique identifier
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ONLS-${currentYear}-${result}`;
}

/**
 * Validates a student ID format
 */
export function isValidStudentId(studentId) {
  const pattern = /^ONLS-\d{4}-[A-Z0-9]{5}$/;
  return pattern.test(studentId);
}
