import Quill from "quill";

const Parchment = Quill.import("parchment");

class BlockQuote extends Parchment.Embed {
  static create(value: any) {
    let node = super.create(value);
    node.setAttribute("contenteditable", false);
    node.innerHTML = value;
    return node;
  }
}

BlockQuote.blotName = "blockquote";
BlockQuote.tagName = "BLOCKQUOTE";
BlockQuote.allowedChildren = [];

Quill.register(BlockQuote);
