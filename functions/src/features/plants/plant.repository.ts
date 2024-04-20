import { db } from "../../shared/firestoreConnection";
import { Plant } from "./plant.model";

const plantsCollection = "plants";

export const addPlantRecordToFirestore = async (plant: Plant) => {
  return await db.collection(plantsCollection).add(plant);
};


export const getPlantsCountByUserId = async (userId: string): Promise<number> => {
  const plantsRef = db
    .collection(plantsCollection)
    .where("userId", "==", userId)
    .count();

  // Execute the count query
  var result = await plantsRef.get();

  // The count of documents is available in the `count` field of the result
  const count = result.data()?.['count'] ?? 0;
  return count;
}