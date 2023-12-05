const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  hookIdMap: {},
  activeStateContext: null,
  virtualDomTree: null,
  reactRootTreeElement: null,
  rootDOMElement: null
};

function resetReactContext() {
  ReactInnerContext.elementId = 0;
  ReactInnerContext.hookIdMap = {};
  ReactInnerContext.activeStateContext = null;
}

export const Fragment = "fragment";

function requestReRender(elementId) {
  resetReactContext();
  const existingDomTree = ReactInnerContext.virtualDomTree;
  // our framework expects function that creates the
  // virtual dom tree
  const newVirtualDomTree = createElement(existingDomTree.type);
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

// simple useState hook
// NOTE: Not the real implementation, educational implementation
export function useState(initialState) {
  // Since JS is single thread we have the ability to reach a global object
  // safely while createElement is executing a React component function.
  // useState and other hooks are only meant to be used inside the
  // component functions so accessing the ReactInnerContext.activeStateContext
  // enables us to create id values for each hook function and help on
  // their data management
  const { $$id, $$parentId } = ReactInnerContext.activeStateContext;
  const { hookIdMap, stateMap } = ReactInnerContext;
  const activeStateId = $$parentId || "NULL";
  const [hookIdMapAlreadyCreated, activeHookIdMap] = createOrGetMap(hookIdMap, activeStateId);
  const [activeStateMapAlreadyCreated, activeStateMap] = createOrGetMap(stateMap, activeStateId);

  if (!hookIdMapAlreadyCreated) {
    activeHookIdMap["id"] = 0;
  }

  const activeHookId = activeHookIdMap["id"]++;

  if (!activeStateMapAlreadyCreated && !hookIdMapAlreadyCreated) {
    activeStateMap[activeHookId] = initialState;
  } else {
    if (typeof activeStateMap[activeHookId] === "undefined") {
      activeStateMap[activeHookId] = initialState;
    }
  }

  const stateUpdater = function (newState) {
    activeStateMap[activeHookId] = newState;
    requestReRender(activeStateId);
    setTimeout(function () {
      requestReRender($$parentId, $$id);
    }, 20);
  };

  return [activeStateMap[activeHookId], stateUpdater];
}

export function createElement(nodeTypeOrFunction, props, ...children) {
  let treeNode = {
    $$id: `element-${ReactInnerContext.elementId++}`,
    $$parentId: null,
    type: nodeTypeOrFunction,
    props: props || {},
    children: null,
    $$nativeElement: null // will be filled later
  };

  if (typeof nodeTypeOrFunction === "function") {
    // thanks to single thread abilitiy of JS we can create
    // id values for the hooks to use
    ReactInnerContext.activeStateContext = treeNode;
    treeNode.children = [nodeTypeOrFunction(props, children)];
    applyParentToChildren(treeNode.children, treeNode.$$id);
  } else {
    if (children != null && children.length === 1 && typeof children[0] === "string") {
      treeNode.props.__innerHTML = children[0];
    } else {
      if (children != null && children.length > 0) {
        treeNode.children = children;
        applyParentToChildren(treeNode.children, treeNode.$$id);
      }
    }
  }

  return treeNode;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function applyParentToChildren(children, parentId) {
  if (children != null && children.length > 0) {
    children.forEach((child) => {
      if (child != null) {
        child.$$parentId = parentId;
      }
    });
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
    render: function (virtualDomTree) {
      resetReactContext();
      renderVirtualDom(virtualDomTree, rootDOMElement);
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
