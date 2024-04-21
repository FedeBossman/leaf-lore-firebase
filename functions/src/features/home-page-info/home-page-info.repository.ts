import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../shared/firestoreConnection";
import { HomePageInfo } from "./model/home-page-info.model";
import { Weather } from "./model/weather.model";

const homePageInfoCollection = "homePageInfo";

export const saveHomePageInfoToFirestore = async (
  homePageInfo: HomePageInfo
) => {
  const chatRef = db.collection(homePageInfoCollection);
  return chatRef.add(homePageInfo);
};

export const getHomePageInfoRecordFromFirestore = async (
  userId: string
): Promise<HomePageInfo> => {
  const homePageInfoRef = db
    .collection(homePageInfoCollection)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1);

  const homePageInfo = (await homePageInfoRef.get()).docs[0];
  const hpi = homePageInfo?.data() as HomePageInfo;
  if (hpi) {
    hpi.id = homePageInfo?.id;
  }
  return hpi;
};

export const updateHomePageInfoRecordWithGptData = async (
  userId: string,
  hpi: HomePageInfo
) => {
  const homePageInfoRef = await getHomePageInfoRecordFromFirestore(userId);
  return db
    .collection(homePageInfoCollection)
    .doc(homePageInfoRef?.id ?? "no-homepage")
    .update({ ...hpi })
    .then(() =>
      console.log(
        "Homepage updated with new hpi for user:",
        userId,
        "with hpi:",
        hpi
      )
    )
    .catch((error) =>
      console.error("Error updating homepage with new gpt hpi:", error)
    );
};

export const updateHomePageInfoRecordWithPlantsNumber = async (
  userId: string,
  plantsCount: number
) => {
  const homePageInfoRef = await getHomePageInfoRecordFromFirestore(userId);
  return db
    .collection(homePageInfoCollection)
    .doc(homePageInfoRef?.id ?? "no-homepage")
    .update({ plantsCount })
    .then(() =>
      console.log(
        "Homepage updated with new plant for user:",
        userId,
        "with count:",
        plantsCount
      )
    )
    .catch((error) =>
      console.error("Error updating homepage with plant count:", error)
    );
};

export const updateHomePageInfoRecordWithWeather = async (
  userId: string,
  weather: Weather
) => {
  const homePageInfoRef = await getHomePageInfoRecordFromFirestore(userId);
  return db
    .collection(homePageInfoCollection)
    .doc(homePageInfoRef?.id ?? "no-homepage")
    .update({ weather: { ...weather, updatedAt: Timestamp.now() } })
    .then(() =>
      console.log(
        "Homepage updated with new weather for user:",
        userId,
        "with weather:",
        weather
      )
    )
    .catch((error) =>
      console.error("Error updating homepage with weather:", error)
    );
};
