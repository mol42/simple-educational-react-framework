const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  hookIdMap: {},
  virtualDomTree: null,
  activeStateContext: null
};

export const Fragment = "fragment";

function resetReactContext() {
  ReactInnerContext.elementId = 0;
  ReactInnerContext.hookIdMap = {};
  ReactInnerContext.activeStateContext = null;
}

function requestReRender(parentId, elementId) {
  resetReactContext();
  const existingDomTree = ReactInnerContext.virtualDomTree;
  // our framework expects function that creates the
  // virtual dom tree
  const newVirtualDomTree = createElement(existingDomTree.type, existingDomTree.props, existingDomTree.children);
  renderVirtualDom(newVirtualDomTree, ReactInnerContext.rootDOMElement, true);
}

function createOrGetMap(map, activeElementId) {
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
    requestReRender($$parentId, $$id);
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
    // id values for the hooks to use by accessing the global
    // ReactInnerContext.activeStateContext in useState or any
    // other built-in hook
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
  ReactInnerContext.virtualDomTree = virtualDomTree;
  ReactInnerContext.rootDOMElement = rootDOMElement;
  ReactInnerContext.rootRenderer(virtualDomTree, rootDOMElement, replacePreviousRoot);
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

  if (elemNode === null) {
    return;
  }

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

/**
 * BELOW 2 METHODS ARE USED FOR COMBINING TWO REALMS
 */

// This method is used by the renderer system to inform React side for an event
export function __informNativeEvent(elementId, eventKey, evt) {
  const { virtualDomTree } = ReactInnerContext;
  findAndInvokeEventHandlerOfElement(virtualDomTree, elementId, eventKey, evt);
}

// This method is used for registering the renderer function
export function __registerRootRenderer(rootRenderer) {
  ReactInnerContext.rootRenderer = rootRenderer;
}

console.log("Modular React is initialized");
