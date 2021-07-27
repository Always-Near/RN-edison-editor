import { Quill } from "react-quill";

const Inline = Quill.import("blots/inline");

class Title extends Inline {
  static create(value: any) {
    let node = super.create(value);
    return node;
  }
}
Title.blotName = "title";
Title.tagName = "TITLE";

Quill.register("formats/disable-title", Title);
