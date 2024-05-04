export interface LocationDetails {
  city: string;
  state: string;
  country: string;
  type: LocationType;
}

export enum LocationType {
  Indoor = "indoors",
  Outdoor = "outdoors",
  Balcony = "balcony",
  Garden = "garden",
  Office = "office",
  Other = "other"
}
