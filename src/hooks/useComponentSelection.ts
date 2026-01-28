import { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { useCallback, useEffect, useState } from 'react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export const useComponentSelection = (editor: Editor | null) => {
  const [selectedNode, setSelectedNode] = useState<ProseMirrorNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    if (!editor) {
      setSelectedNode(null)
      setSelectedNodeId(null)
      return
    }

    const handleSelectionUpdate = () => {
      const { state } = editor
      const { selection } = state
      const { $anchor } = selection

      // Find the selected node
      let node: ProseMirrorNode | null = null
      let nodeId: string | null = null

      // Check if we're inside a UI component node
      for (let depth = $anchor.depth; depth > 0; depth--) {
        const nodeAtDepth = $anchor.node(depth)
        if (nodeAtDepth.type.name !== 'doc' && nodeAtDepth.type.name !== 'paragraph') {
          node = nodeAtDepth
          nodeId = nodeAtDepth.attrs.id || null
          break
        }
      }

      setSelectedNode(node)
      setSelectedNodeId(nodeId)
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleSelectionUpdate)
    }
  }, [editor])

  const selectNode = useCallback((nodeId: string) => {
    if (!editor) return

    const { state } = editor
    const { doc } = state

    let targetPos: number | null = null
    doc.descendants((node, pos) => {
      if (node.attrs.id === nodeId) {
        targetPos = pos
        return false
      }
    })

    if (targetPos !== null) {
      const tr = state.tr
      const selection = TextSelection.near(doc.resolve(targetPos))
      tr.setSelection(selection)
      editor.view.dispatch(tr)
    }
  }, [editor])

  return {
    selectedNode,
    selectedNodeId,
    selectNode,
  }
}
