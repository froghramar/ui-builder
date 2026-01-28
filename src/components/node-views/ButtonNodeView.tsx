import { NodeViewWrapper } from '@tiptap/react'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { useCallback } from 'react'
import clsx from 'clsx'
import './ButtonNodeView.css'

interface ButtonNodeViewProps {
  node: ProseMirrorNode
  updateAttributes: (attrs: Record<string, any>) => void
  selected?: boolean
}

const ButtonNodeView = ({ node, updateAttributes, selected = false }: ButtonNodeViewProps) => {
  const { text, variant, size, disabled, onClick } = node.attrs

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttributes({ text: e.target.value })
  }, [updateAttributes])

  const buttonClasses = clsx(
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    {
      'ui-button--disabled': disabled,
      'ui-button--selected': selected,
    }
  )

  return (
    <NodeViewWrapper 
      className="ui-button-wrapper" 
      data-selected={selected}
      data-id={node.attrs.id}
      data-type="ui-component"
    >
      <button
        className={buttonClasses}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          if (onClick) {
            // In a real app, this would execute the onClick handler
            console.log('Button clicked:', onClick)
          }
        }}
        contentEditable={false}
      >
        {selected ? (
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            className="ui-button-input"
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        ) : (
          text
        )}
      </button>
    </NodeViewWrapper>
  )
}

export default ButtonNodeView
