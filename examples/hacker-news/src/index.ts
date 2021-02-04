import fetch from 'node-fetch';
import { Document } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import { s, next, attr, object, number, map, match, text, toNumber } from 'hyperscraped/src';
import { follow } from 'hyperscraped-follower/src';

interface Post {
  position: number;
  title: string;
  href: string;
  site: string;
  points: number;
  comments: number;
  document?: Document;
}

const toPoints = map(match(/([\d]+)\s+points/, 1), toNumber);
const toComments = map(match(/([\d]+)\s+comment/, 1), toNumber);

// Get the text from title element
const title = s('td.title:nth-child(3) > a')(text);
// Get the text from the position element
const position = s('td.title:nth-child(1)')(number);
// Get the `href` attribute from title element
const href = s('td.title:nth-child(3) > a')(attr('href'));
// Get the text from the site element
const site = s('td.title:nth-child(3) span.sitestr')(text);
// Get the points from the score element in the next sibling
const points = next(s('span.score')(toPoints));
// Get the comments from the comment element in the next sibling
const comments = next(s('td:last-child > a:last-child')(toComments));
// Follow the post link and request the document
const document = follow(href);

// Find the row that contains most of the data and parse the element as an object using the given scrapers
const posts = s('tr.athing')(
  object<Post>({
    title,
    position,
    href,
    site,
    points,
    comments,
    document,
  }),
);

async function main() {
  const content = await fetch('https://news.ycombinator.com/');
  const root = parseDocument(await content.text());

  for await (const post of posts(root)) {
    // Log all posts to the console
    console.log(post);
  }
}

main();
