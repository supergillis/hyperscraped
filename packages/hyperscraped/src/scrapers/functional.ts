import merge from 'fast-merge-async-iterators';
import { Node, Scraper } from '../scraper';

export type Mapper<A, B> = (scraper: Scraper<A>) => Scraper<B>;

export type MapFn<A, B> = (a: A, node?: Node) => B | undefined | Promise<B | undefined>;

export interface MapOptions {
  parallel?: boolean;
}

/**
 * Map a scraper from type A to type B using the given map function.
 *
 * @template {A} The type to map from.
 * @template {B} The type to map to.
 */
export const map = <A, B>(mapFn: MapFn<A, B>, { parallel = true }: MapOptions = {}): Mapper<A, B> => (scraper) =>
  async function* map(node): AsyncIterableIterator<B> {
    const generators = [];
    for await (const value of scraper(node)) {
      const gen = async function* gen(value: A): AsyncIterableIterator<B> {
        const mapped = await mapFn(value, node);
        if (mapped) {
          yield mapped;
        }
      };
      if (parallel) {
        generators.push(gen(value));
      } else {
        yield* gen(value);
      }
    }
    if (parallel) {
      yield* merge(...generators);
    }
  };

/**
 * Map a scraper from type A to type B using the given map function.
 *
 * @template {A} The type to map from.
 * @template {B} The type to map to.
 */
export const flatMap = <A, B>(
  mapFn: MapFn<A, AsyncIterable<B> | Iterable<B>>,
  { parallel = true }: MapOptions = {},
): Mapper<A, B> => (scraper) =>
  async function* map(node) {
    const generators = [];
    for await (const value of scraper(node)) {
      const gen = async function* gen(value: A): AsyncIterableIterator<B> {
        const mapped = await mapFn(value, node);
        if (mapped) {
          yield* mapped;
        }
      };
      if (parallel) {
        generators.push(gen(value));
      } else {
        yield* gen(value);
      }
    }
    if (parallel) {
      yield* merge(...generators);
    }
  };
