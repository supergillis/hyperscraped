import { Node, Scraper } from '../scraper';

export type MapFn<A, B> = (a: A, node?: Node) => B | undefined | Promise<B | undefined>;

export const map = <A, B>(scraper: Scraper<A>, mapper: MapFn<A, B>): Scraper<B> =>
  async function* map(node: Node): AsyncIterableIterator<B> {
    for await (const value of scraper(node)) {
      const mapped = await mapper(value, node);
      if (mapped) {
        yield mapped;
      }
    }
  };
