const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  hookIdMap: {},
  rootApp: null,
  virtualDomTree: null,
  processedRenderTree: null,
  reactRootTreeElement: null,
  rootDOMElement: null
};

export const Fragment = "fragment";

function requestReRender(elementId) {
  const newVirtualDomTree = createElement(ReactInnerContext.rootApp);
  renderVirtualDom(newVirtualDomTree, ReactInnerContext.rootDOMElement, true);
}

function createOrGetMap(map, activeElementId, defaultValue) {
  const resultArray = [];

  if (typeof map[activeElementId] === "undefined") {
    map[activeElementId] = {};
    resultArray.push(false);
  } else {
    resultArray.push(true);
  }

  resultArray.push(map[activeElementId]);

  return resultArray;
}

export function useState(initialState) {
  const activeElementId = ReactInnerContext.activeId;
  const [hookIdMapAlreadyCreated, activeHookIdMap] = createOrGetMap(ReactInnerContext.hookIdMap, activeElementId);
  const [activeStateMapAlreadyCreated, activeStateMap] = createOrGetMap(ReactInnerContext.stateMap, activeElementId);

  if (!hookIdMapAlreadyCreated) {
    activeHookIdMap[activeElementId] = 0;
  }
  const activeHookId = activeHookIdMap[activeElementId]++;

  if (!activeStateMapAlreadyCreated) {
    activeStateMap[activeHookId] = initialState;
  } else {
    if (typeof activeStateMap[activeHookId] === "undefined") {
      activeStateMap[activeHookId] = initialState;
    }
  }

  const stateUpdater = function (newState) {
    activeStateMap[activeHookId] = newState;
    setTimeout(function () {
      requestReRender(activeElementId);
    }, 50);
  };

  return [activeStateMap[activeHookId], stateUpdater];
}

export function createElement(nodeTypeOrFunction, props, ...children) {
  let treeNode = {
    $$id: `element-${ReactInnerContext.elementId++}`,
    type: nodeTypeOrFunction,
    props: props || {},
    children: null,
    $$nativeElement: null // will be filled later
  };

  if (typeof nodeTypeOrFunction === "function") {
    if (ReactInnerContext.rootApp === null) {
      ReactInnerContext.rootApp = nodeTypeOrFunction;
    }
    // thanks to single thread abilitiy of JS we can create
    // id values without a problem
    ReactInnerContext.activeId = treeNode.$$id;
    treeNode.children = nodeTypeOrFunction(props, children);
  } else {
    if (children != null && children.length === 1 && typeof children[0] === "string") {
      treeNode.props.__innerHTML = children[0];
    } else {
      treeNode.children = children;
    }
  }

  return treeNode;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderVirtualDom(virtualDomTree, rootDOMElement, replacePreviousRoot) {
  // internal React variables used for the render phase
  ReactInnerContext.activeId = -1;
  ReactInnerContext.elementId = 0;
  ReactInnerContext.hookIdMap = {};

  const reactRootTreeElement = document.createDocumentFragment();

  renderNode(virtualDomTree, reactRootTreeElement);

  if (replacePreviousRoot) {
    removeAllChildNodes(rootDOMElement);
  }

  rootDOMElement.appendChild(reactRootTreeElement);

  ReactInnerContext.reactRootTreeElement = reactRootTreeElement;
  ReactInnerContext.virtualDomTree = virtualDomTree;
  ReactInnerContext.rootDOMElement = rootDOMElement;
}

export function createRoot(rootDOMElement) {
  return {
    render: function (virtualDomTree, replacePreviousRoot) {
      renderVirtualDom(virtualDomTree, rootDOMElement, replacePreviousRoot);
    }
  };
}

function findAndInvokeEventHandlerOfElement(elementNodeInVirtualDomTree, elementId, eventKey, evt) {
  const elemNode = elementNodeInVirtualDomTree;

  if (elemNode.$$id === elementId) {
    elemNode.props?.events[eventKey]?.(evt);
  } else {
    if (elemNode.children) {
      if (Array.isArray(elemNode.children)) {
        elemNode.children.forEach((singleElement) => {
          findAndInvokeEventHandlerOfElement(singleElement, elementId, eventKey, evt);
        });
      } else {
        findAndInvokeEventHandlerOfElement(elemNode.children, elementId, eventKey, evt);
      }
    }
  }
}

// simple tree traversal
function renderNode(node, parentElement) {
  if (node === null || node === undefined) {
    return;
  }

  if (node.type === Fragment) {
    // we skip Fragment
    renderNode(node.children, parentElement);
  } else if (Array.isArray(node)) {
    node.forEach((singleNode) => {
      if (typeof singleNode.type !== "function") {
        renderSingleNode(singleNode, parentElement);
      } else {
        renderNode(singleNode.children, parentElement);
      }
    });
  } else if (typeof node.type !== "function") {
    renderSingleNode(node, parentElement);
  } else {
    renderNode(node.children, parentElement);
  }
}

function renderSingleNode(node, parentElement) {
  const activeNode = document.createElement(node.type);

  if (node?.props?.className && typeof node?.props?.className !== "undefined") {
    activeNode.className = node?.props?.className;
  }

  if (node.props?.__innerHTML) {
    activeNode.innerHTML = node.props?.__innerHTML;
  }

  node.$$nativeElement = activeNode;

  if (node.props?.events) {
    Object.keys(node.props?.events).forEach((key) => {
      activeNode.addEventListener(key, function (evt) {
        const virtualDomTree = ReactInnerContext.virtualDomTree;
        findAndInvokeEventHandlerOfElement(virtualDomTree, node.$$id, key, evt);
      });
    });
  }

  parentElement.appendChild(activeNode);

  renderNode(node.children, activeNode);
}

console.log("Single file React is initialized");
