import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { post } from './post'
import { comment } from './comment'

export const schema = {
  types: [author, post, comment],
}
