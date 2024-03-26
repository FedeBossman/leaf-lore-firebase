import { UserOwned } from "../../shared/user-owned.interface";
import { CareLevel, SunlightRequirement, WateringFrequency, FertilizationFrequency, SoilType, PotSize, HumidityRequirement } from "./plant.enums";

export interface Plant extends UserOwned {
    name: string;
    nickname: string;
    startDate: Date;
    careLevel: CareLevel;
    sunlightRequirement: SunlightRequirement;
    wateringFrequency: WateringFrequency;
    fertilizationFrequency: FertilizationFrequency;
    soilType: SoilType;
    potSize: PotSize;
    humidityRequirement: HumidityRequirement;
    notes?: string;
  }
  
  