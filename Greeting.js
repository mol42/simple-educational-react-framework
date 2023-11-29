import { createElement, useState } from "./react.js";

function Greeting({ name }) {
  const [enabled, setEnabled] = useState(false);
  console.log("enabled", enabled);

  if (enabled) {
    return createElement("div", { className : "padding-20", __innerHTML : "Content removed"});
  }

  return createElement(
    "h1",
    { className: "greeting" },
    createElement(
      "button",
      {
        className: "btn-primary",
        events: {
          click: (evt) => {
            setEnabled(true);
            console.log("onclick");
          }
        }
      },
      createElement("span", { __innerHTML: `Do you want to re-render ${name}?`})
    )
  );
}

export default Greeting;
