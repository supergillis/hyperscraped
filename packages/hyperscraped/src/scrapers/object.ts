import { Node, Scraper } from '../scraper';

type PropertyScraper<O> = {
  [P in keyof O]: Scraper<O[P]>;
};

type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

type ObjectEntries<T> = ObjectEntry<T>[];

export const object = <O>(propertyTransforms: PropertyScraper<O>) => {
  const entries = Object.entries(propertyTransforms) as ObjectEntries<PropertyScraper<O>>;

  return async function* tag(node: Node): AsyncIterableIterator<Partial<O>> {
    const result: Partial<O> = {};
    for (const [property, scraper] of entries) {
      for await (const value of scraper(node)) {
        if (result[property]) {
          throw new Error(`Cannot set property "${property}" again result. Current value: ${result[property]}`);
        }
        result[property] = value;
      }
    }
    yield result;
  };
};
