import App from "./App.js";
import { renderRoot } from "./simple-react.js";

renderRoot(() => App(), document.getElementById("main_container"))