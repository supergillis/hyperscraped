import fetch, { RequestInit } from 'node-fetch';
import type { Document } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import { Node, Mapper, Scraper } from 'hyperscraped';

export const createRequester = (init: RequestInit = { timeout: 10000 }) => async (
  url: string,
): Promise<Document | undefined> => {
  try {
    const response = await fetch(url, init);
    const body = await response.text();
    return parseDocument(body);
  } catch (e) {
    console.warn(`Ingoring error`);
    console.warn(e);
  }
  return undefined;
};

export function follow(): Mapper<string, Document>;
export function follow<T = Document>(scraper: Scraper<T>): Mapper<string, T>;
export function follow<T = Document>(scraper?: Scraper<T>) {
  const requester = createRequester();
  if (scraper) {
    return (hrefs: Scraper<string>): Scraper<Document | T> => {
      return async function* follow(node) {
        for await (const href of hrefs(node)) {
          const document = await requester(href);
          if (document) {
            yield* scraper(document);
          }
        }
      };
    };
  } else {
    return (hrefs: Scraper<string>): Scraper<Document | T> => {
      return async function* follow(node) {
        for await (const href of hrefs(node)) {
          const document = await requester(href);
          if (document) {
            yield document;
          }
        }
      };
    };
  }
}
