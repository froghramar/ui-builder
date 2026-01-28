import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextSelection } from '@tiptap/pm/state'
import { 
  ButtonExtension, 
  InputExtension, 
  TextAreaExtension, 
  SelectExtension,
  CardExtension,
  ContainerExtension
} from '../../extensions/ui-builder'
import ComponentPalette from '../palette/ComponentPalette'
import PropertyPanel from '../property-panel/PropertyPanel'
import { componentRegistry } from '../registry/ComponentRegistry'
import { ComponentDefinition } from '../../types/component'
import { useEffect, useCallback } from 'react'
import { exportToJSON, exportToHTML, exportToReact, downloadFile } from '../../utils/export'
import { importFile } from '../../utils/import'
import './UIBuilderEditor.css'

// Register all components
const registerComponents = () => {
  // Button
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
        text: { type: 'string', label: 'Text', default: 'Click me' },
        variant: { type: 'select', label: 'Variant', default: 'primary', options: ['primary', 'secondary', 'outline'] },
        size: { type: 'select', label: 'Size', default: 'medium', options: ['small', 'medium', 'large'] },
        disabled: { type: 'boolean', label: 'Disabled', default: false },
        onClick: { type: 'string', label: 'On Click', default: '' },
      },
    },
    extension: ButtonExtension,
  }

  // Input
  const inputDef: ComponentDefinition = {
    metadata: {
      id: 'input',
      name: 'Input',
      description: 'Text input field',
      category: 'form',
      icon: '📝',
      defaultProps: {
        label: 'Label',
        placeholder: 'Enter text...',
        value: '',
        type: 'text',
        required: false,
        disabled: false,
      },
      propSchema: {
        label: { type: 'string', label: 'Label', default: 'Label' },
        placeholder: { type: 'string', label: 'Placeholder', default: 'Enter text...' },
        value: { type: 'string', label: 'Value', default: '' },
        type: { type: 'select', label: 'Type', default: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
        required: { type: 'boolean', label: 'Required', default: false },
        disabled: { type: 'boolean', label: 'Disabled', default: false },
      },
    },
    extension: InputExtension,
  }

  // TextArea
  const textAreaDef: ComponentDefinition = {
    metadata: {
      id: 'textarea',
      name: 'Text Area',
      description: 'Multi-line text input',
      category: 'form',
      icon: '📄',
      defaultProps: {
        label: 'Label',
        placeholder: 'Enter text...',
        value: '',
        rows: 4,
        required: false,
        disabled: false,
      },
      propSchema: {
        label: { type: 'string', label: 'Label', default: 'Label' },
        placeholder: { type: 'string', label: 'Placeholder', default: 'Enter text...' },
        value: { type: 'textarea', label: 'Value', default: '' },
        rows: { type: 'number', label: 'Rows', default: 4, min: 2, max: 20 },
        required: { type: 'boolean', label: 'Required', default: false },
        disabled: { type: 'boolean', label: 'Disabled', default: false },
      },
    },
    extension: TextAreaExtension,
  }

  // Select
  const selectDef: ComponentDefinition = {
    metadata: {
      id: 'select',
      name: 'Select',
      description: 'Dropdown select field',
      category: 'form',
      icon: '📋',
      defaultProps: {
        label: 'Label',
        options: ['Option 1', 'Option 2', 'Option 3'],
        value: '',
        required: false,
        disabled: false,
      },
      propSchema: {
        label: { type: 'string', label: 'Label', default: 'Label' },
        options: { type: 'textarea', label: 'Options (one per line)', default: 'Option 1\nOption 2\nOption 3' },
        value: { type: 'string', label: 'Selected Value', default: '' },
        required: { type: 'boolean', label: 'Required', default: false },
        disabled: { type: 'boolean', label: 'Disabled', default: false },
      },
    },
    extension: SelectExtension,
  }

  // Card
  const cardDef: ComponentDefinition = {
    metadata: {
      id: 'card',
      name: 'Card',
      description: 'Card container with header',
      category: 'layout',
      icon: '🃏',
      defaultProps: {
        title: 'Card Title',
        padding: 'medium',
        shadow: true,
      },
      propSchema: {
        title: { type: 'string', label: 'Title', default: 'Card Title' },
        padding: { type: 'select', label: 'Padding', default: 'medium', options: ['small', 'medium', 'large'] },
        shadow: { type: 'boolean', label: 'Shadow', default: true },
      },
    },
    extension: CardExtension,
  }

  // Container
  const containerDef: ComponentDefinition = {
    metadata: {
      id: 'container',
      name: 'Container',
      description: 'Flexible container for nesting components',
      category: 'layout',
      icon: '📦',
      defaultProps: {
        direction: 'vertical',
        gap: 'medium',
        padding: 'medium',
      },
      propSchema: {
        direction: { type: 'select', label: 'Direction', default: 'vertical', options: ['vertical', 'horizontal'] },
        gap: { type: 'select', label: 'Gap', default: 'medium', options: ['small', 'medium', 'large'] },
        padding: { type: 'select', label: 'Padding', default: 'medium', options: ['small', 'medium', 'large'] },
      },
    },
    extension: ContainerExtension,
  }

  componentRegistry.register(buttonDef)
  componentRegistry.register(inputDef)
  componentRegistry.register(textAreaDef)
  componentRegistry.register(selectDef)
  componentRegistry.register(cardDef)
  componentRegistry.register(containerDef)
}

const UIBuilderEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ButtonExtension,
      InputExtension,
      TextAreaExtension,
      SelectExtension,
      CardExtension,
      ContainerExtension,
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
    e.stopPropagation()
    if (!editor) return

    const componentId = e.dataTransfer.getData('application/component-id')
    if (!componentId) return

    const componentDef = componentRegistry.get(componentId)
    if (!componentDef) return

    const { state } = editor
    
    // Get precise position from mouse coordinates
    const coordinates = editor.view.posAtCoords({
      left: e.clientX,
      top: e.clientY,
    })

    if (!coordinates) {
      // Fallback: insert at current selection
      const id = `${componentId}-${Date.now()}`
      const nodeType = state.schema.nodes[componentDef.extension.name]
      if (!nodeType) return

      const node = nodeType.create({
        ...componentDef.metadata.defaultProps,
        id,
      })

      const tr = state.tr
      tr.replaceSelectionWith(node)
      editor.view.dispatch(tr)
      return
    }

    const id = `${componentId}-${Date.now()}`
    const nodeType = state.schema.nodes[componentDef.extension.name]
    if (!nodeType) return

    const node = nodeType.create({
      ...componentDef.metadata.defaultProps,
      id,
    })

    const tr = state.tr
    // Insert at the calculated position
    tr.insert(coordinates.pos, node)
    editor.view.dispatch(tr)
    
    // Select the newly inserted node
    setTimeout(() => {
      const newState = editor.state
      const newSelection = TextSelection.near(newState.doc.resolve(coordinates.pos))
      const newTr = newState.tr.setSelection(newSelection)
      editor.view.dispatch(newTr)
    }, 0)
  }, [editor])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }, [])

  const handleImportClick = useCallback(() => {
    if (!editor) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const success = await importFile(editor, file)
      if (!success) {
        alert('Failed to import file. Please ensure it is a valid JSON file exported from this UI builder.')
      }
    }
    input.click()
  }, [editor])

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
              onClick={handleImportClick}
              className="toolbar-button"
              title="Import JSON file"
            >
              📥 Import JSON
            </button>
            <button
              onClick={() => {
                const json = exportToJSON(editor)
                downloadFile(json, 'ui-builder.json', 'application/json')
              }}
              className="toolbar-button"
              title="Export as JSON"
            >
              📤 Export JSON
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
          onDragLeave={handleDragLeave}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
      <PropertyPanel editor={editor} />
    </div>
  )
}

export default UIBuilderEditor
