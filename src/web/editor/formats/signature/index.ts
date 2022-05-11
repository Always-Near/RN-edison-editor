import { Quill } from "react-quill";

const Default = Quill.import("blots/block");
const ATTRIBUTES = ["id", "class"];
export const SignatureClassName = "webmail_signature";

class Signature extends Default {
  static create(value: any) {
    let node = super.create(value);
    if (value) {
      ATTRIBUTES.forEach((attr) => {
        if (value[attr]) {
          node.setAttribute(attr, value[attr]);
        }
      });
    }
    return node;
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
Signature.blotName = "signature";
Signature.tagName = "div";
Signature.className = SignatureClassName;

Quill.register(Signature);
