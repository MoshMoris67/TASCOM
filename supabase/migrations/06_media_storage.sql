-- ============================================================================
-- 06  MEDIA STORAGE          snippet name: MEDIA STORAGE
-- Owns: the `media` storage bucket + its storage.objects policies
-- Idempotent: YES — safe to re-run any number of times
-- ============================================================================
--
-- IF YOU ARE SEEING "Bucket not found" IN THE ADMIN MEDIA LIBRARY: this snippet
-- has never been run. The file existing in the repo does nothing. Paste it into
-- the Supabase SQL editor and run it. See 00_README.md — snippets have no
-- history, so the only way to know what is deployed is to ask the database.

-- 1. The bucket. Public, because the gallery is public.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 2. Policies. Dropped first so re-running never errors on "already exists" —
--    this is what made the original version of this snippet a one-shot.
drop policy if exists "admins upload media files"  on storage.objects;
drop policy if exists "admins update media files"  on storage.objects;
drop policy if exists "admins delete media files"  on storage.objects;
drop policy if exists "public read media files"    on storage.objects;

create policy "admins upload media files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "admins update media files"
  on storage.objects for update to authenticated
  using       (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
  with check  (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "admins delete media files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "public read media files"
  on storage.objects for select
  using (bucket_id = 'media');

-- 3. Verify. Both columns must read `t` before you retry the upload.
select
  exists (select 1 from storage.buckets where id = 'media' and public)      as bucket_ready,
  (select count(*) = 4 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname like '%media files%')                                 as policies_ready;
