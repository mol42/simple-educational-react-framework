import { createElement, useState } from "./simple-react.js";

function Greeting({ name }) {
  const [enabled, setEnabled] = useState(false);
  const [showDate, setShowDate] = useState(true);

  console.log("enabled", enabled);
  console.log("showDate", showDate);

  if (enabled) {
    return [
      createElement("div", { className: "padding-20", __innerHTML: "Page 3" }),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              setEnabled(false);
              console.log("onclick");
            }
          }
        },
        createElement("div", { __innerHTML: `Go to page 1 ?` })
      ),
    ];
  }

  let preparedElement = null;
  if (showDate) {
    preparedElement = [
      createElement("div", { __innerHTML: `Page 1` }),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              setShowDate(false);
              console.log("onclick");
            }
          }
        },
        createElement("div", { __innerHTML: `Go to page 2 ${name}?` })
      ),
      createElement("div", { __innerHTML: `${new Date().getTime()}` })
    ];
  } else {
    preparedElement = [
      createElement("div", { className: "", __innerHTML: "Page 2" }),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              setShowDate(true);
              console.log("onclick");
            }
          }
        },
        createElement("div", { __innerHTML: `Revert back` })
      ),
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
        createElement("div", { __innerHTML: `Go to page 3` })
      ),
    ];
  }

  return createElement("h1", { className: "padding-20" }, preparedElement);
}

export default Greeting;
