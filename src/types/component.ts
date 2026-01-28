import { Node } from '@tiptap/core'

export type ComponentCategory = 
  | 'basic' 
  | 'layout' 
  | 'form' 
  | 'media' 
  | 'advanced'

export interface ComponentMetadata {
  id: string
  name: string
  description: string
  category: ComponentCategory
  icon?: string
  defaultProps: Record<string, any>
  propSchema?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'textarea'
    label: string
    default?: any
    options?: string[] // for select type
    min?: number
    max?: number
  }>
}

export interface ComponentDefinition {
  metadata: ComponentMetadata
  extension: Node
  nodeView?: React.ComponentType<any>
}

export interface ComponentRegistry {
  register(definition: ComponentDefinition): void
  get(id: string): ComponentDefinition | undefined
  getAll(): ComponentDefinition[]
  getByCategory(category: ComponentCategory): ComponentDefinition[]
}
