import { getAttributeValue, getText as getNodeText } from 'domutils';
import { Element, Node } from '../scraper';
import { map } from './functional';

export const getText = (value: string | Node): string => {
  if (typeof value === 'string') {
    return value;
  }
  return getNodeText(value);
};

export const getNodeAttribute = (name: string) => (node: Node) => {
  if (node instanceof Element) {
    return getAttributeValue(node, name);
  }
  return undefined;
};

/**
 * Scraper that extracts text from the node.
 */
export const text = map(getText);

/**
 * Scraper that extracts an attribute from the node.
 */
export const attr = (name: string) => map(getNodeAttribute(name));
