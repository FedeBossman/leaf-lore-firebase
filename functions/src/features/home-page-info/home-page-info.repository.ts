import { db } from "../../shared/firestoreConnection";
import { HomePageInfo } from "./model/home-page-info.model";

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
  const hpi =  homePageInfo?.data() as HomePageInfo;
  if (hpi) { 
    hpi.id = homePageInfo?.id;
  }
  return hpi;
};


export const updateHomePageInfoRecordWithPlantsNumber = async (userId: string, plantsCount: number) => {
  const homePageInfoRef = await getHomePageInfoRecordFromFirestore(userId);
  return db.collection(homePageInfoCollection).doc(homePageInfoRef?.id ?? 'no-homepage')
            .update({plantsCount})
            .then(() => console.log('Homepage updated with new plant for user:', userId, 'with count:', plantsCount))
            .catch((error) => console.error('Error updating homepage:', error));
};