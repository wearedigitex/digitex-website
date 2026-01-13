import { defineField, defineType } from 'sanity'
import { Trash2 } from 'lucide-react'

export const deleteRequest = defineType({
  name: 'deleteRequest',
  title: 'Comment Deletion Request',
  type: 'document',
  icon: Trash2,
  fields: [
    defineField({
      name: 'comment',
      title: 'Comment to Delete',
      type: 'reference',
      to: [{ type: 'comment' }],
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'commentContent',
      title: 'Comment Content',
      type: 'text',
      description: 'Snapshot of the comment content for reference',
      readOnly: true,
    }),
    defineField({
      name: 'requesterEmail',
      title: 'Requester Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
      readOnly: true,
    }),
    defineField({
      name: 'reason',
      title: 'Reason for Deletion',
      type: 'text',
      initialValue: 'No reason provided',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Requested At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      email: 'requesterEmail',
      status: 'status',
      content: 'commentContent',
    },
    prepare({ email, status, content }) {
      const statusEmoji = status === 'pending' ? '⏳' : status === 'approved' ? '✅' : '❌'
      return {
        title: `${email} ${statusEmoji}`,
        subtitle: content ? content.substring(0, 50) : 'No content',
      }
    },
  },
})
