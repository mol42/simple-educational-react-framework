import { createElement } from './react.js';
import Greeting from './Greeting.js';

export default function App() {
    return createElement('div', { className: "padding-20" }, createElement(Greeting, { name: 'Taylor' }));
}