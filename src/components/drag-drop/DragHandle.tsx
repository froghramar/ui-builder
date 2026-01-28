import { useEditor } from '@tiptap/react'
import { TextSelection } from '@tiptap/pm/state'
import { useCallback } from 'react'
import './DragHandle.css'

interface DragHandleProps {
  nodeId: string
}

const DragHandle = ({ nodeId }: DragHandleProps) => {
  const editor = useEditor()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!editor) return

    // Find the node and select it
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
      tr.setSelection(TextSelection.near(doc.resolve(targetPos)))
      editor.view.dispatch(tr)
    }
  }, [editor, nodeId])

  return (
    <div
      className="drag-handle"
      onMouseDown={handleMouseDown}
      contentEditable={false}
      draggable={true}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="2" cy="2" r="1" fill="currentColor" />
        <circle cx="6" cy="2" r="1" fill="currentColor" />
        <circle cx="10" cy="2" r="1" fill="currentColor" />
        <circle cx="2" cy="6" r="1" fill="currentColor" />
        <circle cx="6" cy="6" r="1" fill="currentColor" />
        <circle cx="10" cy="6" r="1" fill="currentColor" />
        <circle cx="2" cy="10" r="1" fill="currentColor" />
        <circle cx="6" cy="10" r="1" fill="currentColor" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </svg>
    </div>
  )
}

export default DragHandle
