import fetch, { RequestInit } from 'node-fetch';
import type { Document } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import * as TE from 'fp-ts/TaskEither';

export const createRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: string): TE.TaskEither<any, Document> =>
    TE.tryCatch(
      async () => {
        const response = await fetch(url, init);
        const body = await response.text();
        return parseDocument(body);
      },
      (error) => error,
    );

export const requestT = createRequester();

export const createJsonRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: string): TE.TaskEither<any, any> =>
    TE.tryCatch(
      async () => {
        const response = await fetch(url, init);
        return await response.json();
      },
      (error) => error,
    );

export const requestJsonT = createJsonRequester();
