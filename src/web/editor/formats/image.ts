import { Quill } from "react-quill";

const DefaultImage = Quill.import("formats/image");

class Image extends DefaultImage {
  static sanitize(url: string) {
    return url;
  }
}
Image.blotName = "image";
Image.tagName = "IMG";

Quill.register("formats/image", Image);
