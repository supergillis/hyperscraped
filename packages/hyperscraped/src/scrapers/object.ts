import { Node, Scraper } from '../scraper';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type PropertyScraper<O> = {
  [P in keyof O]: Scraper<Node, TE.TaskEither<any, O[P]>>;
};

export type PartialPropertyScraper<O> = PropertyScraper<RecursivePartial<O>>;

type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

type ObjectEntries<T> = ObjectEntry<T>[];

export const object = <O>(
  propertyTransforms: PartialPropertyScraper<O>,
): Scraper<Node, T.Task<RecursivePartial<O>>> => {
  const entries = Object.entries(propertyTransforms) as ObjectEntries<PartialPropertyScraper<O>>;
  return (node): T.Task<RecursivePartial<O>> => {
    return async function () {
      const result: RecursivePartial<O> = {};
      for (const [property, scraper] of entries) {
        if (result[property]) {
          throw new Error(`Property "${property}" is already set to "${result[property]}"`);
        }
        const taskEither = scraper(node);
        const either = await taskEither();
        if (E.isRight(either)) {
          result[property] = either.right;
        } else {
          console.log(`Error while scraping value for property ${property}`);
          console.warn(either.left);
        }
      }
      return result;
    };
  };
};
