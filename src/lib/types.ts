export type Profile = {
	id: string;
	full_name: string | null;
	role: 'visitor' | 'user' | 'mentor' | 'admin';
	avatar_url: string | null;
	is_mentor_approved: boolean;
	bio?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type MentorCard = {
	id: string;
	name: string;
	area: string;
	avatar_url: string;
	is_approved: boolean;
};

export type Mentoria = {
	id: string;
	title: string;
	description: string;
	mentor_id: string;
	cover_url: string | null;
	price: number;
	currency?: string;
	type: 'online' | 'presencial' | 'documento';
	external_link?: string | null;
	document_path?: string | null;
	published: boolean;
	category_id?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type Category = {
	id: string;
	name: string;
	slug: string;
	created_at?: string;
	updated_at?: string;
};

export type Inscrito = {
	id: string;
	user_id: string;
	mentoria_id: string;
	message?: string | null;
	has_access: boolean;
	payment_status: 'pending' | 'paid' | 'failed';
	created_at: string;
	updated_at?: string;
};

export type Feedback = {
	id: string;
	user_id: string;
	mentoria_id: string;
	rating: number;
	comment?: string | null;
	created_at: string;
	updated_at?: string;
};

export type Notification = {
	id: string;
	user_id: string;
	type: 'inscricao' | 'aprovacao' | 'feedback' | 'sistema' | 'devocional';
	title: string;
	message: string;
	read: boolean;
	created_at: string;
	link?: string | null;
};

export type Donation = {
	id: string;
	title: string;
	description: string;
	detail: string;
	reference: string;
	created_at: string;
	updated_at: string;
};

export type Devocional = {
	id: string;
	title: string;
	content: string;
	day_number: number;
	scheduled_date: string | null;
	published: boolean;
	published_at: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
};

export type Projeto = {
	id: string;
	title: string;
	description: string;
	cover_url: string | null;
	type: 'voluntariado' | 'projeto-pratico' | 'comunidade';
	status: 'aberto' | 'fechado' | 'concluido';
	max_volunteers: number | null;
	created_by: string;
	created_at: string;
	updated_at: string;
};

export type ProjetoInscricao = {
	id: string;
	projeto_id: string;
	user_id: string;
	message: string | null;
	status: 'pendente' | 'aprovado' | 'rejeitado';
	created_at: string;
	updated_at: string;
};


