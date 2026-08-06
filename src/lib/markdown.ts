/**
 * Minimal markdown → HTML for blog bodies (headings, bold, italics, links,
 * lists, paragraphs). Input is escaped first, so stored content can never
 * inject markup — the admin is trusted, but defense in depth is free here.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
}

export function markdownToHtml(markdown: string): string {
  const blocks = escapeHtml(markdown.trim()).split(/\n{2,}/)

  const html = blocks.map((block) => {
    const trimmed = block.trim()
    if (!trimmed) return ''

    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/)
    if (heading?.[1] && heading[2] !== undefined && !trimmed.includes('\n')) {
      const level = heading[1].length + 1 // page h1 is the post title
      return `<h${level}>${inline(heading[2])}</h${level}>`
    }

    const lines = trimmed.split('\n')
    const isUl = lines.every((line) => /^[-*]\s+/.test(line))
    if (isUl) {
      const items = lines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      return `<ul>${items.join('')}</ul>`
    }

    const isOl = lines.every((line) => /^\d+\.\s+/.test(line))
    if (isOl) {
      const items = lines.map((line) => `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`)
      return `<ol>${items.join('')}</ol>`
    }

    return `<p>${inline(lines.join('<br/>'))}</p>`
  })

  return html.filter(Boolean).join('\n')
}
