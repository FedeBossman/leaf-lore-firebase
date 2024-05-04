import { onCall } from "firebase-functions/v2/https";
import { createDailyTip, createSeasonalTip } from "./tip.service";
import { getDailyTip, getSeasonalTip } from "./tip.repository";
import { withMiddleware } from "../../shared/middleware/middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { logger } from "firebase-functions/v2";

exports.getDailyTip = onCall(
  withMiddleware([authenticate], async ({ auth }) => {
    const userId = auth!.uid;

    logger.info("Get daily tip called.", "User:", userId);

    let dailyTip = await getDailyTip(userId);

    if (!dailyTip) {
      logger.info("Daily tip not found. Creating daily tip.", "User:", userId);
      dailyTip = await createDailyTip(userId);
    }

    return dailyTip;
  })
);

exports.getSeasonalTip = onCall(
  withMiddleware([authenticate], async ({ auth }) => {
    const userId = auth!.uid;
    logger.info("Get seasonal tip called.", "User:", userId);

    let tip = await getSeasonalTip(userId);

    if (!tip) {
      logger.info("Seasonal tip not found. Creating seasonal tip.", "User:", userId);
      tip = await createSeasonalTip(userId);
    }

    return tip;
  })
);
