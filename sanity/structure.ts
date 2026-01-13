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
      // All other content types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'department'
      ),
    ])
