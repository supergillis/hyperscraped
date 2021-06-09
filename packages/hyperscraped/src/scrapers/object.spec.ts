import test from 'ava';
import { Node } from 'domhandler';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { object } from './object';

test('object should be created if everything is all right', async (t) => {
  const objectTE = object({
    title: () => TE.right('title'),
    description: () => TE.right('description'),
  });

  await t.notThrowsAsync(async () => {
    const value = await objectTE({} as unknown as Node)();

    t.deepEqual(
      value,
      E.right({
        title: 'title',
        description: 'description',
      }),
    );
  });
});

test('object should be created if everything is all right with delay', async (t) => {
  const objectTE = object({
    title: () => TE.right('title'),
    description: () => () => delay(100).then(() => E.right('description')),
  });

  await t.notThrowsAsync(async () => {
    const value = await objectTE({} as unknown as Node)();

    t.deepEqual(
      value,
      E.right({
        title: 'title',
        description: 'description',
      }),
    );
  });
});

test('object should be created if everything is all right with multiple delays', async (t) => {
  const objectTE = object({
    title: () => () => delay(200).then(() => E.right('title')),
    description: () => () => delay(100).then(() => E.right('description')),
  });

  await t.notThrowsAsync(async () => {
    const value = await objectTE({} as unknown as Node)();

    t.deepEqual(
      value,
      E.right({
        title: 'title',
        description: 'description',
      }),
    );
  });
});

test('object should be not be constructed if there is a left value', async (t) => {
  const objectTE = object({
    title: () => TE.right('title'),
    description: () => TE.left('error'),
  });

  await t.notThrowsAsync(async () => {
    const value = await objectTE({} as unknown as Node)();

    t.deepEqual(value, E.left('error'));
  });
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
