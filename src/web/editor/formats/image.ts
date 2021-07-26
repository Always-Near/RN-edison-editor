import { Quill } from "react-quill";
import { EventListener, EventListenerNames } from "../utils";

const DefaultImage = Quill.import("formats/image");

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
}
Image.blotName = "image";
Image.tagName = "IMG";

Quill.register("formats/image", Image);
