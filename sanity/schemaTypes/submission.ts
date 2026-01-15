import { defineField, defineType } from 'sanity'

export const submission = defineType({
  name: 'submission',
  title: 'Article Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body (Portable Text)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'bodyHtml',
      title: 'Body (HTML)',
      type: 'text',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'submittedBy',
      title: 'Submitted By',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Submitted', value: 'submitted' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      author: 'author.name',
    },
    prepare({ title, status, author }: { title: string; status: string; author?: string }) {
      const statusEmoji: Record<string, string> = {
        draft: '📝',
        submitted: '📤',
        approved: '✅',
        rejected: '❌',
        published: '🚀',
      }

      return {
        title: `${statusEmoji[status] || '📄'} ${title}`,
        subtitle: `by ${author || 'Unknown'} - ${status}`,
      }
    },
  },
})
