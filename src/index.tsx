import React, { Component } from "react";
import { ViewStyle, Animated, Platform, TextInput } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";
import {
  WebViewErrorEvent,
  WebViewError,
} from "react-native-webview/lib/WebViewTypes";
import "./index.html";
import { EventName, FormatType } from "./constants";
export type { FormatType } from "./constants";

const packageName = "rn-edison-editor";
const draftJsFileTargetPath = `file://${RNFS.CachesDirectoryPath}/draftjs.html`;
let draftJsFilePath = draftJsFileTargetPath;

async function copyFileForIos() {
  const htmlPath = `file://${RNFS.MainBundlePath}/assets/node_modules/${packageName}/lib/index.html`;
  try {
    const fileHasExists = await RNFS.exists(draftJsFileTargetPath);
    if (fileHasExists) {
      await RNFS.unlink(draftJsFileTargetPath);
    }
    await RNFS.copyFile(htmlPath, draftJsFileTargetPath);
    return draftJsFileTargetPath;
  } catch (err) {
    // badcase remedy
    return htmlPath;
  }
}

async function copyFileForAndroid() {
  const htmlResPath = `raw/node_modules_${packageName.replace(
    /-/g,
    ""
  )}_lib_index.html`;
  try {
    const fileHasExists = await RNFS.exists(draftJsFileTargetPath);
    if (fileHasExists) {
      await RNFS.unlink(draftJsFileTargetPath);
    }
    await RNFS.copyFileRes(htmlResPath, draftJsFileTargetPath);
    return draftJsFileTargetPath;
  } catch (err) {
    // badcase remedy
    return `file:///android_res/${htmlResPath}`;
  }
}

async function copyFile() {
  if (Platform.OS === "ios") {
    const filePath = await copyFileForIos();
    draftJsFilePath = filePath;
  } else if (Platform.OS === "android") {
    const filePath = await copyFileForAndroid();
    draftJsFilePath = filePath;
  }
}

copyFile();

// It must be consistent with `web/types.d.ts`
const InjectScriptName = {
  Format: "format",
  AddImage: "addImage",
  SetDefaultValue: "setDefaultValue",
  SetStyle: "setStyle",
  SetIsDarkMode: "setIsDarkMode",
  SetFontSize: "setFontSize",
  SetEditorPlaceholder: "setEditorPlaceholder",
  FocusTextEditor: "focusTextEditor",
  BlurTextEditor: "blurTextEditor",
} as const;

export type File = {
  name: string;
  size: number;
  type: string;
  data: string;
};

type PropTypes = {
  style?: ViewStyle;
  contentStyle?: React.CSSProperties;
  defaultValue?: string;
  placeholder?: string;
  isDarkMode?: boolean;
  defaultFontSize?: number;
  androidLayerType?: "none" | "software" | "hardware";
  onEditorReady?: () => void;
  onActiveStyleChange?: (styles: FormatType[]) => void;
  onSizeChange?: (size: number) => void;
  editPosition?: (pos: number) => void;
  onEditorChange?: (content: string) => void;
  onContentChange?: () => void;
  onPastedImage?: (src: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onError?: (error: WebViewError) => void;
};

type DraftViewState = {
  webviewUri: string;
  editorState: string;
  loading: boolean;
};

class RNDraftView extends Component<PropTypes, DraftViewState> {
  timeoutMap: Map<string, NodeJS.Timeout> = new Map();
  webviewMounted: boolean = false;
  private webViewRef = React.createRef<WebView>();
  private textInputRef = React.createRef<TextInput>();
  loadingOpacity = new Animated.Value(1);

  constructor(props: any) {
    super(props);
    this.state = {
      webviewUri: "",
      editorState: "",
      loading: true,
    };
  }

  componentDidMount() {
    this.setState({ webviewUri: draftJsFilePath });
  }

  UNSAFE_componentWillReceiveProps = (nextProps: PropTypes) => {
    if (!this.webviewMounted) {
      return;
    }
    if (
      nextProps.isDarkMode !== undefined &&
      nextProps.isDarkMode !== this.props.isDarkMode
    ) {
      this.executeScript(
        InjectScriptName.SetIsDarkMode,
        nextProps.isDarkMode.toString()
      );
    }
    if (
      nextProps.defaultFontSize !== undefined &&
      nextProps.defaultFontSize !== this.props.defaultFontSize
    ) {
      this.executeScript(
        InjectScriptName.SetFontSize,
        nextProps.defaultFontSize.toString()
      );
    }
    if (
      nextProps.defaultValue &&
      nextProps.defaultValue !== this.props.defaultValue
    ) {
      const formatHtml = Buffer.from(nextProps.defaultValue, "utf-8").toString(
        "base64"
      );
      this.executeScript(InjectScriptName.SetDefaultValue, formatHtml);
    }
  };

  private doSomethingAfterMounted = (id: string, func: () => void) => {
    const timeout = this.timeoutMap.get(id);
    if (timeout) {
      clearTimeout(timeout);
    }
    if (!this.webviewMounted) {
      this.timeoutMap.set(
        id,
        setTimeout(() => {
          this.doSomethingAfterMounted(id, func);
        }, 100)
      );
      return;
    }
    func();
  };

  private executeScript = (
    functionName: typeof InjectScriptName[keyof typeof InjectScriptName],
    parameter?: string
  ) => {
    this.doSomethingAfterMounted(`executeScript-${functionName}`, () => {
      if (!this.webViewRef.current) {
        return;
      }
      this.webViewRef.current.injectJavaScript(
        `window.${functionName} && window.${functionName}(${
          parameter ? `'${parameter}'` : ""
        });true;`
      );
    });
  };

  private onMessage = (event: WebViewMessageEvent) => {
    const {
      onEditorChange,
      onActiveStyleChange,
      editPosition,
      onSizeChange,
      onBlur,
      onFocus,
      onContentChange,
      onPastedImage,
    } = this.props;
    try {
      const {
        type,
        data,
      }: {
        type: typeof EventName[keyof typeof EventName];
        data: any;
      } = JSON.parse(event.nativeEvent.data);
      if (type === EventName.IsMounted) {
        this.widgetMounted();
        return;
      }
      if (type === EventName.EditorChange) {
        this.setState(
          { editorState: data.replace(/(\r\n|\n|\r)/gm, "") },
          () => {
            onEditorChange && onEditorChange(this.state.editorState);
          }
        );
        return;
      }
      if (type === EventName.ActiveStyleChange) {
        onActiveStyleChange && onActiveStyleChange(data);
        return;
      }
      if (type === EventName.EditPosition && editPosition) {
        editPosition(data);
        return;
      }
      if (type === EventName.SizeChange && onSizeChange) {
        onSizeChange(data);
        return;
      }
      if (type === EventName.OnBlur && onBlur) {
        onBlur();
        return;
      }
      if (type === EventName.OnFocus && onFocus) {
        onFocus();
        return;
      }
      if (type === EventName.ContentChange && onContentChange) {
        onContentChange();
        return;
      }
      if (type === EventName.OnPastedImage && onPastedImage) {
        onPastedImage(data);
        return;
      }
    } catch (err) {}
  };

  private onError = (event: WebViewErrorEvent) => {
    if (this.props.onError) {
      this.props.onError(event.nativeEvent);
    }
  };

  private widgetMounted = () => {
    this.webviewMounted = true;

    const {
      placeholder,
      defaultValue,
      contentStyle,
      isDarkMode = false,
      defaultFontSize,
      onEditorReady = () => null,
    } = this.props;

    if (defaultValue) {
      const formatHtml = Buffer.from(defaultValue, "utf-8").toString("base64");
      this.executeScript(InjectScriptName.SetDefaultValue, formatHtml);
    }
    if (contentStyle) {
      this.executeScript(
        InjectScriptName.SetStyle,
        JSON.stringify(contentStyle)
      );
    }
    if (placeholder) {
      this.executeScript(InjectScriptName.SetEditorPlaceholder, placeholder);
    }
    this.executeScript(InjectScriptName.SetIsDarkMode, isDarkMode.toString());
    if (defaultFontSize) {
      this.executeScript(
        InjectScriptName.SetFontSize,
        defaultFontSize.toString()
      );
    }
    onEditorReady();
    setTimeout(() => {
      Animated.timing(this.loadingOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 200);
  };

  focus = () => {
    this.doSomethingAfterMounted(`focusAndShowKeyboard`, () => {
      if (Platform.OS === "android") {
        // focus the textinput to wake up the keyborad
        this.textInputRef.current?.focus();
        // android must focus webview first
        this.webViewRef.current?.requestFocus();
      }
      this.executeScript(InjectScriptName.FocusTextEditor);
    });
  };

  blur = () => {
    this.executeScript(InjectScriptName.BlurTextEditor);
  };

  setStyle = (style: FormatType) => {
    this.executeScript(InjectScriptName.Format, style);
  };

  addImage = (src: string) => {
    this.executeScript(InjectScriptName.AddImage, src);
  };

  getEditorState = () => {
    return this.state.editorState;
  };

  shouldForceDarkOn = () => {
    const { isDarkMode } = this.props;
    if (Platform.OS === "android" && Platform.Version >= 29) {
      return false;
    }
    return isDarkMode;
  };

  render() {
    const { style = { flex: 1 }, androidLayerType } = this.props;
    return (
      <>
        <WebView
          ref={this.webViewRef}
          style={style}
          source={{ uri: this.state.webviewUri }}
          allowFileAccess
          allowingReadAccessToURL={"file://"}
          keyboardDisplayRequiresUserAction={false}
          originWhitelist={["*"]}
          onMessage={this.onMessage}
          contentMode={"mobile"}
          onError={this.onError}
          scrollEnabled={false}
          forceDarkOn={this.shouldForceDarkOn()}
          androidLayerType={androidLayerType}
        />
        {Platform.OS === "android" ? (
          <TextInput
            ref={this.textInputRef}
            style={{
              height: 0,
              width: 0,
              position: "absolute",
              left: -1000,
              backgroundColor: "transparent",
            }}
          />
        ) : null}
        <Animated.View
          style={{
            ...style,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 2500,
            alignItems: "center",
            justifyContent: "center",
            opacity: this.loadingOpacity,
          }}
          pointerEvents={"none"}
        ></Animated.View>
      </>
    );
  }
}

export default RNDraftView;
