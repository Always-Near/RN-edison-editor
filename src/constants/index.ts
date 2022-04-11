export const EventName = {
  IsMounted: "isMounted",
  EditorChange: "editorChange",
  ContentChange: "contentChange",
  ActiveStyleChange: "activeStyleChange",
  SizeChange: "sizeChange",
  EditPosition: "editPosition",
  OnFocus: "onFocus",
  OnBlur: "onBlur",
  OnPastedImage: "onPastedImage",
} as const;

export const BaseInlineStyles = {
  Bold: "bold",
  Italic: "italic",
  Strikethrough: "strike",
  Underline: "underline",
} as const;

export const SpecialInlineStyles = {
  BackgroundColor: "background",
  Link: "link",
} as const;

export const SpecialKeepInlineStyles = {
  Color: "color",
  Font: "font",
  Size: "size",
} as const;

export const BlockStyles = {
  IndentIncrease: { type: "indent", value: "+1" } as const,
  IndentDecrease: { type: "indent", value: "-1" } as const,
  UnorderedList: { type: "list", value: "bullet" } as const,
  OrderedList: { type: "list", value: "ordered" } as const,
} as const;

export const ClearStyle = "CLEAR";

export type FormatType =
  | typeof ClearStyle
  | keyof typeof BaseInlineStyles
  | `${keyof typeof SpecialInlineStyles}-${string}`
  | `${keyof typeof SpecialKeepInlineStyles}-${string}`
  | keyof typeof BlockStyles;

export const MaxIndent = 8;
