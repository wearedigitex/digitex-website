'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {ApproveSubmissionAction} from './sanity/actions/approveSubmission'
import {RejectSubmissionAction} from './sanity/actions/rejectSubmission'
import {ApproveDeletionAction} from './sanity/actions/approveDeletion'
import {RejectDeletionAction} from './sanity/actions/rejectDeletion'
import {InviteUserForm} from './components/admin/invite-user-form'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'invite',
        title: 'Invite Team',
        component: InviteUserForm,
      },
    ]
  },
  document: {
    actions: (prev, context) => {
      // Only add approval/rejection actions to "submission" documents
      if (context.schemaType === 'submission') {
        return [ApproveSubmissionAction, RejectSubmissionAction, ...prev]
      }
      
      // Add deletion approval/rejection actions to "deleteRequest" documents
      if (context.schemaType === 'deleteRequest') {
        return [ApproveDeletionAction, RejectDeletionAction, ...prev]
      }
      
      return prev
    },
  },
})
