import { db } from "./firestore";
import { HomePageInfo } from "../models/domain/home-page-info.model";

export const saveHomePageInfoToFirestore = async (
  homePageInfo: HomePageInfo
) => {
  const chatRef = db.collection("homePageInfo");
  return chatRef.add(homePageInfo);
};

export const getHomePageInfoRecordFromFirestore = async (
  userId: string
): Promise<HomePageInfo|null> => {
  const homePageInfoRef = db
    .collection("homePageInfo")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(1);

  const homePageInfo = await homePageInfoRef.get();

  if (homePageInfo.empty) {
    return null;
  }

  return homePageInfo.docs[0].data() as HomePageInfo;
};
