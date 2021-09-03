declare interface Window {
  ReactNativeWebView: any;
  format: (format: any) => void;
  addImage: (path: string) => void;
  setDefaultValue: (html: string) => void;
  setStyle: (style: string) => void;
  setIsDarkMode: (style: string) => void;
  setFontSize: (fontSize: string) => void;
  setEditorPlaceholder: (placeholder: string) => void;
  focusTextEditor: () => void;
  blurTextEditor: () => void;
}
