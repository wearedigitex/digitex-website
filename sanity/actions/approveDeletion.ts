import { DocumentActionProps, DocumentActionComponent, useClient } from 'sanity'
import { CheckCircle } from 'lucide-react'

export const ApproveDeletionAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({ apiVersion: '2024-01-01' })

  const onHandle = async () => {
    const { draft, published } = props
    const doc = (draft || published) as any

    if (!doc || !doc.comment?._ref) {
        alert('No comment reference found.')
        return
    }

    if (doc.status === 'approved') {
      alert('This deletion request has already been approved.')
      return
    }

    const confirmDeletion = window.confirm('Are you sure you want to approve this deletion? This will permanently delete the comment and ALL its replies from the website.')
    if (!confirmDeletion) return

    try {
      const commentId = doc.comment._ref

      // 1. Fetch the comment to get its post reference
      const comment = await client.fetch(`*[_type == "comment" && _id == $commentId][0]`, { commentId })
      
      if (!comment) {
        alert('The comment already seems to be deleted.')
        // Still mark the request as approved to clean up
        await client.patch(props.id).set({ status: 'approved', reviewedAt: new Date().toISOString() }).commit()
        props.onComplete()
        return
      }

      // 2. Fetch all comments for this post to find descendants
      const allComments = await client.fetch(`*[_type == "comment" && post._ref == $postId]`, { 
        postId: comment.post?._ref 
      })

      // 3. Find all descendant IDs recursively
      const getDescendants = (parentId: string): string[] => {
        const children = allComments.filter((c: any) => c.parentComment?._ref === parentId)
        return children.reduce((acc: string[], child: any) => {
          return [...acc, child._id, ...getDescendants(child._id)]
        }, [])
      }

      const idsToDelete = [commentId, ...getDescendants(commentId)]

      // 4. Start transaction
      const transaction = client.transaction()
      
      // Delete the comments
      idsToDelete.forEach(id => transaction.delete(id))

      // 5. Count auto-approved comments to decrement
      const approvedToDeleteCount = allComments
        .filter((c: any) => idsToDelete.includes(c._id) && c.autoApproved === true)
        .length

      // 6. Update post comment count
      if (comment.post?._ref && approvedToDeleteCount > 0) {
        transaction.patch(comment.post._ref, p => 
          p.setIfMissing({ commentCount: 0 })
           .dec({ commentCount: approvedToDeleteCount })
        )
      }

      // 7. Update the deletion request status
      transaction.patch(props.id, p => 
        p.set({ 
          status: 'approved',
          reviewedAt: new Date().toISOString()
        })
      )

      await transaction.commit()
      
      props.onComplete()
      alert('Comment and its thread deleted successfully.')
    } catch (err: any) {
      console.error('Failed to approve deletion:', err)
      alert(`Error: Could not approve deletion. ${err.message}`)
    }
  }

  const isApproved = props.published?.status === 'approved' || props.draft?.status === 'approved'

  return {
    disabled: !!isApproved,
    label: isApproved ? 'Already Approved' : 'Approve & Delete Comment',
    icon: CheckCircle,
    onHandle,
  }
}
