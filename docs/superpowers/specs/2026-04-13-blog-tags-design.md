# Blog Tags Design

**Date:** 2026-04-13
**Project:** leoncheng57.github.io
**Status:** Approved in chat

## Goal

Show post tags in the blog UI so readers can see topical metadata on both the index and article pages.

## Approved UI Decisions

- Show tags on both the blog index and article pages
- Keep tags non-interactive for now
- Render tags as small muted pills
- Show all tags and allow wrapping to multiple lines
- Preserve the exact tag casing from frontmatter

## Recommendation

Use one shared presentational tag-list component for all blog surfaces.

This keeps the tag markup and styling consistent between the index card layout and the article metadata layout. It also avoids duplicating pill markup in multiple routes and makes future upgrades, such as clickable filtering, easier to introduce in one place.

## Placement

### Blog Index

Render the tag row directly below the existing date and reading-time line on each post card.

### Blog Article

Render the tag row as the last item in the metadata block below published date, updated date, and reading time.

## Styling

- Small font size
- Muted text color
- Soft border and subtle background tint
- Rounded pill shape
- Modest horizontal and vertical gaps so wrapped rows stay tidy

The tag row should feel like supporting metadata rather than a second headline.

## Data Behavior

- Read tags from existing frontmatter
- Do not normalize or transform tag strings
- If a post has no tags, render nothing

## Testing

Add route-level coverage that verifies:

- tag pills render on the blog index for published posts
- tag pills render on the article page for a post with tags
- draft posts remain hidden from the index regardless of their tags
