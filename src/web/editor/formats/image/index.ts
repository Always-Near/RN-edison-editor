import Quill from "quill";
import { EventListener, EventListenerNames } from "../../utils";

const DefaultImage = Quill.import("formats/image");
const ATTRIBUTES = ["id", "class", "height", "width"];

class Image extends DefaultImage {
  static create(value: any) {
    let node = super.create(value);
    node.onload = () => {
      EventListener.emitEvent(EventListenerNames.ImgOnload);
    };

    return node;
  }

  static sanitize(url: string) {
    return url;
  }

  static formats(domNode: Element) {
    const attr: { [key: string]: any } = {};
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, attr);
  }

  format(name: string, value: string | number) {
    if (ATTRIBUTES.includes(name)) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
Image.blotName = "image";
Image.tagName = "IMG";

Quill.register(Image);
