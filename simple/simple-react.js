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
  
  function requestReRender(elementId) {
    renderRoot(ReactInnerContext.renderTreeCreator, ReactInnerContext.targetElement, true);
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

  console.log("Single file React is initialized");