import { NodeWithChildren } from 'domhandler';
import { getAttributeValue, innerText } from 'domutils';
import { Element, Node, Scraper } from '../scraper';
import * as E from 'fp-ts/Either';

/**
 * Scraper that extracts text from the node.
 */
export const text: Scraper<Node, string> = (value) => innerText(value);

/**
 * Scraper that extracts an attribute from the node.
 */
export const attr = (name: string): Scraper<Node, E.Either<string, string>> => {
  const toEither = E.fromNullable(`Cannot find attribute ${name}`);
  return (node) => {
    if (node instanceof Element) {
      return toEither(getAttributeValue(node, name));
    }
    return E.left('Cannot get attribute from a node that is not an element');
  };
};

/**
 * Scraper that extracts an attribute from the node.
 */
export const children: Scraper<Node, E.Either<string, Node[]>> = (node) => {
  if (node instanceof NodeWithChildren) {
    return E.right(node.childNodes);
  }
  return E.left('Cannot get attribute from a node that is not an element');
};
