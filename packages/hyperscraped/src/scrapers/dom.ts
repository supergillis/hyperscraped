import { getAttributeValue, innerText } from 'domutils';
import { Element, Node, Scraper } from '../scraper';
import * as E from 'fp-ts/Either';

/**
 * Scraper that extracts text from the node.
 */
export const text: Scraper<string | Node, string> = (value: string | Node): string => {
  if (typeof value === 'string') {
    return value;
  }
  return innerText(value);
};

export const getNodeAttribute =
  (name: string): Scraper<Node, E.Either<string, string>> =>
  (node: Node): E.Either<string, string> => {
    if (node instanceof Element) {
      return E.fromNullable(`Cannot find attribute ${name}`)(getAttributeValue(node, name));
    }
    return E.left('Cannot get attribute from a node that is not an element');
  };

/**
 * Scraper that extracts an attribute from the node.
 */
export const attr = (name: string) => getNodeAttribute(name);
