import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ButtonNodeView from '../../components/node-views/ButtonNodeView'

export interface ButtonOptions {
  HTMLAttributes: Record<string, any>
}

export const ButtonExtension = Node.create<ButtonOptions>({
  name: 'button',
  group: 'block',
  atom: true,

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
      text: {
        default: 'Click me',
        parseHTML: element => element.textContent,
        renderHTML: () => {
          return {}
        },
      },
      variant: {
        default: 'primary',
        parseHTML: element => element.getAttribute('data-variant'),
        renderHTML: attributes => {
          if (!attributes.variant) {
            return {}
          }
          return {
            'data-variant': attributes.variant,
          }
        },
      },
      size: {
        default: 'medium',
        parseHTML: element => element.getAttribute('data-size'),
        renderHTML: attributes => {
          if (!attributes.size) {
            return {}
          }
          return {
            'data-size': attributes.size,
          }
        },
      },
      onClick: {
        default: '',
        parseHTML: element => element.getAttribute('data-onclick'),
        renderHTML: attributes => {
          if (!attributes.onClick) {
            return {}
          }
          return {
            'data-onclick': attributes.onClick,
          }
        },
      },
      disabled: {
        default: false,
        parseHTML: element => element.hasAttribute('disabled'),
        renderHTML: attributes => {
          if (!attributes.disabled) {
            return {}
          }
          return {
            disabled: attributes.disabled,
          }
        },
      },
      className: {
        default: '',
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
    }
  },

  parseHTML() {
    return [
      {
        tag: 'button[data-type="ui-button"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'button',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'ui-button',
        'data-id': node.attrs.id,
        'data-variant': node.attrs.variant,
        'data-size': node.attrs.size,
        'data-onclick': node.attrs.onClick,
      }),
      node.attrs.text,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ButtonNodeView)
  },
})
