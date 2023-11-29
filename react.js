export function createElement(typeOrFunction, props, children) {
  let renderTree = {
    type: typeOrFunction,
    props: props,
    children: null
  };

  if (typeof typeOrFunction === "function") {
    renderTree.children = typeOrFunction(props, children);
  } else {
    renderTree.children = children;
  }

  return renderTree;
}

export function renderRoot(renderTree, targetElement) {
  const rootElement = document.createDocumentFragment();

  renderNode(renderTree, rootElement);

  targetElement.appendChild(rootElement);
}

// simple tree traversal
function renderNode(node, parentElement) {
  if (node === null || node === undefined) {
    return;
  }

  if (typeof node.type !== "function") {
    const activeNode = document.createElement(node.type);
    activeNode.className = node?.props?.className;
  
    if (node.props?.__innerHTML) {
      activeNode.innerHTML = node.props?.__innerHTML;
    }
  
    parentElement.appendChild(activeNode);
  
    renderNode(node.children, activeNode);
  } else {
    renderNode(node.children, parentElement);
  }
}