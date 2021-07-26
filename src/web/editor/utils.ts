import Parchment from "parchment";
import { Quill } from "react-quill";
import {
  FormatType,
  BaseInlineStyles,
  SpecialInlineStyles,
  SpecialKeepInlineStyles,
  BlockStyles,
  ClearStyle,
} from "../../constants";

const AllInline: string[] = [
  ...Object.values(BaseInlineStyles),
  ...Object.values(SpecialInlineStyles),
  ...Object.values(SpecialKeepInlineStyles),
];

function clean(quill: Quill) {
  const range = quill.getSelection();
  if (!range) {
    return;
  }
  if (range.length === 0) {
    const formats = quill.getFormat();
    Object.keys(formats).forEach((name) => {
      // Clean functionality in existing apps only clean inline formats
      if (AllInline.includes(name)) {
        quill.format(name, false);
      }
    });
  } else {
    quill.removeFormat(range.index, range.length, "user");
  }
}

function indent(quill: Quill, value: "+1" | "-1") {
  const range = quill.getSelection();
  const formats = quill.getFormat(range || undefined);
  const indent = parseInt(formats.indent || 0, 10);
  let modifier = value === "+1" ? 1 : -1;
  if (formats.direction === "rtl") {
    modifier *= -1;
  }
  quill.format("indent", indent + modifier, "user");
}

function list(quill: Quill, value: "ordered" | "bullet") {
  const range = quill.getSelection();
  const formats = quill.getFormat(range || undefined);
  const oldListType = formats["list"];
  if (oldListType === value) {
    quill.format("list", false, "user");
  } else {
    quill.format("list", value, "user");
  }
}

export function format(quill: Quill, style: FormatType) {
  if (style === ClearStyle) {
    clean(quill);
    return;
  }
  const range = quill.getSelection();
  const nowFormats = quill.getFormat(range || undefined);
  for (const key in BaseInlineStyles) {
    if (key === style) {
      const formatType = BaseInlineStyles[key as keyof typeof BaseInlineStyles];
      const hasStyle = nowFormats[formatType];
      quill.format(formatType, !hasStyle, "user");
      return;
    }
  }

  for (const key in BlockStyles) {
    if (key === style) {
      const format = BlockStyles[key as keyof typeof BlockStyles];
      if (format.type === "list") {
        list(quill, format.value);
      } else {
        indent(quill, format.value);
      }
      return;
    }
  }

  for (const key in SpecialKeepInlineStyles) {
    if (style.startsWith(key)) {
      const formatType =
        SpecialKeepInlineStyles[key as keyof typeof SpecialKeepInlineStyles];
      const formatValue = style.slice(key.length + 1);
      quill.format(formatType, formatValue, "user");
      return;
    }
  }

  for (const key in SpecialInlineStyles) {
    if (style.startsWith(key)) {
      const formatType =
        SpecialInlineStyles[key as keyof typeof SpecialInlineStyles];
      const formatValue = style.slice(key.length + 1);
      const oldType = nowFormats[formatType];
      if (oldType === formatValue) {
        quill.format(formatType, false, "user");
      } else {
        quill.format(formatType, formatValue, "user");
      }
      return;
    }
  }
}

export function getActiveStyles(quill: Quill | null) {
  const activeStyles: FormatType[] = [];
  if (!quill) {
    return activeStyles;
  }
  const range = quill.getSelection();
  if (!range) {
    return activeStyles;
  }
  const formats = quill.getFormat(range);
  Object.keys(formats).forEach((key) => {
    const value = formats[key];
    if (!value) {
      return;
    }
    Object.keys(BaseInlineStyles).forEach((baseKey) => {
      const transformTypeKey = baseKey as keyof typeof BaseInlineStyles;
      if (key === BaseInlineStyles[transformTypeKey]) {
        activeStyles.push(transformTypeKey);
        return;
      }
    });
    Object.keys(SpecialInlineStyles).forEach((baseKey) => {
      const transformTypeKey = baseKey as keyof typeof SpecialInlineStyles;
      if (key === SpecialInlineStyles[transformTypeKey]) {
        activeStyles.push(`${transformTypeKey}-${value}` as const);
        return;
      }
    });
    Object.keys(SpecialKeepInlineStyles).forEach((baseKey) => {
      const transformTypeKey = baseKey as keyof typeof SpecialKeepInlineStyles;
      if (key === SpecialKeepInlineStyles[transformTypeKey]) {
        activeStyles.push(`${transformTypeKey}-${value}` as const);
        return;
      }
    });
  });
  return activeStyles;
}

export function addImage(quill: Quill, path: string) {
  const range = quill.getSelection();
  if (!range) {
    return;
  }
  const { index, length } = range;
  if (length != 0) {
    quill.deleteText(index, length, "user");
  }
  quill.insertEmbed(index, "image", path);
}

export const EventListenerNames = {
  ImgOnload: "ImgOnload",
} as const;

type Event = typeof EventListenerNames[keyof typeof EventListenerNames];
type Listener = () => void;

class EdisonEventListener {
  listeners: Map<Event, Listener[]>;
  constructor() {
    this.listeners = new Map();
  }

  addEventListener = (event: Event, listener: Listener) => {
    const oldList = this.listeners.get(event) || [];
    const newList = [...oldList, listener];
    this.listeners.set(event, newList);
  };

  emitEvent = (event: Event) => {
    const listenerList = this.listeners.get(event) || [];
    listenerList.forEach((cb) => {
      cb();
    });
  };
}

export const EventListener = new EdisonEventListener();
