const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  stateMap: {},
  hookIdMap: {},
  virtualDomTree: null,
  reactRootTreeElement: null,
  rootDOMElement: null
};

export const Fragment = "fragment";

function requestReRender(elementId) {
  const existingDomTree = ReactInnerContext.virtualDomTree;
  // our framework expects function that creates the
  // virtual dom tree
  const newVirtualDomTree = createElement(existingDomTree.type);
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
    // thanks to single thread abilitiy of JS we can create
    // id values for the hooks to use
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

export function renderVirtualDom(virtualDomTree, rootDOMElement, replacePreviousRoot) {
  ReactInnerContext.activeId = -1;
  ReactInnerContext.elementId = 0;
  ReactInnerContext.hookIdMap = {};

  ReactInnerContext.virtualDomTree = virtualDomTree;
  ReactInnerContext.rootDOMElement = rootDOMElement;
  ReactInnerContext.rootRenderer(virtualDomTree, rootDOMElement, replacePreviousRoot);
}

export function createRoot(rootDOMElement) {
  return {
    render: function (virtualDomTree) {
      console.log("virtualDomTree", virtualDomTree);
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

/**
 * BELOW 2 METHODS ARE USED FOR GLOBAL PURPOSES
 */

export function __informNativeEvent(elementId, eventKey, evt) {
  const { virtualDomTree } = ReactInnerContext;
  findAndInvokeEventHandlerOfElement(virtualDomTree, elementId, eventKey, evt);
}

export function __registerRootRenderer(rootRenderer) {
  ReactInnerContext.rootRenderer = rootRenderer;
}

console.log("Modular React is initialized");