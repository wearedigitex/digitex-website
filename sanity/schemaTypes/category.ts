import { defineField, defineType } from 'sanity'

export const category = defineType({
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
            description: 'Display name of the category (e.g., "Technology")',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
            description: 'URL-friendly identifier (e.g., "technology")',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
            description: 'Brief description of this category',
        }),
        defineField({
            name: 'color',
            title: 'Color',
            type: 'string',
            description: 'Hex color code for UI theming (e.g., "#28829E")',
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            initialValue: 0,
            description: 'Order in which categories are displayed (lower numbers appear first)',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'description',
        },
    },
})
