import { createElement, useState, Fragment } from "./simple-react.js";

function SimplePagedView({ name }) {
  // 
  const [activePage, setActivePage] = useState(0);
  const [showDate, setShowDate] = useState(false);

  if (activePage === 2) {
    return createElement(
      Fragment, // Fragment node
      null,
      createElement("h1", {}, "Page 2"),
      createElement(
        "div",
        { className: "padding-20" },
        showDate ? `Hello ${name}, time is: ${new Date().getTime()}` : `Hello Tayfun`
      ),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              setActivePage(3);
            }
          }
        },
        createElement("span", {}, `Go to page 3`)
      ),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              if (showDate) {
                setShowDate(false);
              } else {
                setShowDate(true);
              }
            }
          }
        },
        createElement("span", {}, showDate ? "Hide date" : "Show date")
      )
    );
  }

  if (activePage === 3) {
    return createElement(
      Fragment, // Fragment node
      null,
      createElement("h1", { className: "" }, "Page 3"),
      createElement("div", { className: "info-container" }, "This is informational content"),
      createElement(
        "button",
        {
          className: "btn-primary",
          events: {
            click: (evt) => {
              setActivePage(1);
            }
          }
        },
        createElement("span", {}, `Go to page 1`)
      )
    );
  }

  /* JSX of the below code section
      <>
        <h1>Page 1</h1>
        <button className="btn-primary" onClick={() => { setActivePage(2) }}>
          <span>Go to page 2</span>
        </button>
      </>
  */
  return createElement(
    Fragment, // Fragment node
    null,
    createElement("h1", { className: "" }, "Page 1"),
    createElement(
      "button",
      {
        className: "btn-primary",
        events: {
          click: (evt) => {
            setActivePage(2);
          }
        }
      },
      createElement("span", {}, `Go to page 2`)
    )
  );
}

export default SimplePagedView;
