import { defineField, defineType } from 'sanity'

export const user = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'password',
      title: 'Password (Hashed)',
      type: 'string',
      validation: (rule) => rule.required(),
      hidden: true,
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Admin', value: 'admin' },
          { title: 'Contributor', value: 'contributor' },
        ],
      },
      initialValue: 'contributor',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Linked Author Profile',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'Link this user account to an author profile',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'invitedAt',
      title: 'Invited At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      email: 'email',
      role: 'role',
      status: 'status',
    },
    prepare({ email, role, status }) {
      const statusEmoji = status === 'active' ? '✅' : status === 'pending' ? '⏳' : '❌'
      return {
        title: email,
        subtitle: `${role} ${statusEmoji}`,
      }
    },
  },
})
