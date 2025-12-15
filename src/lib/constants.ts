// Storage keys
export const DONATIONS_STORAGE_KEY = 'jcp_donations';

// Storage buckets
export const STORAGE_BUCKETS = {
	COVERS: 'covers',
	AVATARS: 'avatars',
	MENTORIAS_DOCS: 'mentorias-docs',
} as const;

// Redirect URLs for OAuth
export const REDIRECT_URLS = {
	VERIFY_EMAIL: '/verify-email',
	RESET_PASSWORD: '/reset-password',
	OAUTH_CALLBACK: window.location.origin,
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
	MAX_SIZE_MB: 10,
	IMAGE_MAX_SIZE_MB: 5,
	DOCUMENT_MAX_SIZE_MB: 20,
} as const;

// Accepted file types
export const ACCEPTED_FILES = {
	IMAGES: '.png,.jpg,.jpeg,.webp',
	DOCUMENTS: '.pdf,.docx,.pptx',
	ALL: '.png,.jpg,.jpeg,.webp,.pdf,.docx,.pptx',
} as const;

export type DonationMethod = {
	id: string;
	title: string;
	description: string;
	detail: string;
	reference: string;
};

export const defaultDonationMethods: DonationMethod[] = [
	{
		id: 'mpesa',
		title: 'M-Pesa',
		description: 'Conta empresarial',
		detail: '84 123 456 789',
		reference: 'Jovem c/ Propósito',
	},
	{
		id: 'emola',
		title: 'e-Mola',
		description: 'Conta pessoal',
		detail: '86 987 654 321',
		reference: 'JCP Ministry',
	},
	{
		id: 'banco',
		title: 'Conta Bancária',
		description: 'BCI · IBAN',
		detail: '0002 0034 0000 1234 567 89',
		reference: 'IBAN: MZ59 0002 0034 0000 1234 56789 00',
	},
	{
		id: 'cartao',
		title: 'Visa / Mastercard',
		description: 'Pagamento internacional',
		detail: 'Link seguro via e-mail',
		reference: 'Solicite detalhes ao time',
	},
];


