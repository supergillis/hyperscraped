import { getAttributeValue, getText } from 'domutils';
import { Element, Node, Scraper } from '../scraper';

/**
 * Scraper that extracts the text from the node.
 */
export const text: Scraper<string> = async function* text(node: Node): AsyncGenerator<string> {
  yield getText(node);
};

/**
 * Scraper that extracts an attribute from the node.
 */
export const attr = (name: string): Scraper<string> =>
  async function* attr(node: Node): AsyncGenerator<string> {
    if (node instanceof Element) {
      const value = getAttributeValue(node, name);
      if (value) {
        yield value;
      }
    }
  };
