import { HttpsError, onCall } from "firebase-functions/v1/https";
import { updateHomePageInfo } from "./home-page-info.processor";
import { getHomePageInfoRecordFromFirestore } from "./home-page-info.repository";

exports.getHomePageInfo = onCall(async (data, context) => {
    if (!context.auth?.uid) {
      throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userId = context.auth.uid;
  
    await updateHomePageInfo(userId);
  
    const homePageInfo = await getHomePageInfoRecordFromFirestore(userId);
  
    return homePageInfo;
  });
  