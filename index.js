import App from "./App.js";
import { renderRoot } from "./react.js";

const renderTree = App();

console.log(JSON.stringify(renderTree));

// renderRoot(renderTree, document.getElementById("main_container"))