import { Editor } from '@tiptap/core'
import { componentRegistry } from '../components/registry/ComponentRegistry'

export const exportToJSON = (editor: Editor): string => {
  return JSON.stringify(editor.getJSON(), null, 2)
}

export const exportToHTML = (editor: Editor): string => {
  return editor.getHTML()
}

export const exportToReact = (editor: Editor): string => {
  const json = editor.getJSON()
  
  const processNode = (node: any, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    
    if (node.type === 'doc') {
      const children = node.content?.map((child: any) => processNode(child, indent + 1)).join('\n') || ''
      return children
    }
    
    if (node.type === 'paragraph') {
      const text = node.content?.map((child: any) => {
        if (child.type === 'text') {
          return child.text
        }
        return ''
      }).join('') || ''
      return `${spaces}<p>${text}</p>`
    }
    
    // Handle UI components
    const componentDef = componentRegistry.get(node.type)
    if (componentDef) {
      const props = Object.entries(node.attrs || {})
        .filter(([key]) => key !== 'id')
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}="${value}"`
          } else if (typeof value === 'boolean') {
            return value ? key : `${key}={false}`
          } else {
            return `${key}={${JSON.stringify(value)}}`
          }
        })
        .join(' ')
      
      const componentName = componentDef.metadata.name
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      
      return `${spaces}<${componentName} ${props} />`
    }
    
    return ''
  }
  
  const reactCode = processNode(json)
  
  return `import React from 'react'

export default function GeneratedComponent() {
  return (
    <>
${reactCode.split('\n').map(line => '      ' + line).join('\n')}
    </>
  )
}
`
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
