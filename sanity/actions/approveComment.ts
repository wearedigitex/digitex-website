import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { CheckCircle } from 'lucide-react'

export const ApproveCommentAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = (draft || published) as any

    if (!doc) return

    if (doc.approved === true && doc.autoApproved === true) {
      alert('This comment is already approved and counted.')
      return
    }

    const confirmApprove = window.confirm('Are you sure you want to approve this comment? This will make it visible on the website and increment the post comment count.')
    if (!confirmApprove) return

    try {
      // 1. Start transaction
      const transaction = client.transaction()

      // 2. Mark comment as approved and autoApproved (to mark it as counted)
      transaction.patch(props.id, p => 
        p.set({ 
          approved: true,
          autoApproved: true 
        })
      )

      // 3. Increment comment count on the referenced post
      if (doc.post?._ref) {
        transaction.patch(doc.post._ref, p => 
          p.setIfMissing({ commentCount: 0 })
           .inc({ commentCount: 1 })
        )
      }

      await transaction.commit()
      
      props.onComplete()
      alert('Comment approved and count updated!')
    } catch (err: any) {
      console.error('Failed to approve comment:', err)
      alert(`Error: Could not approve comment. ${err.message}`)
    }
  }

  const isCounted = (props.published?.approved && props.published?.autoApproved) || 
                    (props.draft?.approved && props.draft?.autoApproved)

  return {
    disabled: !!isCounted,
    label: isCounted ? 'Approved & Counted' : 'Approve Comment',
    icon: CheckCircle,
    onHandle,
  }
}
