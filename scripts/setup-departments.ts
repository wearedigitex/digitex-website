import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const token = process.env.SANITY_API_TOKEN || "skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH"

if (!projectId || !dataset || !token) {
  console.error('Missing Sanity configuration. Please check .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Default departments to create
const defaultDepartments = [
  {
    name: 'Leadership',
    fullName: 'Leadership',
    slug: 'leadership',
    order: 0,
    description: 'Executive leadership team',
  },
  {
    name: 'Technology',
    fullName: 'Department of Technology',
    slug: 'technology',
    order: 1,
    description: 'Technology and innovation department',
  },
  {
    name: 'Medicine',
    fullName: 'Department of Medicine',
    slug: 'medicine',
    order: 2,
    description: 'Medical and healthcare department',
  },
  {
    name: 'Commerce',
    fullName: 'Department of Commerce',
    slug: 'commerce',
    order: 3,
    description: 'Business and commerce department',
  },
]

async function setupDepartments() {
  console.log('Setting up departments...\n')

  const departmentMap = new Map<string, string>() // name -> _id

  for (const dept of defaultDepartments) {
    console.log(`Creating/updating department: ${dept.fullName}`)
    
    try {
      // Check if department already exists
      const existing = await client.fetch(
        `*[_type == "department" && slug.current == $slug][0]`,
        { slug: dept.slug }
      )

      if (existing) {
        console.log(`  ⏭️  Department "${dept.fullName}" already exists (${existing._id})`)
        departmentMap.set(dept.name, existing._id)
        
        // Update it to ensure it has all fields
        await client
          .patch(existing._id)
          .set({
            name: dept.name,
            fullName: dept.fullName,
            slug: { _type: 'slug', current: dept.slug },
            order: dept.order,
            description: dept.description,
            isActive: true,
          })
          .commit()
        console.log(`  ✅ Updated department`)
      } else {
        // Create new department
        const result = await client.create({
          _type: 'department',
          ...dept,
          slug: { _type: 'slug', current: dept.slug },
          isActive: true,
        })
        departmentMap.set(dept.name, result._id)
        console.log(`  ✅ Created department (${result._id})`)
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to create/update department: ${error.message}`)
    }
  }

  console.log('\n✅ Department setup complete!')
  console.log('\nNext steps:')
  console.log('1. Go to Sanity Studio (/studio)')
  console.log('2. Navigate to "Departments" section')
  console.log('3. Review and adjust department details if needed')
  console.log('4. Update existing authors to reference these departments')
  console.log('\nTo migrate existing authors, run:')
  console.log('  npx tsx scripts/migrate-authors-to-departments.ts')
}

setupDepartments().catch(console.error)
