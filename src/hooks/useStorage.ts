import { supabase } from '../lib/supabaseClient';
import { toast } from '../components/Toast';

export type Bucket = 'covers' | 'mentorias-docs' | 'avatars';

export async function uploadFile(bucket: Bucket, path: string, file: File) {
	const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
		cacheControl: '3600',
		upsert: false,
	});

	if (error) {
		toast({ title: 'Erro no upload', description: error.message, variant: 'error' });
		throw error;
	}

	return data;
}

export function getPublicUrl(bucket: Bucket, path: string) {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}

export async function getSignedUrl(bucket: Bucket, path: string, expiresIn: number = 3600) {
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

	if (error) {
		toast({ title: 'Erro ao gerar URL', description: error.message, variant: 'error' });
		throw error;
	}

	return data.signedUrl;
}

export async function deleteFile(bucket: Bucket, path: string) {
	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) {
		toast({ title: 'Erro ao deletar arquivo', description: error.message, variant: 'error' });
		throw error;
	}
}








