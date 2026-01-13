import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Departments section (for easy management)
      S.listItem()
        .title('Departments')
        .child(
          S.documentTypeList('department')
            .title('Departments')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      // Divider
      S.divider(),
      // Comment Deletion Requests
      S.listItem()
        .title('Comment Deletion Requests')
        .child(
          S.documentTypeList('deleteRequest')
            .title('Deletion Requests')
            .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
        ),
      // Divider
      S.divider(),
      // All other content types
      ...S.documentTypeListItems().filter(
        (item) => !['department', 'deleteRequest'].includes(item.getId() || '')
      ),
    ])
