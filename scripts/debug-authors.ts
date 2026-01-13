import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6rn1uybc"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const token = process.env.SANITY_API_TOKEN || "skBIvMTHZd90LOZV2RMeZMLT8jFQAmIAVTjiF1O4741FQovx4a4b6BG0TD61HOu5KvyJohRsXJEZsHJtJCRnUqqf0Wvj5RWy4drUl5m0yDAxqfvWCopxIHptvVBpfLPJpYRXeOcEoXKJNedxrsDPQYkDo0y15EajyR9e5hFfa4chLksIy3RH"

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function checkAuthors() {
  const authors = await client.fetch(`*[_type == "author"] { name, department }`)
  const departments = new Set(authors.map((a: any) => typeof a.department === 'string' ? a.department : JSON.stringify(a.department)))
  
  console.log('Unique department values in authors:')
  departments.forEach((d) => console.log(`- ${d}`))
  
  console.log('\nAuthor details:')
  authors.forEach((a: any) => console.log(`- ${a.name}: ${JSON.stringify(a.department)}`))
}

checkAuthors().catch(console.error)
