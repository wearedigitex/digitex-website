import { defineField, defineType } from 'sanity'

export const department = defineType({
  name: 'department',
  title: 'Department',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Department Name',
      type: 'string',
      description: 'e.g. Technology, Medicine, Commerce',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fullName',
      title: 'Full Department Name',
      type: 'string',
      description: 'Full name with prefix, e.g. "Department of Technology"',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the department',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which departments appear (lower numbers first). Leadership should typically be 0.',
      initialValue: 999,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Inactive departments will not appear in the team page',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      name: 'name',
      fullName: 'fullName',
      order: 'order',
    },
    prepare({ name, fullName, order }) {
      return {
        title: fullName || name,
        subtitle: `Order: ${order || 999}`,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
})
