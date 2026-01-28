import { ComponentDefinition, ComponentCategory, ComponentRegistry as IComponentRegistry } from '../../types/component'

class ComponentRegistry implements IComponentRegistry {
  private components = new Map<string, ComponentDefinition>()

  register(definition: ComponentDefinition): void {
    this.components.set(definition.metadata.id, definition)
  }

  get(id: string): ComponentDefinition | undefined {
    return this.components.get(id)
  }

  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  getByCategory(category: ComponentCategory): ComponentDefinition[] {
    return this.getAll().filter(
      (def) => def.metadata.category === category
    )
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry()
