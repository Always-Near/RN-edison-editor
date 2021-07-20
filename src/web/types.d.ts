declare interface Window {
  ReactNativeWebView: any;
  format: (format: any) => void;
  setDefaultValue: (html: string) => void;
  setStyle: (style: string) => void;
  setIsDarkMode: (style: string) => void;
  setEditorPlaceholder: (placeholder: string) => void;
  focusTextEditor: () => void;
  blurTextEditor: () => void;
}
