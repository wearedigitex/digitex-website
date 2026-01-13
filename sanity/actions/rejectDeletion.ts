import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { XCircle } from 'lucide-react'

export const RejectDeletionAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = (draft || published) as any

    if (!doc) return

    if (doc.status !== 'pending') {
      alert(`This request is already ${doc.status}.`)
      return
    }

    const confirmReject = window.confirm('Are you sure you want to reject this deletion request? The comment will remain on the website.')
    if (!confirmReject) return

    try {
      await client
        .patch(props.id)
        .set({ 
          status: 'rejected',
          reviewedAt: new Date().toISOString()
        })
        .commit()

      props.onComplete()
      alert('Deletion request rejected.')
    } catch (err: any) {
      console.error('Failed to reject deletion:', err)
      alert(`Error: Could not reject deletion. ${err.message}`)
    }
  }

  const isNotPending = !!((props.published?.status && props.published.status !== 'pending') || 
                     (props.draft?.status && props.draft.status !== 'pending'))

  return {
    disabled: isNotPending,
    label: isNotPending ? 'Reviewed' : 'Reject Request',
    icon: XCircle,
    onHandle,
  }
}
