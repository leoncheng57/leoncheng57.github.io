function parseScalarValue(rawValue: string): string | number | boolean {
  const trimmedValue = rawValue.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1)
  }

  if (trimmedValue === 'true') {
    return true
  }

  if (trimmedValue === 'false') {
    return false
  }

  const numericValue = Number(trimmedValue)
  if (!Number.isNaN(numericValue) && trimmedValue !== '') {
    return numericValue
  }

  return trimmedValue
}

/**
 * Parses the small YAML subset used by content markdown files: scalar values
 * and single-level string lists. Implemented without a YAML dependency so the
 * loaders stay browser-safe and free of Node globals such as Buffer.
 */
export function parseFrontmatter<TData>(rawContent: string): {
  data: TData
  content: string
} {
  if (!rawContent.startsWith('---\n')) {
    return {
      data: {} as TData,
      content: rawContent,
    }
  }

  const frontmatterEnd = rawContent.indexOf('\n---\n')
  if (frontmatterEnd === -1) {
    return {
      data: {} as TData,
      content: rawContent,
    }
  }

  const frontmatterBlock = rawContent.slice(4, frontmatterEnd)
  const content = rawContent.slice(frontmatterEnd + 5)
  const data: Record<string, unknown> = {}
  const lines = frontmatterBlock.split('\n')

  let currentArrayKey: string | null = null

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    const arrayItemMatch = line.match(/^\s*-\s+(.*)$/)
    if (arrayItemMatch && currentArrayKey) {
      const currentValue = data[currentArrayKey]
      if (Array.isArray(currentValue)) {
        currentValue.push(String(parseScalarValue(arrayItemMatch[1])))
      }
      continue
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!keyValueMatch) {
      currentArrayKey = null
      continue
    }

    const [, key, rawValue] = keyValueMatch

    if (rawValue === '') {
      data[key] = []
      currentArrayKey = key
      continue
    }

    data[key] = parseScalarValue(rawValue)
    currentArrayKey = null
  }

  return {
    data: data as TData,
    content,
  }
}

/**
 * Removes the leading H1 from a markdown body because routes render the
 * frontmatter title in the page header instead.
 */
export function stripLeadingHeading(content: string): string {
  return content.replace(/^\s*#\s+.+?\n+/, '')
}

export function getSlugFromPath(path: string): string {
  return path.split('/').pop()?.replace(/\.md$/, '') ?? ''
}

export function assertRequiredFields<TData extends object>(
  frontmatter: TData,
  requiredFields: Array<keyof TData>,
  path: string
): void {
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      throw new Error(`Missing required frontmatter field "${String(field)}" in ${path}`)
    }
  }
}
