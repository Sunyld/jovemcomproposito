import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from './Toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

type Props = {
	bucket: 'mentorias-docs' | 'avatars' | 'covers';
	onUploaded: (path: string, publicUrl?: string) => void;
	accept?: string;
	maxSizeMb?: number;
	showPreview?: boolean;
	currentFile?: string | null;
};

export default function FileUploader({ 
	bucket, 
	onUploaded, 
	accept = '.pdf,.docx,.pptx,.png,.jpg,.jpeg', 
	maxSizeMb = 10,
	showPreview = false,
	currentFile = null
}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(currentFile || null);

	const isImage = accept.includes('image') || accept.includes('.png') || accept.includes('.jpg') || accept.includes('.jpeg');

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		
		// Validate file size
		if (file.size > maxSizeMb * 1024 * 1024) {
			toast({ title: 'Arquivo muito grande', description: `Máximo ${maxSizeMb}MB`, variant: 'error' });
			return;
		}

		// Show preview for images
		if (isImage && showPreview) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}

		try {
			setUploading(true);
			setProgress(10);
			
			// Get current user
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				throw new Error('Usuário não autenticado');
			}
			
			// Generate unique file path with user ID to avoid conflicts
			const fileExt = file.name.split('.').pop();
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(7);
			const fileName = `${user.id}/${timestamp}_${random}.${fileExt}`;
			const filePath = fileName;

			setProgress(30);
			
			// Upload file
			const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { 
				upsert: false,
				cacheControl: '3600',
				contentType: file.type,
			});
			
			if (uploadError) {
				// If file exists, try with different name
				if (uploadError.message.includes('already exists')) {
					const newFileName = `${user.id}/${timestamp}_${random}_${Date.now()}.${fileExt}`;
					const { error: retryError } = await supabase.storage.from(bucket).upload(newFileName, file, {
						upsert: false,
						cacheControl: '3600',
						contentType: file.type,
					});
					if (retryError) throw retryError;
					const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(newFileName);
					setProgress(100);
					toast({ title: 'Upload concluído', variant: 'success' });
					onUploaded(newFileName, pubData?.publicUrl);
					return;
				}
				throw uploadError;
			}
			
			setProgress(70);
			
			// Get public URL
			const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filePath);
			const publicUrl = pubData?.publicUrl;
			
			setProgress(100);
			toast({ title: 'Upload concluído', variant: 'success' });
			onUploaded(filePath, publicUrl);
		} catch (err: any) {
			toast({ 
				title: 'Falha no upload', 
				description: err?.message ?? 'Erro ao fazer upload do arquivo. Verifique se o arquivo não é muito grande e tente novamente.', 
				variant: 'error' 
			});
			if (showPreview && isImage) {
				setPreview(null);
			}
		} finally {
			setUploading(false);
			setTimeout(() => setProgress(0), 500);
			if (inputRef.current) inputRef.current.value = '';
		}
	}

	function handleRemove() {
		setPreview(null);
		if (inputRef.current) inputRef.current.value = '';
		onUploaded('', '');
	}

	return (
		<div className="space-y-3">
			{showPreview && preview && isImage ? (
				<div className="relative">
					<img 
						src={preview} 
						alt="Preview" 
						className="w-full h-48 sm:h-64 rounded-xl object-cover border border-white/10"
					/>
					<button
						type="button"
						onClick={handleRemove}
						className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition"
						aria-label="Remover imagem"
					>
						<X size={16} />
					</button>
				</div>
			) : null}
			
			<div className="space-y-2">
				<label className="block">
					<input 
						ref={inputRef} 
						type="file" 
						accept={accept} 
						onChange={handleChange}
						disabled={uploading}
						className="hidden"
					/>
					<div className={`
						flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 dark:border-white/10
						${uploading 
							? 'opacity-50 cursor-not-allowed bg-surface/30 dark:bg-white/[0.03]' 
							: 'cursor-pointer hover:border-white/20 dark:hover:border-white/20 bg-surface/30 dark:bg-white/[0.03] transition'
						}
					`}>
						{uploading ? (
							<>
								<div className="h-4 w-4 border-2 border-purple border-t-transparent rounded-full animate-spin" />
								<span className="text-sm text-text-secondary">Enviando... {progress}%</span>
							</>
						) : (
							<>
								{isImage ? <ImageIcon size={18} className="text-text-secondary" /> : <Upload size={18} className="text-text-secondary" />}
								<span className="text-sm text-text-primary">
									{preview ? 'Trocar arquivo' : 'Selecionar arquivo'}
								</span>
							</>
						)}
					</div>
				</label>
				
				{uploading && (
					<div className="h-2 w-full rounded-full bg-surface/50 dark:bg-white/5 overflow-hidden">
						<div 
							className="h-full bg-purple transition-all duration-300" 
							style={{ width: `${progress}%` }} 
						/>
					</div>
				)}
				
				{!uploading && (
					<p className="text-xs text-text-secondary">
						Formatos aceitos: {accept.replace(/\./g, '').replace(/,/g, ', ')} • Máximo: {maxSizeMb}MB
					</p>
				)}
			</div>
		</div>
	);
}


