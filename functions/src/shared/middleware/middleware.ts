import { CallableRequest } from "firebase-functions/v2/https";

export type Middleware = (
    request: CallableRequest<object>
) => Promise<void> | void;

export function withMiddleware<T extends object>(
  middlewares: Middleware[],
  func: (request: CallableRequest<T>) => object | Promise<object>
) {
  return async (request: CallableRequest<T>) => {
    for (const middleware of middlewares) {
      await middleware(request);
    }
    return func(request);
  };
}
