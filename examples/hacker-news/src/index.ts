import fetch from 'node-fetch';
import { parseDocument } from 'htmlparser2';
import { flow } from 'fp-ts/function';
import { attr, match, next, number, object, selectAll, selectOne, text } from 'hyperscraped/src';
import { requestT } from 'hyperscraped-follower/src';
import * as I from 'iterators-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

interface Post {
  position: number;
  title: string;
  href: string;
  site: string;
  points: number;
  comments: number;
  page: PostPage;
}

interface PostPage {
  title: string;
  description: string;
  image: string;
}

// Get the `href` attribute from title element
// prettier-ignore
const scrapeHref = flow(
  selectOne('td.title:nth-child(3) > a'),
  E.chain(attr('href')),
  E.map(href => new URL(href, 'https://news.ycombinator.com/').href)
);

// Scrape the target page
const scrapePageObject = object<PostPage>({
  // prettier-ignore
  title: flow(
    selectOne('head > title'),
    E.map(text),
    TE.fromEither
  ),
  // prettier-ignore
  description: flow(
    selectOne('meta[name="og:description"]'),
    E.chain(attr('content')),
    TE.fromEither
  ),
  // prettier-ignore
  image: flow(
    selectOne('meta[name="og:image"]'),
    E.chain(attr('content')),
    TE.fromEither
  ),
});

const scrapePostObject = object<Post>({
  // Get the text from title element
  // prettier-ignore
  title: flow(
    selectOne('td.title:nth-child(3) > a'),
    E.map(text),
    TE.fromEither
  ),
  // Get the text from the position element
  // prettier-ignore
  position: flow(
    selectOne('td.title:nth-child(1)'),
    E.chain(number),
    TE.fromEither
  ),
  // Get the `href` attribute from title element
  // prettier-ignore
  href: flow(
    scrapeHref,
    TE.fromEither
  ),
  // Get the text from the site element
  // prettier-ignore
  site: flow(
    selectOne('td.title:nth-child(3) span.sitestr'),
    E.map(text),
    TE.fromEither
  ),
  // Get the points from the score element in the next sibling
  // prettier-ignore
  points: flow(
    next,
    E.chain(selectOne('span.score')),
    E.chain(match(/([\d]+)\s+point/, 1)),
    E.chain(number),
    TE.fromEither,
  ),
  // Get the comments from the comment element in the next sibling
  // prettier-ignore
  comments: flow(
    next,
    E.chain(selectOne('td:last-child > a:last-child')),
    E.chain(match(/([\d]+)\s+comment/, 1)),
    E.chain(number),
    TE.fromEither,
  ),
  // Get the related page
  // prettier-ignore
  page: flow(
    scrapeHref,
    TE.fromEither,
    TE.chain(requestT),
    TE.chainTaskK(scrapePageObject),
  ),
});

// Find the row that contains most of the data and parse the element as an object using the given scrapers
// prettier-ignore
const posts = flow(
  selectAll('tr.athing'),
  I.flatMap(scrapePostObject)
);

async function main() {
  const content = await fetch('https://news.ycombinator.com/');
  const root = parseDocument(await content.text());

  for await (const postT of posts(root)) {
    // Log all posts to the console
    const post = await postT();
    console.log(post);
  }
}

main();
