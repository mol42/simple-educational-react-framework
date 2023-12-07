import { createElement } from "./simple-react.js";
import SimplePagedView from "./SimplePagedView.js";

export default function App() {
  return createElement(
    "div",
    { className: "padding-20" },
    createElement("div", { className : "padding-20", __innerHTML: "Modular React" }),
    createElement(SimplePagedView, { name: "Tayfun" })
  );
}