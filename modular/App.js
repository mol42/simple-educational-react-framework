import { createElement } from "./simple-react.js";
import SimplePagedView from "./SimplePagedView.js";

export default function App({name}) {
  return createElement(
    "div",
    { className: "padding-20" },
    createElement("div", { className : "padding-20", __innerHTML: `${name}` }),
    createElement(SimplePagedView, { name: "Tayfun" })
  );
}