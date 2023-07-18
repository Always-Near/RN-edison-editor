import Quill from "quill";

const Parchment = Quill.import("parchment");

class Table extends Parchment.Embed {
  static create(value: any) {
    let node = super.create(value);
    node.setAttribute("contenteditable", false);
    node.innerHTML = value;
    return node;
  }
}

Table.blotName = "table";
Table.tagName = "TABLE";
Table.allowedChildren = [];

Quill.register(Table);
