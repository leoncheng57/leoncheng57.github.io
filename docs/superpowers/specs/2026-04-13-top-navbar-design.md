# Top Navbar Design

Date: 2026-04-13

## Goal

Add a shared top navbar across the site that is horizontally centered and split into two rows:

- a centered logo row
- a centered links row containing `Home` and `Blogs`

The navbar should replace the current standalone homepage logo treatment rather than duplicating it, but it should not remove any existing page-level hyperlinks.

## Scope

This change affects:

- the homepage
- the blog index page
- individual blog post pages

This change does not add dropdowns, sticky behavior, search, mobile menus, or additional destinations.

## Requirements

- Render one shared top navigation component on all primary routes.
- Keep the navbar horizontally centered within the page layout.
- Use the existing logo image asset in the navbar.
- Keep the logo in its own centered row, not in the same row as the text links.
- Include exactly two text links: `Home` and `Blogs`.
- Remove the current standalone homepage logo block.
- Preserve all existing route-specific hyperlinks and add the navbar on top of them.

## Layout

Recommended structure:

- row 1: centered logo image
- row 2: centered `Home` and `Blogs` links

The navbar should read as a compact stacked navigation block, not as one mixed row with text and logo sharing the same line.

On smaller screens:

- preserve centered alignment
- allow the links row to wrap if necessary rather than compressing the logo or making touch targets too small

## Visual Direction

- Keep the styling minimal and consistent with the current site.
- Reuse the existing dark background and link treatment where possible.
- Make the logo slightly more visually prominent than the text links.
- Use compact vertical spacing so the navbar feels like a navigation element, not a hero section.

## Component Plan

Create a reusable `TopNav` component responsible only for shared site navigation.

Responsibilities:

- render the two route links
- render the logo image
- apply the centered two-row layout
- expose a single shared navigation surface for all major pages

Likely integration points:

- include `TopNav` near the top of `HomeRoute`
- include `TopNav` near the top of `BlogIndexRoute`
- include `TopNav` near the top of `BlogPostRoute`

## Content Changes

Homepage:

- remove the large standalone logo image currently shown above the main content
- keep the separate `Read the blog` link row

Blog routes:

- keep `Back home`
- keep `Back to blog`

## Testing

Verify:

- the navbar renders on home, blog index, and blog post pages
- the `Home` link navigates to `/`
- the `Blogs` link navigates to `/blog`
- the logo image renders inside the navbar
- the previous standalone homepage logo is gone
- old back-link rows are gone
- layout remains centered on desktop and acceptable on narrow screens

## Risks

- Replacing the homepage logo block changes the visual rhythm of the landing page, so spacing may need minor tuning afterward.
- Adding navbar plus existing links may create stacked navigation density, so spacing should be checked carefully.

## Recommendation

Implement this as a shared reusable navbar component while preserving the existing local links on each route. This keeps the new navigation consistent without changing the current link surfaces the site already exposes.
