import * as E from 'fp-ts/Either';
import { compile as cssCompile, selectAll as cssSelectAll, selectOne as cssSelectOne } from 'css-select';
import { Node } from 'domhandler';

export { Element, Node } from 'domhandler';

export type Scraper<A, B> = (input: A) => B;

export type Selector = string | ((node: Node) => boolean);

function compile(selector: Selector): (node: Node) => boolean {
  return typeof selector === 'string' ? cssCompile(selector) : selector;
}

/**
 * Create a scraper that selects and transform the first element matching the given selector.
 */
export const selectOne = (selector: Selector): Scraper<Node, E.Either<string, Node>> => {
  const query = compile(selector);
  const toEither = E.fromNullable(`Cannot find element "${selector}"`);
  return function selectOne(node) {
    return toEither(cssSelectOne(query, node));
  };
};

/**
 * Create a scraper that selects and transforms all elements matching the given selector.
 */
export const selectAll = (selector: Selector): Scraper<Node, Node[]> => {
  const query = compile(selector);
  return function selectAll(node) {
    return cssSelectAll(query, node);
  };
};

export function parentNode(node: Node): E.Either<string, Node> {
  return E.fromNullable('Cannot find parent node')(node.parentNode);
}

export function previousSibling(node: Node): E.Either<string, Node> {
  return E.fromNullable('Cannot find previous sibling')(node.previousSibling);
}

export function nextSibling(node: Node): E.Either<string, Node> {
  return E.fromNullable('Cannot find next sibling')(node.nextSibling);
}

// Aliases
export const all = selectAll;
export const one = selectOne;
export const up = parentNode;
export const prev = previousSibling;
export const next = nextSibling;
