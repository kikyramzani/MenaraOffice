import { PageTitle } from '@/components/admin/ui'
import { PostForm } from '@/components/admin/PostForm'

export default function AdminNewPostPage() {
  return (
    <>
      <PageTitle title="Artikel Baru" subtitle="Tulis artikel Tips Bisnis dalam dua bahasa" />
      <PostForm post={null} />
    </>
  )
}
