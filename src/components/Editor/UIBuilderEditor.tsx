import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ButtonExtension } from '../../extensions/ui-builder'
import ComponentPalette from '../palette/ComponentPalette'
import PropertyPanel from '../property-panel/PropertyPanel'
import { componentRegistry } from '../registry/ComponentRegistry'
import { ComponentDefinition } from '../../types/component'
import { useEffect, useCallback } from 'react'
import { exportToJSON, exportToHTML, exportToReact, downloadFile } from '../../utils/export'
import './UIBuilderEditor.css'

// Register the button component
const registerComponents = () => {
  const buttonDef: ComponentDefinition = {
    metadata: {
      id: 'button',
      name: 'Button',
      description: 'Interactive button component',
      category: 'basic',
      icon: '🔘',
      defaultProps: {
        text: 'Click me',
        variant: 'primary',
        size: 'medium',
        disabled: false,
        onClick: '',
      },
      propSchema: {
        text: {
          type: 'string',
          label: 'Text',
          default: 'Click me',
        },
        variant: {
          type: 'select',
          label: 'Variant',
          default: 'primary',
          options: ['primary', 'secondary', 'outline'],
        },
        size: {
          type: 'select',
          label: 'Size',
          default: 'medium',
          options: ['small', 'medium', 'large'],
        },
        disabled: {
          type: 'boolean',
          label: 'Disabled',
          default: false,
        },
        onClick: {
          type: 'string',
          label: 'On Click',
          default: '',
        },
      },
    },
    extension: ButtonExtension,
  }

  componentRegistry.register(buttonDef)
}

const UIBuilderEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ButtonExtension,
    ],
    content: '<p>Start building your UI by dragging components from the palette or clicking to add them.</p>',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
  })

  // Register components on mount
  useEffect(() => {
    registerComponents()
  }, [])

  // Handle drop from palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!editor) return

    const componentId = e.dataTransfer.getData('application/component-id')
    if (!componentId) return

    const componentDef = componentRegistry.get(componentId)
    if (!componentDef) return

    const { state } = editor
    const coordinates = editor.view.posAtCoords({
      left: e.clientX,
      top: e.clientY,
    })

    if (!coordinates) return

    const id = `${componentId}-${Date.now()}`
    const nodeType = state.schema.nodes[componentDef.extension.name]
    if (!nodeType) return

    const node = nodeType.create({
      ...componentDef.metadata.defaultProps,
      id,
    })

    const tr = state.tr
    tr.insert(coordinates.pos, node)
    editor.view.dispatch(tr)
  }, [editor])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="ui-builder-editor">
      <ComponentPalette editor={editor} />
      <div className="editor-canvas-container">
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="toolbar-button"
              title="Undo"
            >
              ↶ Undo
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="toolbar-button"
              title="Redo"
            >
              ↷ Redo
            </button>
          </div>
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <button
              onClick={() => {
                const json = exportToJSON(editor)
                downloadFile(json, 'ui-builder.json', 'application/json')
              }}
              className="toolbar-button"
              title="Export as JSON"
            >
              Export JSON
            </button>
            <button
              onClick={() => {
                const html = exportToHTML(editor)
                downloadFile(html, 'ui-builder.html', 'text/html')
              }}
              className="toolbar-button"
              title="Export as HTML"
            >
              Export HTML
            </button>
            <button
              onClick={() => {
                const react = exportToReact(editor)
                downloadFile(react, 'GeneratedComponent.tsx', 'text/typescript')
              }}
              className="toolbar-button"
              title="Export as React"
            >
              Export React
            </button>
          </div>
        </div>
        <div
          className="editor-canvas"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
      <PropertyPanel editor={editor} />
    </div>
  )
}

export default UIBuilderEditor
