import Link from 'next/link'

import { getStore } from '@/lib/data'
import { deletePostAction } from '@/app/admin/actions'
import { Card, PageTitle, StatusBadge } from '@/components/admin/ui'

export default async function AdminBlogPage() {
  const posts = await getStore().getPosts()

  return (
    <>
      <PageTitle
        title="Tips Bisnis"
        subtitle="Kelola artikel blog dalam dua bahasa"
        action={
          <Link
            href="/admin/blog/baru"
            className="rounded-[var(--radius-pill)] bg-[var(--brand-700)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-800)]"
          >
            + Artikel Baru
          </Link>
        }
      />

      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <tr>
              <th className="px-5 py-3.5">Judul</th>
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                  Belum ada artikel.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--brand-900)]">{post.title.id}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4">{post.publishedAt}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-xs font-semibold text-[var(--brand-600)] hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-[var(--color-danger)] hover:underline"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
