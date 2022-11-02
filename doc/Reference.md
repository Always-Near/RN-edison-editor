# rn-edison-editor API Reference

## Props Index

- [`style`](#style)
- [`contentStyle`](#contentStyle)
- [`defaultValue`](#defaultValue)
- [`disableInputImage`](#disableInputImage)
- [`placeholder`](#placeholder)
- [`isDarkMode`](#isDarkMode)
- [`defaultFontSize`](#defaultFontSize)
- [`padding`](#padding)
- [`androidLayerType`](#androidLayerType)
- [`onEditorReady`](#onEditorReady)
- [`onActiveStyleChange`](#onActiveStyleChange)
- [`onSizeChange`](#onSizeChange)
- [`editPosition`](#editPosition)
- [`onEditorChange`](#onEditorChange)
- [`onContentChange`](#onContentChange)
- [`onPastedImage`](#onPastedImage)
- [`onBlur`](#onBlur)
- [`onFocus`](#onFocus)
- [`onError`](#onError)

## Methods Index

- [`focus`](#focus)
- [`blur`](#blur)
- [`setStyle`](#setStyle)
- [`addImage`](#addImage)
- [`addLink`](#addLink)
- [`getEditorState`](#getEditorState)

---

# Reference

## Props

### `style`[⬆](#props-index)

style for webview

| Type        | Required | Default value |
| ----------- | -------- | ------------- |
| `ViewStyle` | No       | `{ flex: 1 }` |

### `contentStyle`[⬆](#props-index)

style for editor box in html

| Type                  | Required | Default value |
| --------------------- | -------- | ------------- |
| `React.CSSProperties` | No       | `{}`          |

### `defaultValue`[⬆](#props-index)

the default html to show in editor

| Type     | Required | Default value |
| -------- | -------- | ------------- |
| `string` | No       | `''`          |

### `disableInputImage`[⬆](#props-index)

if set `disableInputImage` to `true`, the image will not be inserted and will not be displayed in editor.

| Type      | Required | Default value |
| --------- | -------- | ------------- |
| `boolean` | No       | `false`       |

### `placeholder`[⬆](#props-index)

placeholder for editor

| Type     | Required | Default value |
| -------- | -------- | ------------- |
| `string` | No       | `''`          |

### `isDarkMode`[⬆](#props-index)

if set `isDarkMode` to `true`, the editor will toggle to dark mode.

| Type      | Required | Default value |
| --------- | -------- | ------------- |
| `boolean` | No       | `false`       |

### `defaultFontSize`[⬆](#props-index)

set font size to fit system font zoom

| Type     | Required | Default value |
| -------- | -------- | ------------- |
| `number` | No       | `16`          |

### `padding`[⬆](#props-index)

set padding for editor box in html

| Type                                                     | Required | Default value                                    |
| -------------------------------------------------------- | -------- | ------------------------------------------------ |
| `{ paddingVertical: number; paddingHorizontal: number }` | No       | `{ paddingVertical: 24, paddingHorizontal: 28 }` |

### `androidLayerType`[⬆](#props-index)

Sets the layerType.

| Type                           | Required | Default value |
| ------------------------------ | -------- | ------------- |
| `none`, `software`, `hardware` | No       | `none`        |

### `onEditorReady`[⬆](#props-index)

This method is triggered when the html component mounted

| Type         | Required | Default value |
| ------------ | -------- | ------------- |
| `() => void` | No       | `() => null`  |

### `onActiveStyleChange`[⬆](#props-index)

This method is triggered when the style for editor content is changed

| Type                             | Required | Default value |
| -------------------------------- | -------- | ------------- |
| `(styles: FormatType[]) => void` | No       | `undefined`   |

### `onSizeChange`[⬆](#props-index)

This method is triggered when the height for html is changed

| Type                     | Required | Default value |
| ------------------------ | -------- | ------------- |
| `(size: number) => void` | No       | `undefined`   |

### `editPosition`[⬆](#props-index)

This method is triggered when the selection position for html is changed, used to calculate the scroll height to keep the cursor in the visible area

| Type                     | Required | Default value |
| ------------------------ | -------- | ------------- |
| `(pos: number) => void;` | No       | `undefined`   |

### `onEditorChange`[⬆](#props-index)

This method is triggered when the content for editor is changed

| Type                        | Required | Default value |
| --------------------------- | -------- | ------------- |
| `(content: string) => void` | No       | `undefined`   |

### `onContentChange`[⬆](#props-index)

This method is triggered when the content for editor is changed. It only fires once and marks whether the user has edited the content

| Type         | Required | Default value |
| ------------ | -------- | ------------- |
| `() => void` | No       | `undefined`   |

### `onPastedImage`[⬆](#props-index)

This method is triggered when the user pastes in an image. You'll get a local path or a base64 string

| Type                    | Required | Default value |
| ----------------------- | -------- | ------------- |
| `(src: string) => void` | No       | `undefined`   |

### `onBlur`[⬆](#props-index)

This method is triggered when the editor blur

| Type         | Required | Default value |
| ------------ | -------- | ------------- |
| `() => void` | No       | `undefined`   |

### `onFocus`[⬆](#props-index)

This method is triggered when the editor focus

| Type         | Required | Default value |
| ------------ | -------- | ------------- |
| `() => void` | No       | `undefined`   |

### `onError`[⬆](#props-index)

`onError` for webview

| Type                            | Required | Default value |
| ------------------------------- | -------- | ------------- |
| `(error: WebViewError) => void` | No       | `undefined`   |

## Methods

### `goForward()`[⬆](#methods-index)

### `focus`[⬆](#methods-index)

### `blur`[⬆](#methods-index)

### `setStyle`[⬆](#methods-index)

### `addImage`[⬆](#methods-index)

### `addLink`[⬆](#methods-index)

### `getEditorState`[⬆](#methods-index)
