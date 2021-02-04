import { compile, selectAll as cssSelectAll, selectOne as cssSelectOne } from 'css-select';
import { Node } from 'domhandler';
export { Element, Node } from 'domhandler';

export type Root = Node[];

export type Scraper<T> = (node: Node) => AsyncIterableIterator<T>;

/**
 * Create a scraper that selects and transform the first element matching the given selector.
 */
export const selectOne = (selector: string) => <T>(transform: Scraper<T>): Scraper<T> => {
  const query = compile(selector);
  return async function* select(node: Node) {
    const selected = cssSelectOne(query, node);
    if (selected) {
      yield* transform(selected);
    }
  };
};

/**
 * Create a scraper that selects and transforms all elements matching the given selector.
 */
export const selectAll = (selector: string) => <T>(transform: Scraper<T>): Scraper<T> => {
  const query = compile(selector);
  return async function* select(node: Node) {
    for (const selected of cssSelectAll(query, node)) {
      yield* transform(selected);
    }
  };
};

/**
 * Create a scraper that yields one of the properties of the node.
 *
 * @see parentNode
 * @see previousSibling
 * @see nextSibling
 */
export const yieldOnProperty = (property: keyof Node) => <T>(transform: Scraper<T>): Scraper<T> => {
  return async function* yieldOnProperty(node: Node) {
    const value = node[property];
    if (value instanceof Node) {
      yield* transform(value);
    }
  };
};

export const parentNode = yieldOnProperty('parentNode');
export const previousSibling = yieldOnProperty('previousSibling');
export const nextSibling = yieldOnProperty('nextSibling');

// Aliases
export const s = selectAll;
export const all = selectAll;
export const one = selectOne;
export const up = parentNode;
export const prev = previousSibling;
export const next = nextSibling;
