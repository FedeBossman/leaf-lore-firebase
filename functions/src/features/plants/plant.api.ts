import { onCall } from "firebase-functions/v2/https";
import { Plant } from "./plant.model";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { addPlantByName } from "./plant.service";
import { AddPlantDto } from "./plant.dto";

exports.getPlants = onCall(withMiddleware([authenticate], async ({data, auth}) => {
  // const userId = context.auth.uid;

  const plants: Plant[] = [];

  return plants;
}));
  


exports.addPlant = onCall(withMiddleware<AddPlantDto>([authenticate], async ({data, auth}) => {
  const plantRef = await addPlantByName(auth!.uid, data.name);
  return {plantId: plantRef.id};
}));
  
