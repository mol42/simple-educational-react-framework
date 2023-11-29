import { createElement } from "./simple-react.js";
import Greeting from "./Greeting.js";

export default function App() {
  return createElement("div", { className: "padding-20", __innerHTML: "Root div" }, createElement(Greeting, { name: "Tayfun" }));
}
