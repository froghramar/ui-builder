import { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { componentRegistry } from '../registry/ComponentRegistry'
import { ComponentCategory } from '../../types/component'
import { useCallback, useState } from 'react'
import './ComponentPalette.css'

const categoryLabels: Record<ComponentCategory, string> = {
  basic: 'Basic',
  layout: 'Layout',
  form: 'Form',
  media: 'Media',
  advanced: 'Advanced',
}

interface ComponentPaletteProps {
  editor: Editor | null
}

const ComponentPalette = ({ editor }: ComponentPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all')

  const insertComponent = useCallback((componentId: string) => {
    if (!editor) return

    const componentDef = componentRegistry.get(componentId)
    if (!componentDef) return

    const { state } = editor
    const { selection } = state
    const { $anchor } = selection

    // Generate unique ID for the component
    const id = `${componentId}-${Date.now()}`

    // Create node with default props
    const nodeType = state.schema.nodes[componentDef.extension.name]
    if (!nodeType) return

    const node = nodeType.create({
      ...componentDef.metadata.defaultProps,
      id,
    })

    const tr = state.tr
    tr.replaceSelectionWith(node)
    editor.view.dispatch(tr)

    // Select the new node
    setTimeout(() => {
      const newState = editor.state
      const newSelection = TextSelection.near(
        newState.doc.resolve($anchor.pos)
      )
      const newTr = newState.tr.setSelection(newSelection)
      editor.view.dispatch(newTr)
    }, 0)
  }, [editor])

  const handleDragStart = useCallback((e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData('application/component-id', componentId)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  const allComponents = componentRegistry.getAll()
  const categories = Array.from(new Set(allComponents.map(c => c.metadata.category))) as ComponentCategory[]

  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = component.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || component.metadata.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="component-palette">
      <div className="component-palette-header">
        <h3>Components</h3>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="component-palette-search"
        />
      </div>
      
      <div className="component-palette-categories">
        <button
          className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      <div className="component-palette-list">
        {filteredComponents.length === 0 ? (
          <div className="component-palette-empty">
            <p>No components found</p>
          </div>
        ) : (
          filteredComponents.map(component => (
            <div
              key={component.metadata.id}
              className="component-palette-item"
              draggable
              onDragStart={(e) => handleDragStart(e, component.metadata.id)}
              onClick={() => insertComponent(component.metadata.id)}
            >
              <div className="component-palette-item-icon">
                {component.metadata.icon || '📦'}
              </div>
              <div className="component-palette-item-info">
                <div className="component-palette-item-name">
                  {component.metadata.name}
                </div>
                <div className="component-palette-item-description">
                  {component.metadata.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ComponentPalette
