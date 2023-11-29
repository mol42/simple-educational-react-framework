import App from "./App.js";
import { renderRoot } from "./react.js";

renderRoot(() => App(), document.getElementById("main_container"))