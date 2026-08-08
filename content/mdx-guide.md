# Understanding MDX

## What is MDX?

MDX stands for **Markdown + JSX**. It's a file format that lets you write Markdown (a simple text formatting language) while also using JSX components (React components) within your content.

Think of it like this:

- **Markdown** = Easy-to-write text formatting (like bold, headings, lists)
- **JSX** = Interactive components that can do more complex things
- **MDX** = The best of both worlds!

> **New to Markdown?** Check out the [GitHub Flavored Markdown guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) for a complete reference on Markdown syntax, including headings, lists, links, images, and more.

## MDX File Structure

Every MDX file in this repository follows a standard structure:

```mdx
---
title: Page Title
description: A brief description of the page
---

# Page Title

Your content goes here in Markdown format.

## Section Heading

You can write paragraphs, lists, and use formatting.

<Cards>
  <Card
    title="Card Title"
    href="https://example.com"
  />
</Cards>
```

## Frontmatter

The section at the top between the `---` lines is called **frontmatter**. It contains metadata about the page:

- **title**: The page title that appears in the navigation and page header
- **description**: An optional brief description used for SEO and page previews

The title is required for every page. The description is optional; when it is
omitted, the site creates a generic page-preview description from the title.

