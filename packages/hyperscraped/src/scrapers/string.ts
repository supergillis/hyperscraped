import { Scraper } from '../scraper';
import { map } from './functional';
import { text } from './dom';

export const toNumber = (text: string) => +text;

export const number: Scraper<number> = map(text, toNumber);

export const regex = (pattern: RegExp): Scraper<string> =>
  map(text, (text: string) => {
    const match = text.match(pattern);
    if (!match) {
      return undefined;
    }
    return text;
  });

export function match(pattern: RegExp): Scraper<RegExpMatchArray>;
export function match(pattern: RegExp, key: string | number): Scraper<string>;
export function match(pattern: RegExp, key?: string | number): Scraper<string | RegExpMatchArray> {
  return map(text, (text: string) => {
    const match = text.match(pattern);
    if (!match) {
      return undefined;
    }
    if (typeof key === 'string') {
      return match.groups?.[key];
    } else if (typeof key === 'number') {
      return match?.[key];
    }
    return match;
  });
}
