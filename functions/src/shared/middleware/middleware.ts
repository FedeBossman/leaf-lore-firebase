import { CallableRequest } from "firebase-functions/v2/https";

export type Middleware = (
    request: CallableRequest<any>
) => Promise<void> | void;

export function withMiddleware<T>(
    middlewares: Middleware[],
    func: (request: CallableRequest<T>) => any
) {
    return async (request: CallableRequest<T>) => {
        for (const middleware of middlewares) {
            await middleware(request);
        }
        return func(request); 
    };
}
