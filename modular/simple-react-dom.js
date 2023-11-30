import { __registerRootRenderer, __handleEvent } from "./simple-react.js";

const ReactRenderContext = {
  processedRenderTree: null,
  reactRootTreeElement: null,
  rootDOMElement: null
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function doRenderRoot(renderTree, rootDOMElement, replacePreviousRoot) {
  const reactRootTreeElement = document.createDocumentFragment();

  renderNode(renderTree, reactRootTreeElement);

  if (replacePreviousRoot) {
    removeAllChildNodes(rootDOMElement);
  }

  rootDOMElement.appendChild(reactRootTreeElement);

  ReactRenderContext.reactRootTreeElement = reactRootTreeElement;
  ReactRenderContext.rootDOMElement = rootDOMElement;
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
        __handleEvent(node.$$id, key, evt);
      });
    });
  }

  parentElement.appendChild(activeNode);

  renderNode(node.children, activeNode);
}

__registerRootRenderer(doRenderRoot);
