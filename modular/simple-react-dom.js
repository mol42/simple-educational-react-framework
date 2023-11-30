import { __registerReRenderer, __registerRootRenderer, __findTargetAndInvokeEventListener } from "./simple-react.js";

const ReactRenderContext = {
  renderTreeCreator: null,
  processedRenderTree: null,
  reactRootTreeElement: null,
  targetElement: null
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function doRenderRoot(renderTreeCreator, targetElement, replacePreviousRoot) {
  const processedRenderTree = renderTreeCreator();
  const reactRootTreeElement = document.createDocumentFragment();

  renderNode(processedRenderTree, reactRootTreeElement);

  if (replacePreviousRoot) {
    removeAllChildNodes(targetElement);
  }

  targetElement.appendChild(reactRootTreeElement);

  ReactRenderContext.reactRootTreeElement = reactRootTreeElement;
  ReactRenderContext.renderTreeCreator = renderTreeCreator;
  ReactRenderContext.processedRenderTree = processedRenderTree;
  ReactRenderContext.targetElement = targetElement;
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
        __findTargetAndInvokeEventListener(node.$$id, key, evt);
      });
    });
  }

  parentElement.appendChild(activeNode);

  renderNode(node.children, activeNode);
}

function doReRender(elementId) {
  const { renderTreeCreator, targetElement } = ReactRenderContext;
  doRenderRoot(renderTreeCreator, targetElement, true);
}

__registerRootRenderer(doRenderRoot);
__registerReRenderer(doReRender);
