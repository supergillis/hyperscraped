import { Node } from '../scraper';
import { Mapper, map } from './functional';
import { getText } from './dom';

export const number: Mapper<string | Node, number> = map(function number(value) {
  try {
    return parseInt(getText(value));
  } catch {
    return undefined;
  }
});

export const regex = (pattern: RegExp): Mapper<string, string> =>
  map(function regex(text) {
    const match = text.match(pattern);
    if (match) {
      return undefined;
    }
    return text;
  });

export function match(pattern: RegExp): Mapper<string | Node, RegExpMatchArray>;
export function match(pattern: RegExp, key: string | number): Mapper<string | Node, string>;
export function match(pattern: RegExp, key?: string | number): Mapper<string | Node, string | RegExpMatchArray> {
  return map(function match(value) {
    const text = getText(value);
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
