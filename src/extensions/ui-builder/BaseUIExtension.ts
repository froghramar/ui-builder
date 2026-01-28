import { Node, mergeAttributes } from '@tiptap/core'

export interface BaseUIOptions {
  HTMLAttributes: Record<string, any>
}

export const BaseUIExtension = Node.create<BaseUIOptions>({
  name: 'baseUI',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      className: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.className) {
            return {}
          }
          return {
            class: attributes.className,
          }
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ui-component"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'ui-component',
      }),
      0,
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-type', 'ui-component')
      
      if (node.attrs.id) {
        dom.setAttribute('data-id', node.attrs.id)
      }
      
      if (node.attrs.className) {
        dom.className = node.attrs.className
      }
      
      if (node.attrs.style) {
        dom.setAttribute('style', node.attrs.style)
      }

      Object.keys(HTMLAttributes).forEach(key => {
        dom.setAttribute(key, HTMLAttributes[key])
      })

      return {
        dom,
      }
    }
  },
})
