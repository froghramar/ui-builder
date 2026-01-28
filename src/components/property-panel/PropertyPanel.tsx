import { Editor } from '@tiptap/core'
import { useComponentSelection } from '../../hooks/useComponentSelection'
import { componentRegistry } from '../registry/ComponentRegistry'
import './PropertyPanel.css'

interface PropertyPanelProps {
  editor: Editor | null
}

const PropertyPanel = ({ editor }: PropertyPanelProps) => {
  const { selectedNode, selectedNodeId } = useComponentSelection(editor)

  if (!selectedNode || !selectedNodeId || !editor) {
    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>Properties</h3>
        </div>
        <div className="property-panel-empty">
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const componentDef = componentRegistry.get(selectedNode.type.name)
  const metadata = componentDef?.metadata

  const updateAttribute = (key: string, value: any) => {
    const { state } = editor

    let targetPos: number | null = null
    state.doc.descendants((node, pos) => {
      if (node.attrs.id === selectedNodeId) {
        targetPos = pos
        return false
      }
    })

    if (targetPos !== null) {
      const tr = state.tr
      tr.setNodeMarkup(targetPos, undefined, {
        ...selectedNode.attrs,
        [key]: value,
      })
      editor.view.dispatch(tr)
    }
  }

  const renderPropertyInput = (key: string, value: any, schema?: any) => {
    if (!schema) {
      // Default to text input
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => updateAttribute(key, e.target.value)}
          className="property-input"
        />
      )
    }

    switch (schema.type) {
      case 'string':
      case 'textarea':
        if (schema.type === 'textarea') {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => updateAttribute(key, e.target.value)}
              className="property-textarea"
              rows={3}
            />
          )
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateAttribute(key, e.target.value)}
            className="property-input"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => updateAttribute(key, Number(e.target.value))}
            className="property-input"
            min={schema.min}
            max={schema.max}
          />
        )

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => updateAttribute(key, e.target.checked)}
            className="property-checkbox"
          />
        )

      case 'color':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => updateAttribute(key, e.target.value)}
            className="property-color"
          />
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateAttribute(key, e.target.value)}
            className="property-select"
          >
            {schema.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateAttribute(key, e.target.value)}
            className="property-input"
          />
        )
    }
  }

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>Properties</h3>
        <p className="property-panel-component-name">{metadata?.name || selectedNode.type.name}</p>
      </div>
      <div className="property-panel-content">
        {Object.entries(selectedNode.attrs).map(([key, value]) => {
          if (key === 'id') return null
          
          const schema = metadata?.propSchema?.[key]
          const label = schema?.label || key.charAt(0).toUpperCase() + key.slice(1)

          return (
            <div key={key} className="property-field">
              <label className="property-label">{label}</label>
              {renderPropertyInput(key, value, schema)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PropertyPanel
