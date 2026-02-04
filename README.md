# Digitex Website

The official website for Digitex, built with Next.js, Tailwind CSS, and Sanity.io.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **CMS**: Sanity.io (Structured Content)
- **Animations**: GSAP & Framer Motion
- **3D Graphics**: Three.js with React Three Fiber
- **Email Delivery**: Resend (Integrated Contact Form & Invitations)
- **Authentication**: NextAuth.js (Credentials-based)
- **Comments System**: Threaded discussions with moderation
- **Engagement Tracking**: Real-time article view counting and like system
- **Rich Text Editor**: TipTap (for article writing)
- **Performance**: Optimized for Core Web Vitals (CLS, LCP, FCP)
- **Analytics**: Vercel Speed Insights & Analytics

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Sanity account
- Resend account (for email functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wearedigitex/digitex-website.git
cd digitex-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
```

**Note**: Ask the team lead for these credentials. See `RESEND_SETUP.md` for detailed Resend setup instructions.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Restarting the Dev Server (Clear Cache)

If images or styles aren't updating after changes, clear the Next.js cache and restart:

```bash
# Kill the server on port 3000
lsof -ti:3000 | xargs kill -9

# Delete the cache folder
rm -rf .next

# Restart the server
npm run dev
```

One-line command:
```bash
lsof -ti:3000 | xargs kill -9 && rm -rf .next && npm run dev
```

## Project Structure

```
digitex-website/
├── app/                          # Main application routes
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── comments/            # Comments CRUD operations
│   │   ├── contact/             # Contact form handler
│   │   ├── invite/              # User invitation system
│   │   ├── likes/               # Like/unlike functionality
│   │   ├── submissions/         # Article submission management
│   │   └── views/               # View count tracking
│   ├── article/[slug]/          # Individual article pages
│   ├── blog/                    # Blog listing page
│   ├── dashboard/               # User dashboard (protected)
│   │   ├── write/               # Article writing interface
│   │   ├── review/              # Article review system
│   │   └── settings/            # User settings
│   ├── login/                    # Login page
│   ├── studio/                   # Embedded Sanity Studio (admin only)
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   ├── canvas/                  # Three.js 3D components
│   ├── ui/                      # Reusable UI components
│   ├── comments-section.tsx     # Threaded comments system
│   ├── like-button.tsx          # Heart button with optimistic UI
│   ├── navigation.tsx           # Main navigation bar
│   └── custom-cursor.tsx        # Custom cursor component
├── lib/                          # Utilities and configuration
│   ├── auth.ts                  # NextAuth configuration
│   ├── email.ts                 # Email templates (Resend)
│   ├── sanity.ts                # Sanity client and queries
│   └── utils.ts                 # Helper functions
├── sanity/                       # Sanity CMS configuration
│   ├── schemaTypes/             # Content schemas
│   │   ├── author.ts            # Author schema
│   │   ├── comment.ts           # Comment schema
│   │   ├── department.ts        # Department schema (dynamic management)
│   │   ├── post.ts              # Blog post schema
│   │   ├── submission.ts        # Article submission schema
│   │   └── user.ts              # User schema
│   ├── actions/                 # Sanity actions
│   └── structure.ts             # Studio structure
├── scripts/                      # Maintenance scripts
│   ├── clean-article-formatting.ts
│   ├── initialize-likes.ts      # Initialize missing likes fields
│   ├── migrate-authors-to-departments.ts  # Migrate authors to department references
│   ├── migrate-full-content.ts
│   ├── reset-comment-counts.ts
│   ├── reset-likes.ts
│   └── setup-departments.ts     # Create initial departments
└── public/                       # Static assets
```

## Key Features

### 1. Content Management System

- **Sanity Studio**: Embedded CMS accessible at `/studio` (admin only)
- **Article Writing**: Rich text editor (TipTap) for creating articles
- **Image Management**: Hotspot cropping and optimization
- **Content Types**: Posts, Authors, Comments, Submissions, Users, Departments

### 2. User Authentication & Roles

- **NextAuth.js**: Credentials-based authentication
- **User Roles**: `admin`, `author`, `contributor`
- **Protected Routes**: Dashboard and Studio require authentication
- **Password Management**: Bcrypt password hashing

### 3. Article Submission & Review System

- **Contributor Dashboard**: Submit articles for review
- **Review Workflow**: Draft → Submitted → Approved/Rejected → Published
- **Email Notifications**: Automatic emails on approval/rejection
- **Rich Text Editor**: TipTap with image support

### 4. Engagement Features

- **Like System**: Heart button with optimistic UI and localStorage persistence
- **View Tracking**: Session-based view counting (prevents refresh inflation)
- **Comments**: Threaded comment system with moderation
- **Real-time Stats**: View counts, comment counts, and likes

### 5. Email System (Resend)

- **Contact Form**: Public contact form with email delivery
- **User Invitations**: Invite team members via email
- **Article Notifications**: Approval/rejection emails
- **Custom Domain**: Uses `wearedigitex.org` domain

See `RESEND_SETUP.md` for detailed email configuration.

### 6. Performance Optimizations

The website is optimized for Core Web Vitals (CLS, LCP, FCP):

- **Loading Screen**: Fast animated intro (1.35s total) that only shows on first visit per session
- **3D Background**: PlexusScene loads only after content is ready (deferred loading)
- **Image Loading**:
  - Navigation logo: Priority loading with explicit dimensions
  - Blog images: First 2 posts load with priority, rest are lazy loaded
  - Team cards: All images use `loading="lazy"`
- **Page Transitions**: Opacity-only animations (no scale transforms that cause CLS)
- **Skeleton Loaders**: All dynamic content shows skeleton placeholders during loading:
  - Blog page: Category filters, search bar, and post cards
  - Article page: Full article layout skeleton
  - Dashboard: Submission list skeleton
  - Comments: Comment card skeletons

**Loading Screen Configuration** (in `components/loading-screen.tsx`):
- Display time: 1150ms before exit animation
- Exit animation: 200ms
- Letter animation: 0.02s stagger, 0.2s duration each

## Maintenance Guide

### 1. Managing Blog Content

The blog is fully dynamic and managed via Sanity CMS.

**Publishing a new article via Studio:**
1. Navigate to `/studio` (admin only)
2. Log in with your Sanity account
3. Click "Create new document" → "Post"
4. Fill in:
   - **Title**: Article headline
   - **Slug**: URL-friendly version (auto-generated from title)
   - **Excerpt**: Short summary
   - **Main Image**: Featured image with hotspot cropping
   - **Body**: Full article content (Portable Text or HTML)
   - **Category**: TECHNOLOGY, MEDICINE, COMMERCE, or GENERAL
   - **Author**: Reference to an author
   - **Published At**: Publication date
5. Click "Publish"

**Publishing via Contributor Dashboard:**
1. Log in at `/login`
2. Navigate to `/dashboard/write`
3. Write your article using the rich text editor
4. Submit for review
5. Admin reviews and approves/rejects in `/dashboard/review/[id]`

### 2. Managing Users & Authors

**Adding a new team member:**
1. Admin navigates to `/dashboard` → "Invite User"
2. Enter email and role (admin/author/contributor)
3. System sends invitation email via Resend
4. User registers and sets password
5. User can now log in and access dashboard

**Creating an Author profile:**
1. Admin goes to `/studio` → "Team Member (Author)"
2. Create new author document
3. Assign to a department (see Department Management below)
4. Link to user account if needed
5. Author can now be assigned to articles

### 2.5. Managing Departments

**Dynamic Department Management**: Departments can now be created and managed entirely through Sanity Studio without code changes!

**Initial Setup** (First time only):
1. Run the setup script to create default departments:
   ```bash
   npx tsx scripts/setup-departments.ts
   ```
2. Migrate existing authors to use department references:
   ```bash
   npx tsx scripts/migrate-authors-to-departments.ts
   ```

**Adding a New Department:**
1. Go to `/studio` → "Departments" (appears at top of sidebar)
2. Click "Create new document"
3. Fill in:
   - **Name**: Short name (e.g., "Design")
   - **Full Name**: Display name (e.g., "Department of Design")
   - **Order**: Display order (lower numbers appear first)
   - **Description**: Brief description
   - **Active**: Toggle ON
4. Click "Publish"
5. Assign team members to the new department

**Assigning Authors to Departments:**
1. Go to `/studio` → "Team Member (Author)"
2. Open an author document
3. Select a department from the "Department" dropdown
4. Click "Publish"

The team page will automatically update to show the new department and assigned members.

**Reordering Departments:**
1. Edit each department's "Display Order" field
2. Lower numbers appear first (e.g., 0 = first, 1 = second)
3. Publish changes

**Hiding a Department:**
1. Edit the department
2. Toggle "Active" to OFF
3. Publish

See `DEPARTMENT_FEATURE.md` for detailed documentation.

### 3. Managing Departments

See section 2.5 above for detailed department management instructions.

### 4. Managing Comments

**Comment Moderation:**
- All comments are stored in Sanity.
- **Approval Flow**: New comments appear in `/studio` -> "Pending Comments".
- **Approve Comment**: Use the custom "Approve Comment" action button instead of the checkbox. This ensures the post's `commentCount` is correctly incremented.

**Secure Comment Deletion:**
- **Team Members**: Can delete comments instantly by providing their email and secret code in the delete modal.
- **Visitors**: Can request comment deletion. Requests appear in `/studio` -> "Comment Deletion Requests".
- **Admin Review**: Admins use custom actions (`Approve & Delete` or `Reject`) to process these requests.
- **Threaded Deletion**: Deleting a parent comment recursively deletes all its replies and synchronizes the post's `commentCount`.

### 5. Data Integrity & Syncing

If data appears incorrect in previews or headers (e.g., wrong comment counts or likes), run these recovery scripts:

**Syncing Comment Counts:**
Audits all posts and aligns their counts with actual approved comments in Sanity.
```bash
npx tsx scripts/sync-comment-counts.ts
```

**Initializing/Resetting Likes:**
Initializes missing `likes` fields or resets them.
```bash
npx tsx scripts/initialize-likes.ts
# or
npx tsx scripts/reset-likes.ts
```

**Cleaning Article Formatting:**
Cleans up HTML formatting inconsistencies in articles.
```bash
npx tsx scripts/clean-article-formatting.ts
```

### 6. Initializing Missing Likes Fields

If old articles don't have the `likes` field initialized:
## API Routes

### Public Routes

- `GET /api/blog/posts` - Fetch all blog posts
- `GET /api/comments?postId=xxx` - Fetch comments for a post
- `POST /api/contact` - Submit contact form
- `POST /api/views` - Track article view (session-based)
- `PATCH /api/likes` - Like/unlike an article
- `POST /api/check-team-member` - Check if an email belongs to a team member

### Protected Routes (Require Authentication)

- `GET /api/submissions` - Get user's submissions
- `POST /api/submissions` - Create new submission
- `PATCH /api/submissions/[id]` - Update submission
- `POST /api/invite` - Invite new user (admin only)
- `POST /api/publish` - Publish article (admin only)
- `POST /api/comments` - Create/Post comment (handles team verification)
- `DELETE /api/comments` - Delete comment (handles instant deletion and requests)

## Troubleshooting

### Images not updating after upload
1. Clear the Next.js cache: `rm -rf .next`
2. Restart the dev server: `npm run dev`
3. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

### Heart counter not working on old articles
Run the initialization script:
```bash
npx tsx scripts/initialize-likes.ts
```

### Blog posts not showing
- Check that the post is published in Sanity Studio
- Verify the `publishedAt` date is not in the future
- Check browser console for errors
- Ensure Sanity environment variables are correct

### Authentication issues
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check that `NEXTAUTH_URL` matches your environment
- Ensure user status is "active" in Sanity

### Email not sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for domain verification status
- See `RESEND_SETUP.md` for detailed setup

### Poor Performance / Low Experience Score
- Run `npm run build` to check for any build warnings
- Ensure images have proper dimensions or use `fill` with sized containers
- Check that 3D canvas only loads after loading screen completes
- Verify skeleton loaders appear during data fetching
- Use Chrome DevTools Lighthouse to audit Core Web Vitals

### Layout Shift Issues (CLS)
- Ensure all images have width/height or aspect-ratio containers
- Check that loading states reserve the same space as loaded content
- Verify no scale transforms in animations
- Use `min-height` on dynamic containers

### Custom cursor appearing in whitespace
The website uses a custom cursor. If you see the system cursor:
- It's likely on the browser scrollbar (expected behavior)
- Or during page transitions/hot reload (temporary flicker)

## Deployment

The website is hosted on **Vercel**.

**Automatic Deployments**: Every time you `git push` to the `main` branch, the live site updates automatically.

**Content Updates**: Publishing a post in the Sanity Studio updates the live site immediately without needing a code push.

### Deploying Changes

1. Make your changes locally
2. Test thoroughly at `http://localhost:3000`
3. Commit and push:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```
4. Vercel will automatically deploy the changes

### Environment Variables in Vercel

Make sure all environment variables from `.env.local` are set in Vercel:
- Go to Vercel → Your Project → **Settings** → **Environment Variables**
- Add all required variables for Production, Preview, and Development
- Redeploy after adding new variables

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/sanity.ts` | Sanity client configuration and queries |
| `lib/auth.ts` | NextAuth.js authentication setup |
| `lib/email.ts` | Email templates and Resend configuration |
| `components/like-button.tsx` | Like/unlike functionality |
| `components/comments-section.tsx` | Threaded comments system |
| `app/dashboard/write/page.tsx` | Article writing interface |
| `app/HomeClient.tsx` | Homepage with dynamic team sections and 3D background |
| `app/api/likes/route.ts` | Like count API endpoint |
| `sanity/schemaTypes/post.ts` | Blog post schema definition |
| `sanity/schemaTypes/department.ts` | Department schema definition |
| `components/loading-screen.tsx` | Animated loading intro (performance optimized) |
| `components/page-transition.tsx` | Page transition animations (opacity only) |
| `components/canvas/plexus-scene.tsx` | 3D WebGL background (deferred loading) |
| `components/team-card.tsx` | Team member cards with lazy loaded images |
| `components/ui/skeleton.tsx` | Reusable skeleton loader component |
| `scripts/sync-comment-counts.ts` | Re-sync all comment counts |
| `scripts/setup-departments.ts` | Create initial departments |
| `scripts/migrate-authors-to-departments.ts` | Migrate authors to departments |
| `sanity/actions/approveComment.ts` | Custom action for comment approval & count sync |
| `sanity/actions/approveDeletion.ts` | Custom action for processing deletion requests |

## Support

For technical issues or questions:

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Check the [Sanity Documentation](https://www.sanity.io/docs)
- Check the [Resend Documentation](https://resend.com/docs)
- Contact the team lead for credentials and access

---

**Last Updated**: February 2026

**Recent Updates**:
- ✅ **Performance Optimization**: Improved Real Experience Score with CLS/LCP fixes
  - Navigation logo priority loading
  - Deferred 3D canvas loading
  - Optimized page transitions (removed scale transforms)
  - Lazy loading for team card images
  - Faster loading screen animation
- ✅ **Skeleton Loaders**: Added proper skeleton placeholders for blog, article, dashboard, and comments
- ✅ **Secure Comment Deletion**: Two-tiered deletion system for team members and visitors
- ✅ **Comment Count Sync**: Automated synchronization of post comment counts via custom Sanity actions
- ✅ **Dynamic Departments**: "Leadership" department prioritized and managed via CMS
- ✅ **Data Recovery**: Re-sync scripts for likes and comment counts

**Website**: [wearedigitex.org](https://wearedigitex.org)
