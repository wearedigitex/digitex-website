import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { post } from './post'
import { comment } from './comment'
import { user } from './user'
import { submission } from './submission'
import { department } from './department'
import { deleteRequest } from './deleteRequest'
import { category } from './category'

export const schema = {
  types: [author, post, comment, user, submission, department, deleteRequest, category],
}
