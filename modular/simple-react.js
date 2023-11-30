const ReactInnerContext = {
  elementId: 0,
  activeId: null,
  requestReRender: null,
  stateMap: {},
  hookIdMap: {}
};

function requestReRender(elementId) {
  ReactInnerContext.requestReRender(elementId);
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

export function renderRoot(renderTreeCreator, targetElement, replacePreviousRoot) {
  ReactInnerContext.activeId = -1;
  ReactInnerContext.elementId = 0;
  ReactInnerContext.hookIdMap = {};

  ReactInnerContext.rootRenderer(renderTreeCreator, targetElement, replacePreviousRoot);
}

function traverseAndFindElementByInnerId(elementNode, elementId, eventKey, evt) {
  if (elementNode.$$id === elementId) {
    elementNode.props?.events[eventKey]?.(evt);
  } else {
    if (elementNode.children) {
      if (Array.isArray(elementNode.children)) {
        elementNode.children.forEach((singleElement) => {
          traverseAndFindElementByInnerId(singleElement, elementId, eventKey, evt);
        });
      } else {
        traverseAndFindElementByInnerId(elementNode.children, elementId, eventKey, evt);
      }
    }
  }
}

export function __findTargetAndInvokeEventListener(elementId, eventKey, evt) {
  const renderTree = ReactInnerContext.processedRenderTree;

  traverseAndFindElementByInnerId(renderTree, elementId, eventKey, evt);
}

export function __registerReRenderer(requestReRender) {
  ReactInnerContext.requestReRender = requestReRender;
}

export function __registerRootRenderer(rootRenderer) {
  ReactInnerContext.rootRenderer = rootRenderer;
}

console.log("Modular React is initialized");