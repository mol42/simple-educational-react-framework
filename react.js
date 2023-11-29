const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  renderTreeCreator: null,
  processedRenderTree: null,
  reactRootTreeElement: null,
  targetElement: null
};

function requestStateUpdateFor(elementId) {
  renderRoot(ReactInnerContext.renderTreeCreator, ReactInnerContext.targetElement, true);
}

export function useState(initialState) {
  const activeElementId = ReactInnerContext.activeId;

  if (typeof ReactInnerContext.stateMap[activeElementId] === "undefined") {
    ReactInnerContext.stateMap[activeElementId] = initialState;
  }

  const stateUpdater = function (newState) {
    ReactInnerContext.stateMap[activeElementId] = newState;
    setTimeout(function () {
      requestStateUpdateFor(activeElementId);
    }, 50);
  };

  return [ReactInnerContext.stateMap[activeElementId], stateUpdater];
}

export function createElement(typeOrFunction, props, children) {
  let renderTree = {
    $$id: `element-${ReactInnerContext.elementId++}`,
    type: typeOrFunction,
    props: props,
    children: null,
    $$nativeElement: null // will be filled later
  };

  if (typeof typeOrFunction === "function") {
    ReactInnerContext.activeId = renderTree.$$id;
    renderTree.children = typeOrFunction(props, children);
  } else {
    renderTree.children = children;
  }

  return renderTree;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export function renderRoot(renderTreeCreator, targetElement, replacePreviousRoot) {
  //
  ReactInnerContext.activeId = -1;
  ReactInnerContext.elementId = 0;

  const processedRenderTree = renderTreeCreator();

  const reactRootTreeElement = document.createDocumentFragment();

  renderNode(processedRenderTree, reactRootTreeElement);

  if (replacePreviousRoot) {
    removeAllChildNodes(targetElement);
  }

  targetElement.appendChild(reactRootTreeElement);

  ReactInnerContext.reactRootTreeElement = reactRootTreeElement;
  ReactInnerContext.renderTreeCreator = renderTreeCreator;
  ReactInnerContext.processedRenderTree = processedRenderTree;
  ReactInnerContext.targetElement = targetElement;
}

// simple tree traversal
function renderNode(node, parentElement) {
  if (node === null || node === undefined) {
    return;
  }

  if (typeof node.type !== "function") {
    const activeNode = document.createElement(node.type);
    activeNode.className = node?.props?.className;

    if (node.props?.__innerHTML) {
      activeNode.innerHTML = node.props?.__innerHTML;
    }

    node.$$nativeElement = activeNode;

    if (node.props?.events) {
      Object.keys(node.props?.events).forEach((key) => {
        activeNode.addEventListener(key, function (evt) {
          node.props?.events[key]?.(evt);
        });
      });
    }

    parentElement.appendChild(activeNode);

    renderNode(node.children, activeNode);
  } else {
    renderNode(node.children, parentElement);
  }
}
