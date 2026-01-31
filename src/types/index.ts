/**
 * Types barrel file
 * Re-exports all types for convenient imports
 */

export type {
  // API Response types
  ApiResponse,
  ApiError,
  PaginatedResponse,
  // Auth types
  GoogleAuthRequest,
  AuthResponse,
  AuthUser,
  // User types
  UserProfile,
  ActivityLevel,
  Sex,
  DietLevel,
  ThemePreference,
  CreateProfileDto,
  HealthMetrics,
  // Tracking types
  WeightLog,
  WeightHistoryResponse,
  CreateWeightLogDto,
  GlucoseType,
  GlucoseCategory,
  GlucoseLog,
  GlucoseHistoryResponse,
  CreateGlucoseLogDto,
  // Food types
  FoodCategory,
  FoodServing,
  FoodSummary,
  FoodDetails,
  FoodListResponse,
  FoodSearchParams,
  // Plan API types (simplified for API responses)
  PlanSummary,
  PlanDetails,
  DailyTargets,
  PlanRule,
  // Meal logging types
  MealFoodItem,
  MealLog,
  MealSummary,
  DailySummary,
  MealHistoryResponse,
  CreateMealFoodItem,
  CreateMealDto,
  QuickLogMealDto,
  UpdateMealMetadataDto,
  MealQueryParams,
} from './api';

// Nutrition Plan types (comprehensive plan engine types)
export type {
  NumericConstraint,
  MacroTargets,
  MealMacroConstraints,
  MealType,
  MealSlot,
  MealFlowConfig,
  RuleSeverity,
  NutritionRule,
  EvaluationStatus,
  RuleEvaluationResult,
  MealEvaluationResult,
  PlanVisibility,
  PlanDifficulty,
  PlanMetadata,
  NutritionPlan,
  UserPlanAssignment,
} from './nutrition-plan';
