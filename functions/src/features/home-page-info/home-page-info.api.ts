import { onCall } from "firebase-functions/v2/https";
import { createInitialHpi, updateHomePageInfo } from "./home-page-info.service";
import { getHomePageInfoRecordFromFirestore } from "./home-page-info.repository";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { user } from "firebase-functions/v1/auth";


exports.createInitialHomePageInfo = user().onCreate(async (user) => {
  const userId = user.uid;
  const hpi = await getHomePageInfoRecordFromFirestore(userId);
  if (!hpi) {
      const hpiRef = await createInitialHpi(userId);
      return {hpiId: hpiRef.id};
  } else {
      return {hpiId: hpi.id};
  }
});

exports.getHomePageInfo = onCall(
  withMiddleware([authenticate], async ({ auth }) => {
    const userId = auth!.uid;

    await updateHomePageInfo(userId);

    const homePageInfo = await getHomePageInfoRecordFromFirestore(userId);

    return homePageInfo;
  })
);
