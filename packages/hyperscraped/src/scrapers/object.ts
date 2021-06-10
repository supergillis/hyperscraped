import { Node, Scraper } from '../scraper';
import { flow, pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';

export type PropertyScraper<O> = {
  [P in keyof O]: Scraper<Node, TE.TaskEither<any, O[P]>>;
};

type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

type ObjectEntries<T> = ObjectEntry<T>[];

export const object = <O>(propertyTasks: PropertyScraper<O>): Scraper<Node, TE.TaskEither<any, O>> => {
  const entries = Object.entries(propertyTasks) as ObjectEntries<PropertyScraper<O>>;

  // List of scrapers that result in TaskEither<any, { property, value }>
  const scrapers = pipe(
    entries,
    A.map(([property, scraper]) =>
      flow(
        scraper,
        TE.map((value) => ({ property, value })),
      ),
    ),
  );
  return flow(
    // Run scrapers
    (node) => scrapers.map((scraper) => scraper(node)),
    // Combine in single TaskEither of array
    TE.sequenceArray,
    // Reduce into a single object
    TE.map(
      A.reduce({}, (result, { property, value }) => ({
        ...result,
        [property]: value,
      })),
    ),
  ) as Scraper<Node, TE.TaskEither<any, O>>;
};
