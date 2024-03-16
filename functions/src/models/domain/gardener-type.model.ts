export type GardenerType = {
    name: string;
    description: string;
};

export enum GardenerTypes {
    urbanGardener = "Urban Gardener",
    vegetableGardener = "Vegetable Gardener",
    flowerGardener = "Flower Gardener",
    indoorGardener = "Indoor Gardener",
    communityGardener = "Community Gardener",
    landscapeGardener = "Landscape Gardener",
    therapeuticGardener = "Therapeutic Gardener",
    conservationGardener = "Conservation Gardener"
}

export const gardenerTypes: GardenerType[] = [
    { name: GardenerTypes.urbanGardener, description: "Focuses on gardening in urban environments, often with limited space like balconies or small yards." },
    { name: GardenerTypes.vegetableGardener, description: "Primarily grows vegetables, often with a focus on sustainability and organic practices." },
    { name: GardenerTypes.flowerGardener, description: "Specializes in cultivating flowers, ranging from annuals and perennials to bulbs and ornamentals." },
    { name: GardenerTypes.indoorGardener, description: "Prefers growing plants indoors, often in containers or indoor beds, including houseplants and indoor herbs." },
    { name: GardenerTypes.communityGardener, description: "Participates in communal garden spaces, often with a focus on community engagement and local food production." },
    { name: GardenerTypes.landscapeGardener, description: "Focuses on designing, creating, and maintaining outdoor spaces, often blending aesthetics with functionality." },
    { name: GardenerTypes.therapeuticGardener, description: "Uses gardening as a form of therapy, focusing on the psychological and physical benefits of gardening." },
    { name: GardenerTypes.conservationGardener, description: "Dedicated to preserving native plant species and promoting biodiversity in gardening practices." }
];