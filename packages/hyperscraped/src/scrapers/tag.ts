import { Node, Scraper } from '../scraper';

export interface Tag<N extends string, V = string> {
  _tag: 'tag';
  name: N;
  value: V;
}

export const tag = <F extends string, V = string>(name: F, scraper: Scraper<V>): Scraper<Tag<F, V>> =>
  async function* tag(node: Node): AsyncIterableIterator<Tag<F, V>> {
    for await (const value of scraper(node)) {
      yield { _tag: 'tag', name, value };
    }
  };
