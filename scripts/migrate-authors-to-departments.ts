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

// Mapping from old string values to department slugs
const departmentMapping: Record<string, string> = {
  'Leadership': 'leadership',
  'Department of Technology': 'technology',
  'Department of Medicine': 'medicine',
  'Department of Commerce': 'commerce',
}

async function migrateAuthors() {
  console.log('Migrating authors to use department references...\n')

  // Fetch all departments
  const departments = await client.fetch(
    `*[_type == "department"] {
      _id,
      name,
      fullName,
      "slug": slug.current
    }`
  )

  const departmentMap = new Map<string, string>() // slug -> _id
  departments.forEach((dept: any) => {
    departmentMap.set(dept.slug, dept._id)
  })

  console.log(`Found ${departments.length} departments:`)
  departments.forEach((dept: any) => {
    console.log(`  - ${dept.fullName} (${dept.slug})`)
  })
  console.log()

  // Fetch all authors with old string department field
  const authors = await client.fetch(
    `*[_type == "author"] {
      _id,
      name,
      department
    }`
  )

  console.log(`Found ${authors.length} authors to migrate\n`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const author of authors) {
    const oldDepartment = author.department

    // Skip if already a reference (already migrated)
    if (typeof oldDepartment === 'object' && oldDepartment._ref) {
      console.log(`⏭️  Skipping ${author.name} - already has department reference`)
      skipped++
      continue
    }

    // Skip if no department set
    if (!oldDepartment || typeof oldDepartment !== 'string') {
      console.log(`⏭️  Skipping ${author.name} - no department set`)
      skipped++
      continue
    }

    // Find matching department
    const matchingSlug = departmentMapping[oldDepartment]
    if (!matchingSlug) {
      console.log(`⚠️  Warning: ${author.name} has unknown department "${oldDepartment}"`)
      console.log(`   Please manually assign a department in Sanity Studio`)
      errors++
      continue
    }

    const departmentId = departmentMap.get(matchingSlug)
    if (!departmentId) {
      console.log(`⚠️  Warning: Department "${matchingSlug}" not found`)
      errors++
      continue
    }

    try {
      await client
        .patch(author._id)
        .set({
          department: {
            _type: 'reference',
            _ref: departmentId,
          },
        })
        .commit()

      console.log(`✅ Migrated ${author.name}: "${oldDepartment}" → ${matchingSlug}`)
      migrated++
    } catch (error: any) {
      console.error(`❌ Failed to migrate ${author.name}: ${error.message}`)
      errors++
    }
  }

  console.log(`\n✅ Migration complete!`)
  console.log(`   Migrated: ${migrated} authors`)
  console.log(`   Skipped: ${skipped} authors`)
  console.log(`   Errors: ${errors} authors`)
  
  if (errors > 0) {
    console.log(`\n⚠️  Some authors could not be migrated automatically.`)
    console.log(`   Please review them in Sanity Studio and assign departments manually.`)
  }
}

migrateAuthors().catch(console.error)
