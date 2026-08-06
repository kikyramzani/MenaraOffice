import type { Post } from '@/lib/data/types'
import { savePostAction } from '@/app/admin/actions'
import { adminInputClass, Card, Field, SubmitButton } from '@/components/admin/ui'

/** Shared create/edit form for blog posts (server component). */
export function PostForm({ post }: { post: Post | null }) {
  return (
    <form action={savePostAction} className="grid max-w-4xl gap-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Judul (Indonesia)" htmlFor="title_id">
            <input id="title_id" name="title_id" defaultValue={post?.title.id} required className={adminInputClass} />
          </Field>
          <Field label="Judul (English)" htmlFor="title_en">
            <input id="title_en" name="title_en" defaultValue={post?.title.en} required className={adminInputClass} />
          </Field>
          <Field label="Slug URL" htmlFor="slug" hint="Contoh: tips-memilih-virtual-office">
            <input id="slug" name="slug" defaultValue={post?.slug} required className={adminInputClass} />
          </Field>
          <Field label="URL cover" htmlFor="cover" hint="Path lokal (/images/…) atau URL https">
            <input id="cover" name="cover" defaultValue={post?.cover} className={adminInputClass} />
          </Field>
          <Field label="Ringkasan (Indonesia)" htmlFor="excerpt_id">
            <textarea id="excerpt_id" name="excerpt_id" rows={3} defaultValue={post?.excerpt.id} className={adminInputClass} />
          </Field>
          <Field label="Ringkasan (English)" htmlFor="excerpt_en">
            <textarea id="excerpt_en" name="excerpt_en" rows={3} defaultValue={post?.excerpt.en} className={adminInputClass} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          <Field label="Konten (Indonesia)" htmlFor="content_id" hint="Format markdown: ## judul, **tebal**, daftar dengan - atau 1.">
            <textarea id="content_id" name="content_id" rows={12} defaultValue={post?.content.id} required className={adminInputClass} />
          </Field>
          <Field label="Konten (English)" htmlFor="content_en">
            <textarea id="content_en" name="content_en" rows={12} defaultValue={post?.content.en} className={adminInputClass} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Tanggal terbit" htmlFor="publishedAt">
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={post?.publishedAt ?? new Date().toISOString().slice(0, 10)}
              className={adminInputClass}
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={post?.status ?? 'draft'} className={adminInputClass}>
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <SubmitButton>{post ? 'Simpan Perubahan' : 'Buat Artikel'}</SubmitButton>
        </div>
      </Card>
    </form>
  )
}
