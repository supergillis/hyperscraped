import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch';
import type { Document } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import * as TE from 'fp-ts/TaskEither';

export const createRawRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: RequestInfo): TE.TaskEither<any, Response> =>
    TE.tryCatch(
      () => fetch(url, init),
      (error) => error,
    );

export const createTextRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: RequestInfo): TE.TaskEither<any, string> =>
    TE.chainTaskK((response: Response) => () => response.text())(createRawRequester(init)(url));

export const createDocumentRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: RequestInfo): TE.TaskEither<any, Document> =>
    TE.chainTaskK((body: string) => async () => parseDocument(body))(createTextRequester(init)(url));

/**
 * @deprecated
 */
export const createRequester = createDocumentRequester;

export const createJsonRequester =
  (init: RequestInit = { timeout: 10000 }) =>
  (url: RequestInfo): TE.TaskEither<any, any> =>
    TE.chainTaskK((response: Response) => () => response.json())(createRawRequester(init)(url));

export const requestRawT = createRawRequester();
export const requestDocumentT = createDocumentRequester();
/**
 * @deprecated
 */
export const requestT = createRequester();
export const requestTextT = createTextRequester();
export const requestJsonT = createJsonRequester();
