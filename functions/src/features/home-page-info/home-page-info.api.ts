import { onCall } from "firebase-functions/v2/https";
import { updateHomePageInfo } from "./home-page-info.processor";
import { getHomePageInfoRecordFromFirestore } from "./home-page-info.repository";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";

exports.getHomePageInfo = onCall(withMiddleware([authenticate], async ({auth}) => {
    const userId = auth!.uid;
  
    await updateHomePageInfo(userId);
  
    const homePageInfo = await getHomePageInfoRecordFromFirestore(userId);
  
    return homePageInfo;
  }));
  