import { onCall } from "firebase-functions/v2/https";
import { createDailyTip, createSeasonalTip } from "./tip.service";
import { getDailyTip, getSeasonalTip } from "./tip.repository";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";

exports.getDailyTip = onCall(withMiddleware([authenticate], async ({auth}) => {
    const userId = auth!.uid;
    let dailyTip = await getDailyTip(userId);
  
    if (!dailyTip) {
        dailyTip = await createDailyTip(userId);
    }
  
    return dailyTip;
  }));
  
exports.getSeasonalTip = onCall(withMiddleware([authenticate], async ({auth}) => {
    const userId = auth!.uid;
    let tip = await getSeasonalTip(userId);

    if (!tip) {
      tip = await createSeasonalTip(userId);
    }

    return tip;
}));