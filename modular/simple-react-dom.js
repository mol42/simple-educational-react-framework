import { __registerRootRenderer, __informNativeEvent, Fragment } from "./simple-react.js";

const ReactRenderContext = {
  reactRootTreeElement: null,
  rootDOMElement: null
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function doRenderRoot(virtualDomTree, rootDOMElement, replacePreviousRoot) {
  const reactRootTreeElement = document.createDocumentFragment();

  renderNode(virtualDomTree, reactRootTreeElement);

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
        __informNativeEvent(node.$$id, key, evt);
      });
    });
  }

  parentElement.appendChild(activeNode);

  renderNode(node.children, activeNode);
}

__registerRootRenderer(doRenderRoot);
