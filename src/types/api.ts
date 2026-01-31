/**
 * API Types for Diet Management App Backend
 * Matches the NestJS backend response patterns
 */

/* ═══════════════════════════════════════════════════════════════════════════
   API Response Wrappers
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Standard success response from API
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error response from API
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Auth Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Google OAuth request payload
 */
export interface GoogleAuthRequest {
  credential: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

/**
 * Authenticated user from JWT payload
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'user' | 'admin';
  hasProfile: boolean;
  /** UI theme preference (loaded from profile) */
  themePreference?: ThemePreference;
}

/* ═══════════════════════════════════════════════════════════════════════════
   User Profile Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * User profile data returned from backend
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'user' | 'admin';
  /** Height in centimeters */
  heightCm?: number;
  /** Current weight in kilograms */
  weightKg?: number;
  /** Age in years */
  age?: number;
  /** Biological sex for BMR calculation */
  sex?: 'male' | 'female';
  /** Physical activity level */
  activityLevel?: ActivityLevel;
  /** Target weight in kilograms */
  targetWeightKg?: number;
  /** Whether the user has completed their profile */
  hasProfile?: boolean;
  /** UI theme preference */
  themePreference?: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity level for BMR calculation
 * Must match backend enum: sedentary, lightly_active, moderately_active, very_active, extremely_active
 */
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

/**
 * Biological sex for BMR calculation (backend uses 'sex' not 'gender')
 */
export type Sex = 'male' | 'female';

/**
 * Diet levels (frontend-only, not sent to backend profile API)
 */
export type DietLevel = 'low' | 'medium' | 'high';

/**
 * UI theme preference stored in user profile
 * Synced across devices via backend
 */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Profile creation/update payload
 * Matches backend CreateProfileDto exactly
 */
export interface CreateProfileDto {
  /** Height in centimeters (100-250) */
  heightCm: number;
  /** Current weight in kilograms (30-300) */
  weightKg: number;
  /** Age in years (18-120) */
  age: number;
  /** Biological sex for BMR calculation */
  sex: Sex;
  /** Physical activity level */
  activityLevel: ActivityLevel;
  /** Target weight in kilograms (30-300) */
  targetWeightKg: number;
  /** UI theme preference (optional, defaults to 'system') */
  themePreference?: ThemePreference;
}

/**
 * Calculated health metrics
 */
export interface HealthMetrics {
  bmr: number;
  tdee: number;
  bmi?: number;
  bmiCategory?: string;
  targetCalories: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Tracking Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Weight log entry (matches backend WeightLogResponseDto)
 */
export interface WeightLog {
  id: string;
  /** Date of the weight measurement (YYYY-MM-DD) */
  logDate: string;
  /** Weight in kilograms */
  weightKg: number;
  /** Timestamp when the log was recorded */
  loggedAt: string;
}

/**
 * Weight history response with statistics (matches backend WeightHistoryResponseDto)
 */
export interface WeightHistoryResponse {
  /** List of weight log entries */
  logs: WeightLog[];
  /** Total number of entries */
  total: number;
  /** Starting weight (first log) */
  startingWeight: number | null;
  /** Current weight (most recent log) */
  currentWeight: number | null;
  /** Total weight change (negative = loss) */
  totalChange: number | null;
}

/**
 * Weight log creation payload (matches backend CreateWeightLogDto)
 */
export interface CreateWeightLogDto {
  /** Weight in kilograms (30-300) */
  weightKg: number;
  /** Date for the log (YYYY-MM-DD), defaults to today */
  logDate?: string;
}

/**
 * Glucose measurement type
 */
export type GlucoseType = 'fasting' | 'post_meal' | 'random';

/**
 * Glucose category based on reading level
 */
export type GlucoseCategory = 'Low' | 'Normal' | 'Elevated' | 'High';

/**
 * Glucose log entry (matches backend GlucoseLogResponseDto)
 */
export interface GlucoseLog {
  id: string;
  /** Date of the glucose reading (YYYY-MM-DD) */
  logDate: string;
  /** Time of the reading (ISO timestamp) */
  readingTime: string;
  /** Blood glucose level in mmol/L */
  glucoseMmolL: number;
  /** Type of reading */
  readingType: GlucoseType;
  /** Glucose level category */
  category: GlucoseCategory;
  /** Notes about the reading */
  notes: string | null;
}

/**
 * Glucose history response with statistics (matches backend GlucoseHistoryResponseDto)
 */
export interface GlucoseHistoryResponse {
  /** List of glucose log entries */
  logs: GlucoseLog[];
  /** Total number of entries */
  total: number;
  /** Average fasting glucose (mmol/L) */
  averageFasting: number | null;
  /** Average post-meal glucose (mmol/L) */
  averagePostMeal: number | null;
}

/**
 * Glucose log creation payload (matches backend CreateGlucoseLogDto)
 */
export interface CreateGlucoseLogDto {
  /** Glucose level in mmol/L */
  glucoseMmolL: number;
  /** Type of reading */
  readingType: GlucoseType;
  /** Optional notes */
  notes?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Food Types (match backend FoodCategoryDto, FoodItemDto, FoodServingDto)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Food category for organizing foods
 */
export interface FoodCategory {
  /** Unique identifier */
  id: string;
  /** Display name (e.g., "Protein") */
  name: string;
  /** URL-safe identifier (e.g., "protein") */
  slug: string;
  /** Category description */
  description?: string;
  /** Emoji icon (e.g., "🥩") */
  icon?: string;
  /** Theme color for UI */
  color?: string;
  /** Display order */
  sortOrder: number;
  /** Standard unit name (e.g., "protein unit") */
  unitName?: string;
  /** Unit description */
  unitDescription?: string;
}

/**
 * Serving size with nutrition data
 */
export interface FoodServing {
  /** Unique identifier */
  id: string;
  /** Serving name (e.g., "1 medium breast") */
  servingName: string;
  /** Numeric size (e.g., 100) */
  servingSize: number;
  /** Unit of measurement (e.g., "g", "ml") */
  servingUnit: string;
  /** Whether this is the default serving */
  isDefault: boolean;
  /** Whether this represents one standard unit */
  isUnitServing: boolean;
  /** Calories per serving */
  calories: number;
  /** Protein in grams */
  protein: number;
  /** Carbohydrates in grams */
  carbs: number;
  /** Fat in grams */
  fat: number;
  /** Fiber in grams */
  fiber?: number;
  /** Sugar in grams */
  sugar?: number;
  /** Saturated fat in grams */
  saturatedFat?: number;
  /** Sodium in milligrams */
  sodium?: number;
  /** Cholesterol in milligrams */
  cholesterol?: number;
  /** Potassium in milligrams */
  potassium?: number;
  /** Glycemic index (0-100) */
  glycemicIndex?: number;
  /** Glycemic load */
  glycemicLoad?: number;
}

/**
 * Food summary for list views (lightweight)
 */
export interface FoodSummary {
  /** Unique identifier */
  id: string;
  /** Food name */
  name: string;
  /** Brand name if applicable */
  brandName?: string;
  /** Category slug for filtering */
  categorySlug: string;
  /** Category display name */
  categoryName: string;
  /** Category icon emoji */
  categoryIcon?: string;
  /** Whether verified by admin */
  isVerified: boolean;
  /** Searchable tags */
  tags: string[];
  /** Default serving name */
  defaultServingName: string;
  /** Calories per default serving */
  calories: number;
  /** Protein per default serving */
  protein: number;
  /** Carbs per default serving */
  carbs: number;
  /** Fat per default serving */
  fat: number;
}

/**
 * Full food details with all servings
 */
export interface FoodDetails {
  /** Unique identifier */
  id: string;
  /** Food name */
  name: string;
  /** Brand name if applicable */
  brandName?: string;
  /** Food description */
  description?: string;
  /** Category ID */
  categoryId: string;
  /** Full category object */
  category?: FoodCategory;
  /** Whether verified by admin */
  isVerified: boolean;
  /** Whether publicly visible */
  isPublic: boolean;
  /** Searchable tags */
  tags: string[];
  /** Barcode for scanning */
  barcode?: string;
  /** Food image URL */
  imageUrl?: string;
  /** Nutrition label image URL */
  nutritionLabelUrl?: string;
  /** All available serving sizes */
  servings: FoodServing[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Paginated food list response
 */
export interface FoodListResponse {
  /** Food items */
  items: FoodSummary[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Whether more pages exist */
  hasMore: boolean;
}

/**
 * Food search query parameters
 */
export interface FoodSearchParams {
  /** Search query */
  q?: string;
  /** Category slug filter */
  category?: string;
  /** Tag filter */
  tag?: string;
  /** Only verified foods */
  verifiedOnly?: boolean;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Nutrition Plan API Types (match backend PlanSummaryDto, PlanResponseDto)

   Re-uses shared types from nutrition-plan.ts where applicable.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  NumericConstraint,
  MealFlowConfig,
  RuleSeverity,
  PlanVisibility,
  PlanDifficulty,
  MealType,
} from './nutrition-plan';

// Re-export MealType for convenience
export type { MealType } from './nutrition-plan';

/**
 * Simplified plan rule for API responses
 * (Backend returns a simplified version of the full NutritionRule)
 */
export interface PlanRule {
  /** Rule identifier */
  id: string;
  /** Rule type */
  type: string;
  /** Display name */
  name: string;
  /** Rule description */
  description?: string;
  /** Severity when violated */
  severity: RuleSeverity;
  /** Whether rule is active */
  enabled: boolean;
}

/**
 * Daily macro targets for API responses
 */
export interface DailyTargets {
  /** Calorie target */
  calories: NumericConstraint;
  /** Protein target (grams) */
  protein: NumericConstraint;
  /** Carbohydrate target (grams) */
  carbs: NumericConstraint;
  /** Fat target (grams) */
  fat: NumericConstraint;
  /** Fiber target (grams) */
  fiber?: NumericConstraint;
}

/**
 * Plan summary for list views (lightweight)
 */
export interface PlanSummary {
  /** Unique identifier */
  id: string;
  /** Plan name */
  name: string;
  /** Short description */
  shortDescription: string;
  /** Visibility level */
  visibility: PlanVisibility;
  /** Difficulty level */
  difficulty: PlanDifficulty;
  /** Searchable tags */
  tags: string[];
  /** Whether premium-only */
  isPremium: boolean;
  /** Icon emoji */
  icon?: string;
  /** Theme color */
  accentColor?: string;
}

/**
 * Full plan details from API
 */
export interface PlanDetails {
  /** Unique identifier */
  id: string;
  /** Plan name */
  name: string;
  /** Short description */
  shortDescription: string;
  /** Long description */
  longDescription?: string;
  /** Visibility level */
  visibility: PlanVisibility;
  /** Difficulty level */
  difficulty: PlanDifficulty;
  /** Searchable tags */
  tags: string[];
  /** Source attribution */
  sourceAttribution?: string;
  /** Schema version */
  version: string;
  /** Whether premium-only */
  isPremium: boolean;
  /** Icon emoji */
  icon?: string;
  /** Theme color */
  accentColor?: string;
  /** Daily macro targets */
  dailyTargets: DailyTargets;
  /** Meal flow configuration */
  mealFlow: MealFlowConfig;
  /** Plan rules */
  rules: PlanRule[];
  /** Use net carbs (carbs - fiber) */
  useNetCarbs: boolean;
  /** Helpful tips */
  tips?: string[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Meal Logging Types (match backend MealLogDto, MealFoodItemDto)

   Note: MealType is imported from nutrition-plan.ts and re-exported above.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Food item within a meal
 */
export interface MealFoodItem {
  /** Item ID */
  id: string;
  /** Reference to food ID (may be null if food was deleted) */
  foodId?: string;
  /** Reference to serving ID */
  servingId?: string;
  /** Food name (snapshot at logging time) */
  foodName: string;
  /** Serving description */
  servingName: string;
  /** Number of servings */
  quantity: number;
  /** Total calories (serving × quantity) */
  calories: number;
  /** Total protein in grams */
  protein: number;
  /** Total carbs in grams */
  carbs: number;
  /** Total fat in grams */
  fat: number;
  /** Total fiber in grams */
  fiber: number;
  /** Is this a custom inline entry */
  isCustomEntry: boolean;
}

/**
 * Full meal log with food items
 */
export interface MealLog {
  /** Meal log ID */
  id: string;
  /** Date of the meal (YYYY-MM-DD) */
  mealDate: string;
  /** Meal type */
  mealType: MealType;
  /** Specific time of the meal (ISO timestamp) */
  mealTime?: string;
  /** Total calories */
  totalCalories: number;
  /** Total protein in grams */
  totalProtein: number;
  /** Total carbs in grams */
  totalCarbs: number;
  /** Total fat in grams */
  totalFat: number;
  /** Total fiber in grams */
  totalFiber: number;
  /** Photo URL (S3) */
  photoUrl?: string;
  /** User rating (1-5) */
  rating?: number;
  /** User notes about the meal */
  notes?: string;
  /** Food items in this meal */
  foodItems: MealFoodItem[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Simplified meal summary for list views
 */
export interface MealSummary {
  /** Meal log ID */
  id: string;
  /** Date of the meal */
  mealDate: string;
  /** Meal type */
  mealType: MealType;
  /** Total calories */
  totalCalories: number;
  /** Total protein in grams */
  totalProtein: number;
  /** Total carbs in grams */
  totalCarbs: number;
  /** Total fat in grams */
  totalFat: number;
  /** Number of food items */
  itemCount: number;
  /** Photo URL thumbnail */
  photoUrl?: string;
  /** User rating */
  rating?: number;
}

/**
 * Daily summary with all meals
 */
export interface DailySummary {
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Total calories for the day */
  totalCalories: number;
  /** Total protein for the day */
  totalProtein: number;
  /** Total carbs for the day */
  totalCarbs: number;
  /** Total fat for the day */
  totalFat: number;
  /** Total fiber for the day */
  totalFiber: number;
  /** Meals logged for the day */
  meals: MealSummary[];
}

/**
 * Meal history response with pagination
 */
export interface MealHistoryResponse {
  /** Meal entries */
  meals: MealSummary[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Has more pages */
  hasMore: boolean;
}

/**
 * Food item creation DTO
 */
export interface CreateMealFoodItem {
  /** Food ID (optional for custom entries) */
  foodId?: string;
  /** Serving ID (optional for custom entries) */
  servingId?: string;
  /** Food name */
  foodName: string;
  /** Serving description */
  servingName: string;
  /** Number of servings */
  quantity: number;
  /** Calories per serving */
  calories: number;
  /** Protein per serving in grams */
  protein: number;
  /** Carbs per serving in grams */
  carbs: number;
  /** Fat per serving in grams */
  fat: number;
  /** Fiber per serving in grams */
  fiber?: number;
  /** Is this a custom inline entry */
  isCustomEntry?: boolean;
}

/**
 * Create meal DTO
 */
export interface CreateMealDto {
  /** Date of the meal (YYYY-MM-DD), defaults to today */
  mealDate?: string;
  /** Meal type */
  mealType: MealType;
  /** Specific time of the meal (HH:mm format) */
  mealTime?: string;
  /** Food items in this meal */
  foodItems: CreateMealFoodItem[];
  /** Photo URL */
  photoUrl?: string;
  /** User rating (1-5) */
  rating?: number;
  /** User notes */
  notes?: string;
}

/**
 * Quick log meal DTO
 */
export interface QuickLogMealDto {
  /** Date of the meal (YYYY-MM-DD), defaults to today */
  mealDate?: string;
  /** Meal type */
  mealType: MealType;
  /** Food ID from database */
  foodId: string;
  /** Serving ID to use */
  servingId: string;
  /** Number of servings (default 1) */
  quantity?: number;
}

/**
 * Update meal metadata DTO
 */
export interface UpdateMealMetadataDto {
  /** Photo URL */
  photoUrl?: string;
  /** User rating (1-5) */
  rating?: number;
  /** User notes */
  notes?: string;
}

/**
 * Meal query parameters
 */
export interface MealQueryParams {
  /** Filter by date (YYYY-MM-DD) */
  date?: string;
  /** Filter by date range start */
  startDate?: string;
  /** Filter by date range end */
  endDate?: string;
  /** Filter by meal type */
  mealType?: MealType;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
}
