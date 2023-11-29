import { createElement, useState } from "./simple-react.js";

function Greeting({ name }) {
  const [enabled, setEnabled] = useState(false);
  const [showDate, setShowDate] = useState(true);

  console.log("enabled", enabled);

  if (enabled) {
    return createElement("div", { className: "padding-20", __innerHTML: "Content removed" });
  }

  let preparedElement = null;
  if (showDate) {
    preparedElement = [
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              // setEnabled(true);
              setShowDate(true);
              console.log("onclick");
            }
          }
        },
        createElement("div", { __innerHTML: `Do you want to toggle ${name}?` })
      ),
      createElement("div", { __innerHTML: `${new Date().getTime()}` })
    ];
  } else {
    preparedElement = createElement("span", { __innerHTML: `Do you want to re-render ${name}?` });
  }

  return createElement("h1", { className: "greeting" }, preparedElement);
}

export default Greeting;
