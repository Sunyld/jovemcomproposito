-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mentorias-docs', 'mentorias-docs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for covers (public read, authenticated write)
DROP POLICY IF EXISTS "Covers are publicly readable" ON storage.objects;
create policy "Covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'covers');

DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
create policy "Authenticated users can upload covers"
  on storage.objects for insert
  with check (
    bucket_id = 'covers' and
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own covers" ON storage.objects;
create policy "Users can update own covers"
  on storage.objects for update
  using (
    bucket_id = 'covers' and
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete own covers" ON storage.objects;
create policy "Users can delete own covers"
  on storage.objects for delete
  using (
    bucket_id = 'covers' and
    auth.role() = 'authenticated'
  );

-- Storage policies for mentorias-docs (private, signed URLs)
DROP POLICY IF EXISTS "Mentors can upload documents" ON storage.objects;
create policy "Mentors can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'mentorias-docs' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from profiles
      where id = auth.uid() and (role = 'mentor' or role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users with access can read documents" ON storage.objects;
create policy "Users with access can read documents"
  on storage.objects for select
  using (
    bucket_id = 'mentorias-docs' and
    (
      -- Admin or mentor who owns the mentoria
      exists (
        select 1 from mentorias m
        where m.document_path = storage.objects.name
        and (
          m.mentor_id = auth.uid() or
          exists (
            select 1 from profiles
            where id = auth.uid() and role = 'admin'
          )
        )
      ) or
      -- User with approved inscricao
      exists (
        select 1 from mentorias m
        join inscritos i on i.mentoria_id = m.id
        where m.document_path = storage.objects.name
        and i.user_id = auth.uid()
        and i.has_access = true
      )
    )
  );

-- Storage policies for avatars (public read, authenticated write)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

