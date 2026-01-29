import { Editor } from '@tiptap/core'
import { componentRegistry } from '../components/registry/ComponentRegistry'

const WP_NAMESPACE = 'ui-builder'

export const exportToJSON = (editor: Editor): string => {
  return JSON.stringify(editor.getJSON(), null, 2)
}

/**
 * Export editor content as WordPress block markup (Gutenberg format).
 * Custom components use namespace "ui-builder" (e.g. wp:ui-builder/button).
 * Paragraphs use core block wp:paragraph.
 */
export const exportToWordPressBlocks = (editor: Editor): string => {
  const json = editor.getJSON()

  const processNode = (node: any): string => {
    if (node.type === 'doc') {
      const children = node.content?.map((child: any) => processNode(child)).join('\n') || ''
      return children
    }

    if (node.type === 'paragraph') {
      const text = node.content?.map((child: any) => {
        if (child.type === 'text') return child.text ?? ''
        return ''
      }).join('') || ''
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
      return `<!-- wp:paragraph -->\n<p>${escaped}</p>\n<!-- /wp:paragraph -->`
    }

    const componentDef = componentRegistry.get(node.type)
    if (componentDef) {
      const attrs = { ...(node.attrs || {}) }
      delete attrs.id
      const attrsJson = Object.keys(attrs).length ? ' ' + JSON.stringify(attrs) : ''
      const blockName = `${WP_NAMESPACE}/${node.type}`

      const hasContent = node.content && node.content.length > 0
      if (hasContent) {
        const inner = node.content.map((child: any) => processNode(child)).join('\n')
        return `<!-- wp:${blockName}${attrsJson} -->\n${inner}\n<!-- /wp:${blockName} -->`
      }
      return `<!-- wp:${blockName}${attrsJson} /-->`
    }

    return ''
  }

  return processNode(json).trim()
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
