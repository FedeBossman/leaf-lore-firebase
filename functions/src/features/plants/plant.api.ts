import { onCall } from "firebase-functions/v2/https";
import { Plant } from "./plant.model";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { addPlantByName, getPlantsCount } from "./plant.service";
import { AddPlantDto } from "./plant.dto";
import * as functions from "firebase-functions";
import { updatePlantsNumber } from "../home-page-info/home-page-info.service";

exports.updateHomepageOnNewPlant = functions.firestore
  .document("plants/{plantId}")
  .onCreate(async (snap, context) => {
    const newPlant: Plant = snap.data() as Plant;
    const userId = newPlant.userId;

    const plantsCount = await getPlantsCount(userId);

    return updatePlantsNumber(userId, plantsCount);
  });

exports.getPlants = onCall(
  withMiddleware([authenticate], async ({ data, auth }) => {
    // const userId = context.auth.uid;

    const plants: Plant[] = [];

    return plants;
  })
);

exports.addPlant = onCall(
  withMiddleware<AddPlantDto>([authenticate], async ({ data, auth }) => {
    const plantRef = await addPlantByName(auth!.uid, data.name);
    return { plantId: plantRef.id };
  })
);
