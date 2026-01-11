import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { CheckCircle } from 'lucide-react'

export const ApproveSubmissionAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = draft || published

    if (!doc) return

    try {
      // 1. Create the new "post" document
      const newPost = {
        _type: 'post',
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        publishedAt: new Date().toISOString(),
        author: doc.author,
        mainImage: doc.mainImage,
        excerpt: doc.excerpt,
        body: doc.body,
        viewCount: 0,
        commentCount: 0,
      }

      const createdPost = await client.create(newPost)

      // 2. Update the submission status to "published"
      await client
        .patch(props.id)
        .set({ 
          status: 'published',
          reviewedAt: new Date().toISOString()
        })
        .commit()

      // 3. Trigger email notification (via API)
      // Note: In a production app, you might use a Sanity webhook or background task
      // For now, we'll assume the status change triggers the notification elsewhere
      // or we can call the API directly if we had a secret token accessible here.

      props.onComplete()
      alert('Article published successfully!')
    } catch (err) {
      console.error('Failed to approve submission:', err)
      alert('Error: Could not approve submission.')
    }
  }

  return {
    disabled: props.published?.status === 'published' || props.draft?.status === 'published',
    label: 'Approve & Publish',
    icon: CheckCircle,
    onHandle,
  }
}
