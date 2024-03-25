import { onCall } from "firebase-functions/v2/https";
import { Plant } from "./plant.model";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";

exports.getPlants = onCall(withMiddleware([authenticate], async ({data, auth}) => {
    // const userId = context.auth.uid;
  
    const plants: Plant[] = [];
  
    return plants;
  }));
  