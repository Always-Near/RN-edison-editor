import { Buffer } from "buffer";
import React, { createRef } from "react";
import ReactQuill from "react-quill";
import Delta from "quill-delta";
import _ from "underscore";
import "react-quill/dist/quill.snow.css";
import { EventName, FormatType } from "../../constants";
import "./styles.less";
import { format, getActiveStyles, addImage } from "./utils";

type State = {
  html: string;
  contentIsChange: boolean;
  placeholder: string;
  style: React.CSSProperties;
  isDarkMode: boolean;
};

const darkModeStyle = `
  :root {
    filter: invert(100%);
  }
`;

class Editor extends React.Component<any, State> {
  private quillRef = createRef<ReactQuill>();
  private height: number;
  private selectionPosition: number;
  constructor(props: any) {
    super(props);
    this.state = {
      html: "",
      contentIsChange: false,
      placeholder: "",
      style: {},
      isDarkMode: false,
    };
    this.height = 0;
    this.selectionPosition = 0;
  }

  componentDidMount() {
    this.postMessage(EventName.IsMounted, true);
    window.format = this.format;
    window.addImage = this.addImage;
    window.setDefaultValue = this.setDefaultValue;
    window.setStyle = this.setStyle;
    window.setIsDarkMode = this.setIsDarkMode;
    window.setEditorPlaceholder = this.setEditorPlaceholder;
    window.focusTextEditor = this.focusTextEditor;
    window.blurTextEditor = this.blurTextEditor;
    // add blur event listener
    window.onblur = () => {
      this.postMessage(EventName.OnBlur, true);
    };
    window.onfocus = () => {
      setTimeout(() => {
        this.postMessage(EventName.OnFocus, true);
        this.focusTextEditor();
      }, 200);
    };
    // auto focus when click html
    document.addEventListener("click", (e) => {
      const clickDom = e.target as Element | null;
      if (clickDom?.tagName === "HTML") {
        this.focusTextEditor();
      }
    });

    this.onHeightChangeDebounce();
  }

  private postMessage = (type: string, data: any) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: type,
          data: data,
        })
      );
    }
  };

  private checkContentIsChange = () => {
    const { contentIsChange } = this.state;
    if (contentIsChange) {
      return;
    }

    this.setState({ contentIsChange: true });
    this.postMessage(EventName.ContentChange, true);
  };

  private onChange = (html: string) => {
    this.checkContentIsChange();
    this.setState({ html }, () => {
      this.postMessage(EventName.EditorChange, html);
      this.onActiveStyleChangeDebounce();
      this.onHeightChangeDebounce();
      this.onSelectionPositionChangeDebounce();
    });
  };

  private onChangeSelection = () => {
    this.onActiveStyleChangeDebounce();
    this.onSelectionPositionChangeDebounce();
  };

  private onActiveStyleChange = () => {
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    const activeStyles = getActiveStyles(quill);
    this.postMessage(EventName.ActiveStyleChange, activeStyles);
  };

  private onActiveStyleChangeDebounce = _.debounce(
    this.onActiveStyleChange,
    100
  );

  private onHeightChange = () => {
    const newHeight = document.body.scrollHeight;
    if (newHeight === this.height) {
      return;
    }
    this.height = newHeight;
    this.postMessage(EventName.SizeChange, newHeight);
  };

  private onHeightChangeDebounce = _.debounce(this.onHeightChange, 100);

  private onSelectionPositionChange = () => {
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    if (!quill) {
      return;
    }
    const selection = quill.getSelection();
    if (!selection) {
      return;
    }
    // returns a value of 0 on empty lines
    const pos = window
      .getSelection()
      ?.getRangeAt(0)
      .getBoundingClientRect()?.bottom;
    if (pos) {
      this.updateSelectionPosition(pos);
      return;
    }
    // should catch new line events
    const selectElement = window.getSelection()?.focusNode;
    if (!selectElement) {
      return;
    }
    if (selectElement.nodeType === Node.ELEMENT_NODE) {
      // should catch new line events
      const e = selectElement as Element;
      this.updateSelectionPosition(e.getBoundingClientRect().bottom);
    }
  };

  private onSelectionPositionChangeDebounce = _.debounce(
    this.onSelectionPositionChange,
    100
  );

  private updateSelectionPosition = (position: number) => {
    if (position === this.selectionPosition) {
      return;
    }
    this.selectionPosition = position;
    this.postMessage(EventName.EditPosition, position);
  };

  private setDefaultValue = (html: string) => {
    try {
      if (html) {
        const htmlStr = Buffer.from(html, "base64").toString("utf-8");
        // clear the meta to keep style
        const reg = /<meta\s+name=(['"\s]?)viewport\1\s+content=[^>]*>/gi;
        this.onChange(htmlStr.replace(reg, ""));
      }
    } catch (e) {
      console.error(e);
    }
  };

  private setStyle = (style: string) => {
    try {
      const styleJson = JSON.parse(style);
      this.setState({ style: styleJson });
    } catch (err) {
      console.log(err.message);
    }
  };

  private setIsDarkMode = (isDarkMode: string) => {
    this.setState({ isDarkMode: isDarkMode === "true" });
  };

  private setEditorPlaceholder = (placeholder: string) => {
    this.setState({ placeholder });
  };

  private focusTextEditor = () => {
    this.quillRef.current && this.quillRef.current.focus();
  };

  private blurTextEditor = () => {
    this.quillRef.current && this.quillRef.current.blur();
  };

  private onFocus = () => {
    this.postMessage(EventName.OnFocus, true);
  };

  private onBlur = () => {
    this.postMessage(EventName.OnBlur, true);
  };

  render() {
    const { placeholder, html, style, isDarkMode } = this.state;

    return (
      <>
        <style>{isDarkMode ? darkModeStyle : ""}</style>
        <div
          className={`compose-editor ${isDarkMode ? "dark_mode" : ""}`}
          style={style}
        >
          <ReactQuill
            ref={this.quillRef}
            theme="snow"
            placeholder={placeholder}
            value={html}
            onChange={(content) => this.onChange(content)}
            onChangeSelection={this.onChangeSelection}
            modules={{
              clipboard: {
                matchers: [["IMG", this.matcherForImage]],
              },
            }}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </div>
      </>
    );
  }

  private format = (style: FormatType) => {
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    if (!quill) {
      return;
    }
    format(quill, style);
    this.onActiveStyleChangeDebounce();
  };

  private addImage = (path: string) => {
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    if (!quill) {
      return;
    }
    addImage(quill, path);
  };

  private matcherForImage = (node: Node, delta: Delta) => {
    const el = node as HTMLImageElement;
    const src = el.getAttribute("src");
    if (!src) {
      return new Delta();
    }
    if (src.startsWith("http")) {
      return delta;
    }
    this.postMessage(EventName.OnPastedImage, src);
    return new Delta();
  };
}

export default Editor;
