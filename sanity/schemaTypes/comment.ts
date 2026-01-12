import { defineField, defineType } from 'sanity'

export const comment = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'Reference to parent comment for threading/replies',
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isTeamMember',
      title: 'Is Team Member',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this comment is from a verify team member',
    }),
    defineField({
      name: 'autoApproved',
      title: 'Auto-Approved (Counted)',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
      description: 'Whether this comment was auto-approved and counted. Do not modify manually.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      comment: 'comment',
      approved: 'approved',
    },
    prepare({ name, comment, approved }) {
      return {
        title: `${name} ${approved ? '✅' : '⏳'}`,
        subtitle: comment.substring(0, 50),
      }
    },
  },
})
