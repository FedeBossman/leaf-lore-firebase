import { HttpsError, onCall } from "firebase-functions/v1/https";
import { Plant } from "./plant.model";

exports.getPlants = onCall(async (data, context) => {
    if (!context.auth?.uid) {
      throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    // const userId = context.auth.uid;
  
    const plants: Plant[] = [];
  
    return plants;
  });
  