import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { CheckCircle } from 'lucide-react'

export const ApproveSubmissionAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = (draft || published) as any

    if (!doc) return

    // Double check if already published to prevent double-click issues
    if (doc.status === 'published') {
      alert('This article is already published.')
      return
    }

    const confirmPublish = window.confirm('Are you sure you want to approve and publish this article?')
    if (!confirmPublish) return

    try {
      // Check if a post with this slug already exists to prevent duplicates
      const existingPost = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug: doc.slug.current }
      )

      if (existingPost) {
        const proceed = window.confirm('A post with this slug already exists. Do you want to overwrite it or cancel? (OK to overwrite, Cancel to stop)')
        if (!proceed) {
          props.onComplete()
          return
        }
      }

      // 1. Prepare the new "post" document
      const newPost: any = {
        _type: 'post',
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        publishedAt: new Date().toISOString(),
        author: doc.author,
        mainImage: doc.mainImage,
        excerpt: doc.excerpt,
        body: doc.body,
        bodyHtml: doc.bodyHtml,
        viewCount: 0,
        commentCount: 0,
      }

      if (existingPost) {
        // Overwrite existing post
        await client.patch(existingPost._id).set(newPost).commit()
      } else {
        // Create new post
        await client.create(newPost)
      }

      // 2. Update the submission status to "published"
      await client
        .patch(props.id)
        .set({ 
          status: 'published',
          reviewedAt: new Date().toISOString()
        })
        .commit()

      props.onComplete()
      alert('Article published successfully!')
    } catch (err) {
      console.error('Failed to approve submission:', err)
      alert('Error: Could not approve submission.')
    }
  }

  const isPublished = props.published?.status === 'published' || props.draft?.status === 'published'

  return {
    disabled: isPublished,
    label: isPublished ? 'Published' : 'Approve & Publish',
    icon: CheckCircle,
    onHandle,
  }
}
