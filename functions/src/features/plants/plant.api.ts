import { onCall } from "firebase-functions/v2/https";
import { Plant } from "./plant.model";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { addPlantByName, getPlantsCount } from "./plant.service";
import { AddPlantDto } from "./plant.dto";
import { updatePlantsNumber } from "../home-page-info/home-page-info.service";
import { firestore, logger } from "firebase-functions";

exports.updateHomepageOnNewPlant = firestore
  .document("plants/{plantId}")
  .onCreate(async (snap, _) => {
    const newPlant: Plant = snap.data() as Plant;
    const userId = newPlant.userId;

    logger.info("New plant detected. Creating updating home page with plants count.", "User:", newPlant.userId, "Plant:", snap.id);

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
