import Quill from "quill";

const Parchment = Quill.import("parchment");
const StyleAttributor = Parchment.Attributor.Style;

const Strike = new StyleAttributor("strike", "text-decoration", {
  scope: Parchment.Scope.INLINE_ATTRIBUTE,
  whitelist: ["line-through"],
});

Quill.register(Strike);
