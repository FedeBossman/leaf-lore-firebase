import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../shared/firestoreConnection";
import { Tip, TipCategory } from "./tip.model";
import { getEndOfDay, getEndOfSeason, getStartOfDay, getStartOfSeason } from "../../shared/utils/date.utils";

const tipsCollection = 'tips';

export const getDailyTips = async (userId: string): Promise<Tip[]> => {

  const query = db.collection(tipsCollection)
    .where('userId', '==', userId)
    .where('category', '==', TipCategory.DAILY)
    .limit(10);

  const dailyTipsSnapshot = await query.get();

  return dailyTipsSnapshot.docs.map(doc => doc.data() as Tip);
}

export const getDailyTip = async (userId: string): Promise<Tip|null> => {
  const today = new Date();
  const startOfToday = getStartOfDay(today);
  const endOfToday = getEndOfDay(today);

  const query = db.collection(tipsCollection)
    .where('userId', '==', userId)
    .where('category', '==', TipCategory.DAILY)
    .where('createdAt', '>=', Timestamp.fromDate(startOfToday))
    .where('createdAt', '<=', Timestamp.fromDate(endOfToday))
    .limit(1);

  const dailyTipSnapshot = await query.get();

  if (dailyTipSnapshot.empty) {
    return null;
  }

  return dailyTipSnapshot.docs[0].data() as Tip;
}

export const getSeasonalTips = async (userId: string): Promise<Tip[]> => {
  const query = db.collection(tipsCollection)
    .where('userId', '==', userId)
    .where('category', '==', TipCategory.SEASONAL)
    .limit(10);

  const dailyTipsSnapshot = await query.get();

  return dailyTipsSnapshot.docs.map(doc => doc.data() as Tip);
}

export const getSeasonalTip = async (userId: string): Promise<Tip|null> => {
  const currentDate = new Date();
  let startOfSeason: Date = getStartOfSeason(currentDate);
  let endOfSeason: Date = getEndOfSeason(currentDate);

  var query = db.collection(tipsCollection) 
    .where('userId', '==', userId)
    .where('category', '==', TipCategory.SEASONAL)
    .where('createdAt', '>=', Timestamp.fromDate(startOfSeason))
    .where('createdAt', '<=', Timestamp.fromDate(endOfSeason))
    .limit(1);

  const tipSnapshot = await query.get();

  if (tipSnapshot.empty) {
    return null;
  }

  return tipSnapshot.docs[0].data() as Tip;
}

export const addTipToFirestore = async (tip: Tip) => {
  const dailyTipRef = db.collection(tipsCollection);
  return dailyTipRef.add(tip);
}