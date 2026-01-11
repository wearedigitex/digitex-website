import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { XCircle } from 'lucide-react'

export const RejectSubmissionAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = draft || published

    if (!doc) return

    const notes = window.prompt('Please provide review notes for the contributor:')
    if (notes === null) return // Cancelled

    try {
      await client
        .patch(props.id)
        .set({ 
          status: 'rejected',
          reviewNotes: notes,
          reviewedAt: new Date().toISOString()
        })
        .commit()

      props.onComplete()
      alert('Submission rejected.')
    } catch (err) {
      console.error('Failed to reject submission:', err)
      alert('Error: Could not reject submission.')
    }
  }

  return {
    disabled: props.published?.status === 'published' || props.draft?.status === 'published',
    label: 'Reject Submission',
    icon: XCircle,
    onHandle,
  }
}
