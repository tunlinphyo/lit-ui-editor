# Frontend page JSON output

This document defines the JSON payload consumed by a frontend page renderer. It is a
read-only format: it contains **blocks only** and intentionally does not expose the
editor's group/layout objects.

The blocks are rendered in array order. A frontend may render them with the
`lit-ui-editor-view` custom elements:

| `type` | Custom element |
| --- | --- |
| `p` | `<rich-text-view>` |
| `inline-text` | `<inline-text-view>` |
| `table` | `<table-view>` |
| `image` | `<image-view>` |
| `icon` | `<icon-view>` |
| `button` | `<button-view>` |

## Page payload

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "intro",
      "type": "p",
      "textAlign": "left",
      "fontFamily": "var(--font-body)",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "text": "Welcome to our service.",
              "marks": {
                "color": "var(--brand-900)",
                "fontSize": "var(--font-size-base)"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "inline-text",
      "elementType": "h2",
      "textAlign": "left",
      "fontFamily": "var(--font-heading)",
      "children": [
        {
          "text": "How to apply",
          "marks": {
            "bold": true,
            "color": "var(--brand-900)",
            "fontSize": "var(--font-size-lg)"
          }
        }
      ]
    },
    {
      "id": "hero-image",
      "type": "image",
      "src": "https://cdn.example.com/hero.jpg",
      "alt": "People meeting in a bright room",
      "objectFit": "cover",
      "align": "center",
      "borderRadius": "var(--border-radius-lg)"
    },
    {
      "id": "apply-button",
      "type": "button",
      "text": "Apply now",
      "icon": "arrow_forward",
      "iconPosition": "end",
      "color": "#ffffff",
      "backgroundColor": "var(--ui-editor-primary)",
      "borderRadius": "999px",
      "link": "/apply",
      "target": "_self",
      "align": "center"
    }
  ]
}
```

### Required page fields

| Field | Type | Description |
| --- | --- | --- |
| `version` | number | Payload schema version. Current version: `1`. |
| `blocks` | array | Ordered array of frontend block objects. |

Each block must have a unique `id` and a supported `type`. Empty optional values
may be omitted.

## Rich text block: `p`

Use `type: "p"` for multi-paragraph rich text. `children` is an array of
paragraphs or lists.

```json
{
  "id": "content",
  "type": "p",
  "textAlign": "left",
  "fontWeight": "",
  "fontFamily": "var(--font-body)",
  "children": [
    {
      "type": "paragraph",
      "children": [
        { "text": "Normal text. " },
        { "text": "Bold text.", "marks": { "bold": true } },
        {
          "text": "Documentation",
          "marks": { "link": "/docs", "target": "_self", "underline": true }
        }
      ]
    },
    { "type": "paragraph", "children": [] },
    {
      "type": "unordered-list",
      "children": [
        { "type": "list-item", "children": [{ "text": "First item" }] },
        { "type": "list-item", "children": [{ "text": "Second item" }] }
      ]
    }
  ]
}
```

An empty `{ "type": "paragraph", "children": [] }` is an intentional blank
line and renders as `<p><br></p>`. The editor should not output a bare `<p></p>`.

### Text marks

Each text child has a required `text` string and an optional `marks` object.

| Mark | Type | Meaning |
| --- | --- | --- |
| `bold`, `italic`, `underline` | boolean | Inline text formatting. |
| `color` | string | CSS colour value. |
| `fontSize` | string | CSS font-size value. |
| `highlight` | boolean | Highlight text. |
| `backgroundColor` | string | Highlight colour. |
| `markStyle` | string | Optional `mark-primary` or `mark-secondary` style. |
| `link` | string | Link URL/path. |
| `target` | string | `_self`, `_blank`, `_parent`, or `_top`. |

Newlines in `text` render as `<br>`.

## Inline text block: `inline-text`

Use `inline-text` for one heading or one non-paragraph text element.

```json
{
  "id": "title",
  "type": "inline-text",
  "elementType": "h1",
  "textAlign": "center",
  "fontSize": "var(--font-size-xxxl)",
  "fontFamily": "var(--font-heading)",
  "children": [
    { "text": "Page title", "marks": { "color": "var(--brand-900)" } }
  ]
}
```

`elementType` must be one of `p`, `h1`, `h2`, or `h3`. Its `children` use the
same text-child and `marks` format as rich text, but do not contain paragraph or
list wrapper objects.

## Table block: `table`

```json
{
  "id": "pricing-table",
  "type": "table",
  "headerRow": true,
  "headerColumn": false,
  "headerBackgroundColor": "var(--brand-900)",
  "bodyBackgroundColor": "#ffffff",
  "stripedRows": true,
  "stripeBackgroundColor": "var(--gray-25)",
  "borderWidth": "var(--border-width-xs)",
  "borderColor": "var(--gray-200)",
  "borderStyle": "solid",
  "borderPosition": "horizontal vertical",
  "cells": [
    [
      { "children": [{ "text": "Plan", "marks": { "bold": true } }] },
      { "children": [{ "text": "Price", "marks": { "bold": true } }], "textAlign": "right" }
    ],
    [
      { "children": [{ "text": "Standard" }] },
      { "children": [{ "text": "$10" }], "textAlign": "right" }
    ]
  ]
}
```

`cells` is a non-empty 2D array. Each cell supports `children`, `textAlign`,
`fontSize`, and `fontFamily`; its `children` are inline-text children. Valid
`borderPosition` values are `horizontal`, `vertical`, and `border_outer`, joined
with spaces.

## Image block: `image`

```json
{
  "id": "banner",
  "type": "image",
  "src": "https://cdn.example.com/banner.png",
  "alt": "Spring campaign banner",
  "objectFit": "cover",
  "align": "center",
  "link": "/campaign",
  "target": "_self",
  "backgroundColor": "#f7f7f7",
  "borderWidth": "var(--border-width-xs)",
  "borderColor": "var(--gray-200)",
  "borderStyle": "solid",
  "borderPosition": "top right bottom left",
  "borderRadius": "var(--border-radius-md)"
}
```

`objectFit` may be `none`, `contain`, `cover`, `fill`, or `scale-down`.

## Icon block: `icon`

```json
{
  "id": "location-icon",
  "type": "icon",
  "icon": "location_on",
  "fontSize": "var(--font-size-xl)",
  "color": "var(--brand-900)",
  "backgroundColor": "",
  "borderRadius": "var(--border-radius-sm)",
  "link": "/locations",
  "target": "_self",
  "align": "left"
}
```

`icon` is a [Material Symbols](https://fonts.google.com/icons) name. The
frontend must load `lit-ui-editor-view/styles.css` once so the icon font and
editor-compatible CSS tokens are available.

## Button block: `button`

```json
{
  "id": "contact-button",
  "type": "button",
  "text": "Contact us",
  "icon": "mail",
  "iconPosition": "start",
  "iconFontSize": "20px",
  "iconColor": "#ffffff",
  "color": "#ffffff",
  "backgroundColor": "var(--brand-900)",
  "borderWidth": "var(--border-width-xs)",
  "borderColor": "var(--brand-900)",
  "borderStyle": "solid",
  "borderPosition": "top right bottom left",
  "borderRadius": "999px",
  "link": "/contact",
  "target": "_self",
  "align": "center",
  "disabled": false
}
```

`iconPosition` is `start`, `end`, or `none`. A button with `link` renders as an
anchor; otherwise it renders as a disabled/enabled `<button>` according to
`disabled`.

## Frontend setup

```js
import "lit-ui-editor-view/styles.css";
import "lit-ui-editor-view";

const tagForType = {
  p: "rich-text-view",
  "inline-text": "inline-text-view",
  table: "table-view",
  image: "image-view",
  icon: "icon-view",
  button: "button-view",
};

export function renderPage(root, page) {
  root.replaceChildren(
    ...page.blocks.flatMap((block) => {
      const tagName = tagForType[block.type];
      if (!tagName) return [];

      const element = document.createElement(tagName);
      element.data = block;
      return element;
    }),
  );
}
```

The supplied stylesheet defines its defaults in the
`lit-ui-editor-view-defaults` CSS layer. Override tokens in application CSS,
for example `:root { --border-width-xs: 2px; }`, without `!important`.
