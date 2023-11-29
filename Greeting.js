import { createElement, useState } from "./react.js";

function Greeting({ name }) {
  const [enabled, setEnabled] = useState(false);
  console.log("enabled", enabled);
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
      createElement("span", { __innerHTML: enabled ? `How are you ${name}?` : `Hello ${name}` })
    )
  );
}

export default Greeting;
