const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  hookIdMap: {},
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
  // if a second cook is used we need to be able to separate them
  if (!ReactInnerContext.hookIdMap[activeElementId]) {
    ReactInnerContext.hookIdMap[activeElementId] = 0;
  }
  const activeHookId = ReactInnerContext.hookIdMap[activeElementId]++;

  if (typeof ReactInnerContext.stateMap[activeElementId] === "undefined") {
    ReactInnerContext.stateMap[activeElementId] = {};
    ReactInnerContext.stateMap[activeElementId][activeHookId] = initialState;
  } else {
    if (typeof ReactInnerContext.stateMap[activeElementId][activeHookId] === "undefined") {
      ReactInnerContext.stateMap[activeElementId][activeHookId] = initialState;
    }
  }

  const stateUpdater = function (newState) {
    ReactInnerContext.stateMap[activeElementId][activeHookId] = newState;
    setTimeout(function () {
      requestStateUpdateFor(activeElementId);
    }, 50);
  };

  return [ReactInnerContext.stateMap[activeElementId][activeHookId], stateUpdater];
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
  ReactInnerContext.hookIdMap = {};

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

function findAndInvokeEventListener(elementId, eventKey, evt) {
  const renderTree = ReactInnerContext.processedRenderTree;

  traverseAndFindElementByInnerId(renderTree, elementId, eventKey, evt);
}

function traverseAndFindElementByInnerId(elementNode, elementId, eventKey, evt) {
  if (elementNode.$$id === elementId) {
    elementNode.props?.events[eventKey]?.(evt);
  } else {
    if (elementNode.children) {
      if (Array.isArray(elementNode.children)) {
        elementNode.children.forEach(singleElement => {
          traverseAndFindElementByInnerId(singleElement, elementId, eventKey, evt);
        })
      } else {
        traverseAndFindElementByInnerId(elementNode.children, elementId, eventKey, evt);
      }
    }
  }
}

// simple tree traversal
function renderNode(node, parentElement) {
  if (node === null || node === undefined) {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((singleNode) => {
      renderSingleNode(singleNode, parentElement);
    });
  } else if (typeof node.type !== "function") {
    renderSingleNode(node, parentElement);
  } else {
    renderNode(node.children, parentElement);
  }
}

function renderSingleNode(node, parentElement) {
  const activeNode = document.createElement(node.type);
  activeNode.className = node?.props?.className;

  if (node.props?.__innerHTML) {
    activeNode.innerHTML = node.props?.__innerHTML;
  }

  node.$$nativeElement = activeNode;

  if (node.props?.events) {
    Object.keys(node.props?.events).forEach((key) => {
      activeNode.addEventListener(key, function (evt) {
        findAndInvokeEventListener(node.$$id, key, evt);
      });
    });
  }

  parentElement.appendChild(activeNode);

  renderNode(node.children, activeNode);
}
