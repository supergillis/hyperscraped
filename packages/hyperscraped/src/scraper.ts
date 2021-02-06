import { compile as cssCompile, selectAll as cssSelectAll, selectOne as cssSelectOne } from 'css-select';
import { Node } from 'domhandler';
import { Mapper } from './scrapers/functional';

export { Element, Node } from 'domhandler';

export type Root = Node[];

export type Scraper<A> = (node: Node) => AsyncIterableIterator<A>;

export type Selector = string | ((node: Node) => boolean);

function compile(selector: Selector): (node: Node) => boolean {
  return typeof selector === 'string' ? cssCompile(selector) : selector;
}

/**
 * Create a scraper that yields the node the function was called with.
 */
export const selectSelf: Scraper<Node> = async function* selectSelf(node) {
  yield node;
};

/**
 * Create a scraper that selects and transform the first element matching the given selector.
 */
export const selectOne = (selector: Selector): Scraper<Node> => {
  const query = compile(selector);
  return async function* selectOne(node) {
    const selected = cssSelectOne(query, node);
    if (selected) {
      yield selected;
    }
  };
};

/**
 * Create a scraper that selects and transforms all elements matching the given selector.
 */
export const selectAll = (selector: Selector): Scraper<Node> => {
  const query = compile(selector);
  return async function* selectAll(node) {
    yield* cssSelectAll(query, node);
  };
};

/**
 * Create a scraper that runs the given scraper in the given property of the node.
 *
 * @see parentNode
 * @see previousSibling
 * @see nextSibling
 */
export const runScraperIn = (property: keyof Node): Mapper<Node, Node> => (scraper) => {
  return async function* yieldOnProperty(node) {
    const value = node[property];
    if (value instanceof Node) {
      yield* scraper(value);
    }
  };
};

export const parentNode = runScraperIn('parentNode');
export const previousSibling = runScraperIn('previousSibling');
export const nextSibling = runScraperIn('nextSibling');

// Aliases
export const all = selectAll;
export const one = selectOne;
export const up = parentNode;
export const prev = previousSibling;
export const next = nextSibling;
