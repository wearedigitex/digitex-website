import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Team Member (Author)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. President, Technology Lead, Editor',
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'reference',
      to: [{ type: 'department' }],
      description: 'Select the department this team member belongs to',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Used to sort members (1, 2, 3...)',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
      description: 'Full URL to LinkedIn profile',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      description: 'Full URL to Instagram profile',
    }),
    defineField({
      name: 'github',
      title: 'GitHub URL',
      type: 'url',
      description: 'Full URL to GitHub profile',
    }),
    defineField({
      name: 'isGuest',
      title: 'Is Guest Contributor',
      type: 'boolean',
      initialValue: false,
      description: 'If true, this author will NOT appear on the Meet the Team page.',
    }),
  ],
})
