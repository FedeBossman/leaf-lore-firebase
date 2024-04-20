import { Timestamp } from "firebase-admin/firestore";
import { ExperienceLevel } from "./experience-level.model";
import { GardenerTypes } from "./gardener-type.model";
import { LocationDetails } from "./location.model";
import { UserGoals } from "./user-goal.model";

export interface HomePageInfo {
    id?: string;
    userId: string;
    createdAt: Timestamp;
    experience: ExperienceLevel | null;
    goals: UserGoals[];
    nickname: string | null;
    location: LocationDetails | null;
    type: GardenerTypes | null;
    plantsCount: number;
}