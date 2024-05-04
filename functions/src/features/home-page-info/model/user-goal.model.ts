export interface UserGoal {
    id: UserGoals;
    title: string;
    description: string;
    completed: boolean;
}


export enum UserGoals {
    LearnBasicCare = "learn basic plant care",
    ImprovePlantHealth = "improve plant health",
    ExpandCollection = "expand plant collection",
    MasterTechniques = "master advanced techniques",
    AchieveGreenerHome = "achieve a greener home",
    CreateGarden = "create a garden",
    SustainableGardening = "sustainable gardening",
    CommunityEngagement = "community engagement"
}
