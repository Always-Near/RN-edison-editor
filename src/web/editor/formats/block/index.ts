import { Quill } from "react-quill";

const Default = Quill.import("blots/block");

class Block extends Default {}
Block.blotName = "block";
Block.tagName = "div";

Quill.register(Block);
