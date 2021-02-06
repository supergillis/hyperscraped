import { Node, Scraper } from '../scraper';
import { Mapper, map, MapOptions } from './functional';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type PropertyScraper<O> = {
  [P in keyof O]: Scraper<O[P]>;
};

export type PartialPropertyScraper<O> = PropertyScraper<RecursivePartial<O>>;

type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

type ObjectEntries<T> = ObjectEntry<T>[];

export const object = <O>(
  propertyTransforms: PartialPropertyScraper<O>,
  options: MapOptions = {},
): Mapper<Node, RecursivePartial<O>> => {
  const entries = Object.entries(propertyTransforms) as ObjectEntries<PartialPropertyScraper<O>>;
  return map(async (node) => {
    const result: RecursivePartial<O> = {};
    for (const [property, scraper] of entries) {
      for await (const value of scraper(node)) {
        if (result[property]) {
          throw new Error(`Property "${property}" is already set to "${result[property]}"`);
        }
        result[property] = value;
      }
    }
    return result;
  }, options);
};
