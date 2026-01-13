# Dynamic Department Management Feature

## Overview

This feature allows you to manage departments dynamically through Sanity Studio instead of hardcoding them in the codebase. You can now create, edit, and organize departments without touching any code.

## What Changed

### 1. New Department Schema (`sanity/schemaTypes/department.ts`)

A new content type has been added to Sanity that allows you to:
- Create departments with a name and full name
- Set display order (for sorting on the team page)
- Add descriptions
- Activate/deactivate departments
- Automatically generate slugs

**Fields:**
- `name`: Short name (e.g., "Technology")
- `fullName`: Full display name (e.g., "Department of Technology")
- `slug`: URL-friendly identifier (auto-generated)
- `description`: Brief description of the department
- `order`: Display order (lower numbers appear first)
- `isActive`: Toggle to show/hide department

### 2. Updated Author Schema (`sanity/schemaTypes/author.ts`)

The `department` field in authors has been changed from a hardcoded dropdown to a **reference** to a department document. This means:
- Authors now link to department documents
- You can assign authors to any department you create
- No code changes needed to add new departments

### 3. Dynamic Team Page (`app/HomeClient.tsx`)

The team page now:
- Automatically fetches all active departments
- Groups team members by their assigned department
- Displays departments in order (based on `order` field)
- Only shows departments that have team members
- Automatically adapts when you add/remove departments

### 4. Updated Sanity Queries (`lib/sanity.ts`)

New function added:
- `getDepartments()`: Fetches all active departments

Updated function:
- `getTeamMembers()`: Now includes full department information (not just a string)

### 5. Improved Sanity Studio Structure (`sanity/structure.ts`)

Departments now appear at the top of the Sanity Studio sidebar for easy access.

## Setup Instructions

### Step 1: Create Initial Departments

Run the setup script to create the default departments:

```bash
npx tsx scripts/setup-departments.ts
```

This will create:
- Leadership (order: 0)
- Department of Technology (order: 1)
- Department of Medicine (order: 2)
- Department of Commerce (order: 3)

### Step 2: Migrate Existing Authors

If you have existing authors with string-based departments, migrate them to use references:

```bash
npx tsx scripts/migrate-authors-to-departments.ts
```

This script will:
- Find all authors with old string-based departments
- Match them to the new department documents
- Update them to use department references
- Report any authors that need manual assignment

### Step 3: Verify in Sanity Studio

1. Go to `/studio` in your browser
2. Navigate to "Departments" section (should be at the top)
3. Verify all departments are created correctly
4. Check that authors have been assigned to departments

## How to Use

### Adding a New Department

1. Go to Sanity Studio (`/studio`)
2. Click "Departments" in the sidebar
3. Click "Create new document"
4. Fill in:
   - **Name**: Short name (e.g., "Design")
   - **Full Name**: Full display name (e.g., "Department of Design")
   - **Order**: Display order (e.g., 4)
   - **Description**: Brief description
   - **Active**: Toggle ON
5. Click "Publish"

The department will automatically appear on the team page when you assign members to it!

### Assigning Authors to Departments

1. Go to Sanity Studio → "Team Member (Author)"
2. Open an author document
3. In the "Department" field, select a department from the dropdown
4. Click "Publish"

The author will automatically appear in the correct department section on the team page.

### Reordering Departments

1. Go to Sanity Studio → "Departments"
2. Edit each department's "Display Order" field
3. Lower numbers appear first (e.g., 0 = first, 1 = second)
4. Click "Publish" on each department

The team page will automatically update to show departments in the new order.

### Hiding a Department

1. Go to Sanity Studio → "Departments"
2. Open the department you want to hide
3. Toggle "Active" to OFF
4. Click "Publish"

The department will no longer appear on the team page, even if it has members assigned.

## Migration Notes

### For Existing Data

If you have existing authors with string-based departments:
- The migration script (`migrate-authors-to-departments.ts`) will handle most cases
- Authors with unknown department strings will need manual assignment
- Check the script output for any warnings

### Backward Compatibility

- Old migration scripts (`migrate.js`, `migrate-full.js`) still work but won't set departments
- You'll need to manually assign departments after migration or update the scripts
- The team page gracefully handles authors without departments (they won't appear)

## Technical Details

### Schema Changes

**Before:**
```typescript
department: {
  type: 'string',
  options: {
    list: [
      { title: 'Leadership', value: 'Leadership' },
      // ... hardcoded list
    ]
  }
}
```

**After:**
```typescript
department: {
  type: 'reference',
  to: [{ type: 'department' }]
}
```

### Query Changes

**Before:**
```groq
department  // Returns string
```

**After:**
```groq
"department": department->{
  _id,
  name,
  fullName,
  slug,
  order
}  // Returns full department object
```

## Troubleshooting

### Departments not showing on team page

1. Check that departments are marked as "Active" in Sanity Studio
2. Verify that authors are assigned to departments
3. Check browser console for errors
4. Ensure `getDepartments()` is being called correctly

### Authors not appearing in departments

1. Verify authors have departments assigned in Sanity Studio
2. Check that the department reference is valid
3. Ensure authors are not marked as "Is Guest Contributor"

### Migration script errors

1. Ensure `setup-departments.ts` has been run first
2. Check that all default departments exist
3. Review the error messages - some authors may need manual assignment

## Future Enhancements

Potential improvements:
- Department-specific pages/routes
- Department logos/icons
- Department descriptions on team page
- Department filtering/search
- Department-specific blog categories

## Files Modified

- `sanity/schemaTypes/department.ts` (NEW)
- `sanity/schemaTypes/author.ts` (MODIFIED)
- `sanity/schemaTypes/index.ts` (MODIFIED)
- `sanity/structure.ts` (MODIFIED)
- `lib/sanity.ts` (MODIFIED)
- `app/HomeClient.tsx` (MODIFIED)
- `scripts/setup-departments.ts` (NEW)
- `scripts/migrate-authors-to-departments.ts` (NEW)

---

**Created**: January 2026  
**Status**: ✅ Complete and ready to use
