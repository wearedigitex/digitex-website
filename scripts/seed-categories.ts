import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
})

const categories = [
    {
        name: 'Technology',
        slug: { current: 'technology' },
        description: 'Articles about technology, innovation, and digital trends',
        color: '#28829E',
        order: 1,
    },
    {
        name: 'Medicine',
        slug: { current: 'medicine' },
        description: 'Medical research, healthcare, and wellness topics',
        color: '#E74C3C',
        order: 2,
    },
    {
        name: 'Business',
        slug: { current: 'business' },
        description: 'Business strategy, entrepreneurship, and corporate insights',
        color: '#3498DB',
        order: 3,
    },
    {
        name: 'Economics',
        slug: { current: 'economics' },
        description: 'Economic analysis, markets, and financial trends',
        color: '#F39C12',
        order: 4,
    },
    {
        name: 'Psychology',
        slug: { current: 'psychology' },
        description: 'Human behavior, mental health, and cognitive science',
        color: '#9B59B6',
        order: 5,
    },
    {
        name: 'Physics',
        slug: { current: 'physics' },
        description: 'Physics research, discoveries, and scientific breakthroughs',
        color: '#1ABC9C',
        order: 6,
    },
]

async function seedCategories() {
    console.log('Starting category seeding...')

    try {
        // Check if categories already exist
        const existingCategories = await client.fetch(
            `*[_type == "category"] { name, slug }`
        )

        console.log(`Found ${existingCategories.length} existing categories`)

        for (const category of categories) {
            const exists = existingCategories.some(
                (existing: any) => existing.slug.current === category.slug.current
            )

            if (exists) {
                console.log(`✓ Category "${category.name}" already exists, skipping...`)
            } else {
                await client.create({
                    _type: 'category',
                    ...category,
                })
                console.log(`✓ Created category: ${category.name}`)
            }
        }

        console.log('\n✅ Category seeding completed successfully!')
    } catch (error) {
        console.error('❌ Error seeding categories:', error)
        process.exit(1)
    }
}

seedCategories()
