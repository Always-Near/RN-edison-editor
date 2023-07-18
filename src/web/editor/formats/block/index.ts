import Quill from "quill";

const Default = Quill.import("blots/block");

class Block extends Default {}
Block.blotName = "block";
Block.tagName = "div";

Quill.register(Block);
