/**
 * Normaliza email para lowercase
 * Emails são case-insensitive, então sempre normalizamos para evitar duplicatas
 */
export function normalizeEmail(email: string): string {
	if (!email) return '';
	return email.trim().toLowerCase();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
	if (!email) return false;
	const normalized = normalizeEmail(email);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(normalized);
}





