import { db } from "../../shared/firestoreConnection";
import { Plant } from "./plant.model";

const plantsCollection = "plants";

export const addPlantRecordToFirestore = async (plant: Plant) => {
  return await db.collection(plantsCollection).add(plant);
};
