import { createElement } from './react.js';

function Greeting({ name }) {
  return createElement(
    'h1',
    { className: 'greeting' },
    createElement('span', { __innerHTML: `Hello ${name}`})
  );
}

export default Greeting;