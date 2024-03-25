import { HttpsError } from "firebase-functions/v2/https";
import { Middleware } from "./middleware";

export const authenticate: Middleware = async ({auth}) => {
  if (!auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
};
