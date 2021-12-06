import { flow, pipe } from 'fp-ts/function';
import { attr, match, next, number, object, selectAll, selectOne, text } from 'hyperscraped/src';
import { requestDocumentT } from 'hyperscraped-follower/src';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

interface Post {
  position: number;
  title: string;
  href: string;
  site?: string;
  points?: number;
  comments?: number;
  page: PostPage;
}

interface PostPage {
  title?: string;
  description?: string;
  image?: string;
}

// Get the `href` attribute from title element
const scrapeHref = flow(
  selectOne('td.title:nth-child(3) > a'),
  E.chain(attr('href')),
  E.map((href) => new URL(href, 'https://news.ycombinator.com/').href),
);

// Scrape the target page
const scrapePageObject = object<PostPage>({
  // Get title from head
  title: flow(
    selectOne('head > title'),
    E.map(text),
    TE.fromEither,
    TE.orElse(() => TE.of<any, string | undefined>(undefined)),
  ),
  // Get og:description
  description: flow(
    selectOne('meta[name="og:description"]'),
    E.chain(attr('content')),
    TE.fromEither,
    TE.orElse(() => TE.of<any, string | undefined>(undefined)),
  ),
  // Get og:image
  image: flow(
    selectOne('meta[name="og:image"]'),
    E.chain(attr('content')),
    TE.fromEither,
    TE.orElse(() => TE.of<any, string | undefined>(undefined)),
  ),
});

const scrapePostObject = object<Post>({
  // Get the text from title element
  title: flow(selectOne('td.title:nth-child(3) > a'), E.map(text), TE.fromEither),
  // Get the text from the position element
  position: flow(selectOne('td.title:nth-child(1)'), E.chain(number), TE.fromEither),
  // Get the `href` attribute from title element
  href: flow(scrapeHref, TE.fromEither),
  // Get the text from the site element
  site: flow(
    selectOne('td.title:nth-child(3) span.sitestr'),
    E.map(text),
    TE.fromEither,
    TE.orElse(() => TE.of<any, string | undefined>(undefined)),
  ),
  // Get the points from the score element in the next sibling
  points: flow(
    next,
    E.chain(selectOne('span.score')),
    E.chain(match(/([\d]+)\s+point/, 1)),
    E.chain(number),
    TE.fromEither,
    TE.orElse(() => TE.of<any, number | undefined>(undefined)),
  ),
  // Get the comments from the comment element in the next sibling
  comments: flow(
    next,
    E.chain(selectOne('td:last-child > a:last-child')),
    E.chain(match(/([\d]+)\s+comment/, 1)),
    E.chain(number),
    TE.fromEither,
    TE.orElse(() => TE.of<any, number | undefined>(undefined)),
  ),
  // Get the related page
  page: flow(scrapeHref, TE.fromEither, TE.chain(requestDocumentT), TE.chain(scrapePageObject)),
});

// Find the row that contains most of the data and parse the element as an object using the given scrapers
const posts = flow(selectAll('tr.athing'), A.map(scrapePostObject));

const scrape = flow(
  requestDocumentT, //
  TE.map(posts),
  TE.chain(A.sequence(TE.ApplicativeSeq)),
);

async function main() {
  const task = scrape('https://news.ycombinator.com/');
  const result = await task();

  pipe(result, E.map(A.map((post) => console.log(post))));
}

main();
