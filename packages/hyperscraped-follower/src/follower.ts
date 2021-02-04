import fetch, { RequestInit } from 'node-fetch';
import type { Document } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import { Scraper, map } from 'hyperscraped';

export const toFollower = (init: RequestInit = { timeout: 10000 }) => async (
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

/**
 * Scraper that follows anchors.
 */
export const follow = (scraper: Scraper<string>): Scraper<Document> => map(scraper, toFollower());
