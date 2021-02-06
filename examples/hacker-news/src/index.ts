import fetch from 'node-fetch';
import { parseDocument } from 'htmlparser2';
import { pipe } from 'fp-ts/function';
import { selectAll, selectOne, selectSelf, next, attr, object, number, match, text } from 'hyperscraped/src';
import { follow } from 'hyperscraped-follower/src';

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
const href = pipe(selectOne('td.title:nth-child(3) > a'), attr('href'));

// Scrape the target page
const page = object<PostPage>({
  title: pipe(selectOne('head > title'), text),
  description: pipe(selectOne('meta[name="og:description"]'), attr('content')),
  image: pipe(selectOne('meta[name="og:image"]'), attr('content')),
});

const post = object<Post>({
  // Get the text from title element
  title: pipe(selectOne('td.title:nth-child(3) > a'), text),
  // Get the text from the position element
  position: pipe(selectOne('td.title:nth-child(1)'), number),
  // Get the `href` attribute from title element
  href,
  // Get the text from the site element
  site: pipe(selectOne('td.title:nth-child(3) span.sitestr'), text),
  // Get the points from the score element in the next sibling
  points: pipe(next(selectOne('span.score')), match(/([\d]+)\s+point/, 1), number),
  // Get the comments from the comment element in the next sibling
  comments: pipe(next(selectOne('td:last-child > a:last-child')), match(/([\d]+)\s+point/, 1), number),
  // Follow the post link and request the document
  page: pipe(href, follow(pipe(selectSelf, page))),
});

// Find the row that contains most of the data and parse the element as an object using the given scrapers
const posts = pipe(selectAll('tr.athing'), post);

async function main() {
  const content = await fetch('https://news.ycombinator.com/');
  const root = parseDocument(await content.text());

  for await (const post of posts(root)) {
    // Log all posts to the console
    console.log(post);
  }
}

main();
