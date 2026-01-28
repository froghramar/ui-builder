import { useEditor } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'

export const useInlineEditing = () => {
  const editor = useEditor()
  const [isEditing, setIsEditing] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)

  const startEditing = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId)
    setIsEditing(true)
  }, [])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
    setEditingNodeId(null)
  }, [])

  // Handle double-click to edit
  useEffect(() => {
    if (!editor) return

    const handleDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const componentWrapper = target.closest('[data-type="ui-component"]')
      
      if (componentWrapper) {
        const nodeId = componentWrapper.getAttribute('data-id')
        if (nodeId) {
          startEditing(nodeId)
        }
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('dblclick', handleDoubleClick)

    return () => {
      editorElement.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [editor, startEditing])

  // Handle Escape to stop editing
  useEffect(() => {
    if (!isEditing) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopEditing()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isEditing, stopEditing])

  return {
    isEditing,
    editingNodeId,
    startEditing,
    stopEditing,
  }
}
