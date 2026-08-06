import { notFound } from 'next/navigation'

import { getStore } from '@/lib/data'
import { PageTitle } from '@/components/admin/ui'
import { PostForm } from '@/components/admin/PostForm'

export default async function AdminEditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const posts = await getStore().getPosts()
  const post = posts.find((candidate) => candidate.id === id)
  if (!post) notFound()

  return (
    <>
      <PageTitle title={`Edit: ${post.title.id}`} />
      <PostForm post={post} />
    </>
  )
}
