# Testing WordPress Block Output

The UI Builder can export your layout as **WordPress block markup** (Gutenberg format). This guide explains how to test that output in a WordPress site.

## Export format

- Click **Export WordPress blocks** in the toolbar to download `ui-builder-blocks.html`.
- The file contains block comments and HTML in the standard Gutenberg format:
  - **Core blocks**: `wp:paragraph` for paragraphs (WordPress omits the `core` namespace in comments).
  - **Custom blocks**: `wp:ui-builder/button`, `wp:ui-builder/input`, `wp:ui-builder/container`, etc., with attributes as JSON.

Example:

```html
<!-- wp:paragraph -->
<p>Hello world</p>
<!-- /wp:paragraph -->
<!-- wp:ui-builder/button {"text":"Click me","variant":"primary","size":"medium"} /-->
<!-- wp:ui-builder/container {"direction":"vertical","gap":"medium","padding":"medium"} -->
<!-- wp:ui-builder/card {"title":"Card Title","padding":"medium","shadow":true} /-->
<!-- /wp:ui-builder/container -->
```

## Option 1: Paste into the Code editor (quick test)

1. In WordPress, create or edit a post or page.
2. Switch to the **Code editor**:
   - Click the **⋮** (three dots) in the top-right of the block editor.
   - Choose **Code editor**.
3. Open your exported `ui-builder-blocks.html` in a text editor and copy its full contents.
4. Paste into the Code editor (you can replace the whole content or paste at the cursor).
5. Switch back to **Visual editor** (⋮ → **Visual editor**).

- **Core blocks** (e.g. `wp:paragraph`) will render as normal paragraphs.
- **Custom blocks** (`wp:ui-builder/*`) will show as “unregistered” or placeholder blocks until you register them (see Option 2). The structure and attributes are preserved.

This confirms that the block markup is valid and that WordPress parses it.

## Option 2: Register blocks and render in the theme

To actually render `ui-builder/*` blocks (button, input, container, card, etc.) you need to register them in WordPress.

1. **Create a plugin or use your theme** to register each block (e.g. `ui-builder/button`, `ui-builder/input`, `ui-builder/container`, `ui-builder/card`, `ui-builder/textarea`, `ui-builder/select`).
2. For each block, use the **Block API** (`registerBlockType`) and map the saved attributes from the export (e.g. `text`, `variant`, `size` for button) to your block’s `attributes` and `save` (or server-side render).
3. Ensure block names match exactly: `ui-builder/button`, `ui-builder/input`, etc.

After registration, pasting the same export into the Code editor (or loading content that contains it) will show your blocks as intended.

## Option 3: Use the block as raw HTML for debugging

If you only need to inspect the markup:

1. Edit a post in the **Code editor**.
2. Paste the exported block markup.
3. Save and view the post. Unregistered blocks may render as empty or with minimal markup; the important part is that the block boundaries and attributes are stored correctly for when you add the block implementations.

## Block names reference

| UI Builder component | WordPress block name        |
|----------------------|-----------------------------|
| Paragraph            | `paragraph` (core)           |
| Button               | `ui-builder/button`         |
| Input                | `ui-builder/input`          |
| Text Area            | `ui-builder/textarea`       |
| Select               | `ui-builder/select`         |
| Card                 | `ui-builder/card`           |
| Container            | `ui-builder/container`      |

Attributes for each block are exported as JSON in the opening comment (e.g. `{"text":"Click me","variant":"primary"}` for a button). Use these when defining your block’s `attributes` in `registerBlockType`.
