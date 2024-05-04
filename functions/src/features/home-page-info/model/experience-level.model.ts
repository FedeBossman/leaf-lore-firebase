export type ExperienceLevelDetails = {
  description: string;
  focus: string[];
};

export enum ExperienceLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
}

export const experienceLevels: Record<ExperienceLevel, ExperienceLevelDetails> = {
  [ExperienceLevel.Beginner]: {
    description: "Users with little to no prior knowledge about plant care.",
    focus: ["Basic care tips", "Foundational knowledge about plant types", "Simple guides on watering and sunlight needs"]
  },
  [ExperienceLevel.Intermediate]: {
    description: "Users with some experience, comfortable with basic care routines but looking to expand their knowledge.",
    focus: [
      "More detailed care instructions",
      "Problem-solving for common issues",
      "Introduction to more varied plant types",
      "Intermediate techniques like repotting and propagation"
    ]
  },
  [ExperienceLevel.Advanced]: {
    description: "Experienced gardeners who understand the broad and deep aspects of different plant needs and care techniques.",
    focus: [
      "Advanced care strategies",
      "Troubleshooting less common problems",
      "Optimizing plant health",
      "Specialized care for rare or exotic plants",
      "Advanced propagation techniques"
    ]
  },
  [ExperienceLevel.Expert]: {
    description: "Users with professional-level knowledge or extensive personal experience in horticulture.",
    focus: [
      "Research-level insights",
      "Scientific aspects of plant care",
      "Experimental techniques",
      "In-depth guides on specific plant families",
      "Community leadership opportunities"
    ]
  }
};
