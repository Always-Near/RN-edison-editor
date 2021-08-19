import { Buffer } from "buffer";
import Delta from "quill-delta";
import React, { createRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import _ from "underscore";
import { EventName, FormatType } from "../../constants";
import "./formats/block";
import "./formats/blockquote";
import "./formats/image";
import "./formats/table";
import "./formats/title";
import "./styles.less";
import {
  addImage,
  clearHTML,
  EventListener,
  EventListenerNames,
  format,
  getActiveStyles,
} from "./utils";

type State = {
  html: string;
  style: React.CSSProperties;
  isDarkMode: boolean;
};

const darkModeStyle = `
  html, body {
    background-color: #121212 !important;
  }
`;

const lightModeStyle = `
  html, body {
    background-color: #fffffe !important;
  }
`;

class Editor extends React.Component<any, State> {
  private quillRef = createRef<ReactQuill>();
  private height: number;
  private selectionPosition: number;
  private contentIsChangeFlag: boolean = false;
  private contentStartChangeFlag: boolean = false;

  constructor(props: any) {
    super(props);
    this.state = {
      html: "",
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

    // resize the editor height after image loaded
    EventListener.addEventListener(EventListenerNames.ImgOnload, () => {
      this.onHeightChangeDebounce();
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
    if (this.contentIsChangeFlag) {
      return;
    }
    if (!this.contentStartChangeFlag) {
      return;
    }
    this.contentIsChangeFlag = true;
    this.postMessage(EventName.ContentChange, true);
  };

  private onChange = (html: string, callback?: () => void) => {
    this.checkContentIsChange();
    this.setState({ html }, () => {
      this.postMessage(EventName.EditorChange, html);
      this.onActiveStyleChangeDebounce();
      this.onHeightChangeDebounce();
      this.onSelectionPositionChangeDebounce();
      callback && callback();
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
        const clearHtml = clearHTML(htmlStr);
        this.onChange(clearHtml, () => {
          setTimeout(() => {
            this.contentStartChangeFlag = true;
          }, 300);
        });
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
    const quill = this.quillRef.current?.getEditor();
    if (quill) {
      quill.root.dataset.placeholder = placeholder;
    } else {
      setTimeout(() => {
        this.setEditorPlaceholder(placeholder);
      }, 100);
    }
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
    const { html, style, isDarkMode } = this.state;
    return (
      <>
        <style>{isDarkMode ? darkModeStyle : lightModeStyle}</style>
        <div
          className={`compose-editor ${isDarkMode ? "dark_mode" : ""}`}
          style={style}
        >
          <ReactQuill
            ref={this.quillRef}
            theme="snow"
            value={html}
            onChange={(content) => this.onChange(content)}
            onChangeSelection={this.onChangeSelection}
            modules={{
              clipboard: {
                matchers: [
                  ["IMG", this.matcherForImage],
                  ["TABLE", this.matcherForTable],
                  ["BLOCKQUOTE", this.matcherForBlockQuote],
                ],
              },
            }}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </div>
      </>
    );
  }

  private matcherForTable = (node: Element, delta: Delta) => {
    return new Delta([
      {
        insert: {
          table: node.innerHTML,
        },
      },
    ]);
  };

  private matcherForBlockQuote = (node: Element, delta: Delta) => {
    return new Delta([
      {
        insert: {
          blockquote: node.innerHTML,
        },
      },
    ]);
  };

  private format = (style: FormatType) => {
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    if (!quill) {
      return;
    }
    format(quill, style);
    this.onActiveStyleChangeDebounce();
  };

  private addImage = (path: string) => {
    this.postMessage('DEBUGGER', 'PATH' + path)
    const quill = this.quillRef.current && this.quillRef.current.getEditor();
    if (!quill) {
      return;
    }
    addImage(quill, path);
  };

  private matcherForImage = (node: Element, delta: Delta) => {
    const src = node.getAttribute("src");
    if (!src) {
      return new Delta();
    }
    if (/^https?:\/\//.test(src) || /^data:image\/.+;base64/.test(src)) {
      this.postMessage(EventName.OnPastedImage, src);
      return delta;
    }
    if (/^blob:/.test(src)) {
      // pasted image in ios
      this.onPasteLocalImage(src);
      return new Delta();
    }
    // image is a local path
    this.postMessage(EventName.OnPastedImage, src);
    return delta;
  };

  private onPasteLocalImage = (url: string) => {
    fetch(url).then((res) => {
      res.blob().then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.postMessage(EventName.OnPastedImage, base64data);
        };
      });
    });
  };
}

export default Editor;
