import { onCall, HttpsError } from "firebase-functions/v1/https";
import { createDailyTip, createSeasonalTip } from "./tip.processor";
import { getDailyTip, getSeasonalTip } from "./tip.repository";

exports.getDailyTip = onCall(async (data, context) => {
    if (!context.auth?.uid) {
      throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userId = context.auth.uid;
    let dailyTip = await getDailyTip(userId);
  
    if (!dailyTip) {
        dailyTip = await createDailyTip(userId);
    }
  
    return dailyTip;
  });
  
  exports.getSeasonalTip = onCall(async (data, context) => {
    if (!context.auth?.uid) {
      throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userId = context.auth.uid;
    let dailyTip = await getSeasonalTip(userId);
  
    if (!dailyTip) {
        dailyTip = await createSeasonalTip(userId);
    }
  
    return dailyTip;
  });