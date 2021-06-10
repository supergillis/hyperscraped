import { Node, Scraper } from '../scraper';
import { text } from './dom';
import * as E from 'fp-ts/Either';

export const number: Scraper<string | Node, E.Either<string, number>> = function number(value) {
  try {
    const stringValue = typeof value === 'string' ? value : text(value);
    return E.right(parseInt(stringValue));
  } catch {
    return E.left(`Cannot parse number ${value}`);
  }
};

export const regex = (pattern: RegExp): Scraper<string, E.Either<string, string>> =>
  function regex(text) {
    const match = text.match(pattern);
    if (!match) {
      return E.left(`Could not match regex "${pattern}" against "${text}"`);
    }
    return E.right(text);
  };

export function match(pattern: RegExp): Scraper<string | Node, E.Either<string, RegExpMatchArray>>;
export function match(pattern: RegExp, key: string | number): Scraper<string | Node, E.Either<string, string>>;
export function match(pattern: RegExp, key?: string | number) {
  return function match(value: string | Node): E.Either<string, string | RegExpMatchArray> {
    const stringValue = typeof value === 'string' ? value : text(value);
    const match = stringValue.match(pattern);
    if (!match) {
      return E.left(`Could not match regex "${pattern}" against "${stringValue}"`);
    }
    if (typeof key === 'string') {
      return E.fromNullable(`Could not find key "${key}" in match groups`)(match.groups?.[key]);
    } else if (typeof key === 'number') {
      return E.fromNullable(`Could not find key "${key}" in match`)(match?.[key]);
    }
    return E.of(match);
  };
}
