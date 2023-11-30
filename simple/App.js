import { createElement } from "./simple-react.js";
import SimplePagedView from "./SimplePagedView.js";

export default function App() {
  return createElement(
    "div",
    { className: "padding-20" },
    createElement(SimplePagedView, { name: "Tayfun" })
  );
}