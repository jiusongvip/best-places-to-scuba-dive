import { defineCollection, z } from 'astro:content';

const destinationCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    country: z.string(),
    countrySlug: z.string(),
    ocean: z.enum(['pacific', 'atlantic', 'indian', 'red-sea', 'caribbean', 'mediterranean']),
    continent: z.enum(['asia', 'africa', 'europe', 'north-america', 'south-america', 'oceania']),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    // Diving conditions
    visibilityMeters: z.number(),
    waterTempCelsius: z.number(),
    waterTempRange: z.string(),
    current: z.enum(['mild', 'moderate', 'moderate_to_strong', 'strong']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'technical', 'shark']),
    maxDepthMeters: z.number(),
    // Timing
    bestMonths: z.array(z.number()),
    peakSeason: z.array(z.number()),
    // Certification
    certificationRequired: z.enum(['none', 'open_water', 'advanced_open_water', 'rescue', 'dive_master', 'technical', 'shark']),
    minDivesRecommended: z.number(),
    // Budget
    budgetLevel: z.enum(['budget', 'mid_range', 'premium', 'luxury']),
    averageDailyCostUsd: z.number(),
    liveaboardAvailable: z.boolean(),
    // Dive types
    diveTypes: z.array(z.enum(['boat', 'drift', 'liveaboard', 'night', 'wreck', 'cave', 'cavern', 'shore', 'wall', 'muck', 'deep', 'technical', 'shark'])),
    shoreDive: z.enum(['none', 'limited', 'good', 'excellent']),
    // Marine life (1-5 rating)
    marineLife: z.object({
      sharks: z.number().min(0).max(5),
      mantaRays: z.number().min(0).max(5),
      whaleSharks: z.number().min(0).max(5),
      turtles: z.number().min(0).max(5),
      coral: z.number().min(0).max(5),
      macro: z.number().min(0).max(5),
      pelagics: z.number().min(0).max(5),
      dolphins: z.number().min(0).max(5),
    }),
    // Suitability (1-5)
    beginnerFriendly: z.number().min(1).max(5),
    familyFriendly: z.boolean(),
    photographyScore: z.number().min(1).max(5),
    // Ratings
    overallRating: z.number().min(1).max(5),
    // Descriptive
    tagline: z.string(),
    description: z.string(),
    whyDive: z.array(z.string()),
    bestDiveSpots: z.array(z.object({
      name: z.string(),
      description: z.string(),
      depthRange: z.string(),
      difficulty: z.string(),
      highlights: z.string(),
    })),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    nearestAirport: z.string(),
    timezoneOffset: z.string(),
    imageLocal: z.string(),
    imageCredit: z.string(),
    // Why divers rate this destination highly (neutral commentary, optional)
    editorTake: z.string().optional(),
  }),
});

export const collections = {
  destinations: destinationCollection,
};
