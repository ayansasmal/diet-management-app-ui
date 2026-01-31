/**
 * Nutrition Plan Schema v1
 *
 * Defines the core types for a plan-agnostic, rule-driven nutrition engine.
 * Plans are stored in the database and evaluated at runtime against meal selections.
 *
 * @module NutritionPlan
 * @version 1.0.0
 */

/* ═══════════════════════════════════════════════════════════════════════════
   Macro & Nutrient Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A numeric constraint that can be:
 * - Exact value
 * - Minimum only
 * - Maximum only
 * - Range (min and max)
 */
export interface NumericConstraint {
  /** Exact target value (use when min/max not needed) */
  target?: number;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
}

/**
 * Core macronutrient targets for a nutrition plan.
 * All values are in grams unless otherwise specified.
 */
export interface MacroTargets {
  /** Daily calorie target (kcal) */
  calories: NumericConstraint;
  /** Protein target (grams) */
  protein: NumericConstraint;
  /** Carbohydrate target (grams) */
  carbs: NumericConstraint;
  /** Fat target (grams) */
  fat: NumericConstraint;
  /** Fiber target (grams) - optional */
  fiber?: NumericConstraint;
  /** Sugar limit (grams) - optional */
  sugar?: NumericConstraint;
  /** Sodium limit (mg) - optional */
  sodium?: NumericConstraint;
}

/**
 * Per-meal macro constraints.
 * Used to ensure balanced distribution across meals.
 */
export interface MealMacroConstraints {
  /** Calories per meal */
  calories?: NumericConstraint;
  /** Protein per meal (e.g., min 30g per meal for muscle synthesis) */
  protein?: NumericConstraint;
  /** Carbs per meal */
  carbs?: NumericConstraint;
  /** Fat per meal */
  fat?: NumericConstraint;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Meal Flow Configuration
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Meal type identifiers
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Meal slot configuration for the daily flow
 */
export interface MealSlot {
  /** Unique identifier for this slot */
  id: string;
  /** Type of meal */
  type: MealType;
  /** Display name (e.g., "Morning Snack") */
  name: string;
  /** Order in the day (1 = first meal) */
  order: number;
  /** Whether this meal is required or optional */
  required: boolean;
  /** Suggested time window (24h format) */
  suggestedTime?: {
    start: string; // "07:00"
    end: string;   // "09:00"
  };
  /** Per-meal macro constraints */
  constraints?: MealMacroConstraints;
}

/**
 * Configuration for daily meal structure
 */
export interface MealFlowConfig {
  /** Ordered list of meal slots for the day */
  slots: MealSlot[];
  /** Whether users can skip required meals */
  allowSkipping: boolean;
  /** Whether users can reorder meals */
  allowReordering: boolean;
  /** Minimum time between meals (minutes) */
  minTimeBetweenMeals?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Rule System
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Rule severity determines UI treatment
 */
export type RuleSeverity = 'info' | 'warning' | 'error';

/**
 * Base interface for all rules
 */
interface BaseRule {
  /** Unique rule identifier */
  id: string;
  /** Human-readable rule name */
  name: string;
  /** Detailed description for UI tooltips */
  description: string;
  /** Severity when rule is violated */
  severity: RuleSeverity;
  /** Whether rule is enabled */
  enabled: boolean;
}

/**
 * Rule: Prefer net carbs over total carbs
 * Net carbs = Total carbs - Fiber
 */
export interface NetCarbsRule extends BaseRule {
  type: 'preferNetCarbs';
}

/**
 * Rule: Minimum protein per meal
 * Ensures protein distribution for muscle protein synthesis
 */
export interface ProteinPerMealRule extends BaseRule {
  type: 'proteinPerMealMinimum';
  /** Minimum grams of protein per meal */
  minGrams: number;
}

/**
 * Rule: Limit ultra-processed foods
 * Based on NOVA classification
 */
export interface LimitProcessedRule extends BaseRule {
  type: 'limitUltraProcessed';
  /** Maximum percentage of daily calories from ultra-processed */
  maxPercentage: number;
}

/**
 * Rule: Meal timing constraint
 * E.g., "Don't eat carbs after 6pm"
 */
export interface MealTimingRule extends BaseRule {
  type: 'mealTiming';
  /** Macro to constrain */
  macro: 'carbs' | 'fat' | 'protein' | 'calories';
  /** Constraint to apply */
  constraint: NumericConstraint;
  /** Time window (24h format) */
  afterTime?: string;
  beforeTime?: string;
}

/**
 * Rule: Food category restriction
 * E.g., "No grains", "No dairy"
 */
export interface FoodCategoryRule extends BaseRule {
  type: 'foodCategoryRestriction';
  /** Categories to restrict */
  restrictedCategories: string[];
  /** Whether to completely block or just warn */
  action: 'block' | 'warn';
}

/**
 * Rule: Macro ratio constraint
 * E.g., "Protein must be 30% of calories"
 */
export interface MacroRatioRule extends BaseRule {
  type: 'macroRatio';
  /** Macro to constrain */
  macro: 'carbs' | 'fat' | 'protein';
  /** Percentage of total calories */
  percentage: NumericConstraint;
}

/**
 * Rule: Glycemic index/load constraint
 */
export interface GlycemicRule extends BaseRule {
  type: 'glycemicControl';
  /** Max glycemic index per meal */
  maxGI?: number;
  /** Max glycemic load per meal */
  maxGL?: number;
}

/**
 * Union of all rule types
 * Discriminated by the 'type' field
 */
export type NutritionRule =
  | NetCarbsRule
  | ProteinPerMealRule
  | LimitProcessedRule
  | MealTimingRule
  | FoodCategoryRule
  | MacroRatioRule
  | GlycemicRule;

/* ═══════════════════════════════════════════════════════════════════════════
   Rule Evaluation Results
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Status of a rule evaluation
 */
export type EvaluationStatus = 'pass' | 'warning' | 'fail';

/**
 * Result of evaluating a single rule against a meal selection
 */
export interface RuleEvaluationResult {
  /** The rule that was evaluated */
  ruleId: string;
  /** Rule name for display */
  ruleName: string;
  /** Pass, warning, or fail */
  status: EvaluationStatus;
  /** Human-readable explanation */
  reason: string;
  /** Severity from the rule definition */
  severity: RuleSeverity;
  /** Specific values that caused the result */
  details?: {
    actual: number;
    expected: number | NumericConstraint;
    unit: string;
  };
}

/**
 * Aggregated evaluation result for a meal
 */
export interface MealEvaluationResult {
  /** Overall status (worst of all rules) */
  status: EvaluationStatus;
  /** Individual rule results */
  rules: RuleEvaluationResult[];
  /** Remaining macro budget after this meal */
  remainingBudget: MacroTargets;
  /** Summary reason for UI display */
  summaryReason?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Nutrition Plan Definition
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Plan visibility/ownership
 */
export type PlanVisibility = 'system' | 'public' | 'private';

/**
 * Plan difficulty level for filtering
 */
export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Plan metadata for discovery and display
 */
export interface PlanMetadata {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description (1-2 sentences) */
  shortDescription: string;
  /** Detailed description (markdown supported) */
  longDescription?: string;
  /** Plan visibility */
  visibility: PlanVisibility;
  /** Creator ID (null for system plans) */
  createdBy: string | null;
  /** Difficulty level */
  difficulty: PlanDifficulty;
  /** Tags for filtering */
  tags: string[];
  /** Source attribution (e.g., "Based on low-carb research") */
  sourceAttribution?: string;
  /** Version for tracking changes */
  version: string;
  /** Whether this plan is premium/paid */
  isPremium: boolean;
  /** Icon/emoji for display */
  icon?: string;
  /** Color theme for UI */
  accentColor?: string;
}

/**
 * Complete Nutrition Plan definition
 *
 * This is the main type that defines an entire diet plan.
 * It combines metadata, macro targets, meal flow, and rules.
 */
export interface NutritionPlan extends PlanMetadata {
  /** Daily macro targets */
  dailyTargets: MacroTargets;
  /** Meal structure configuration */
  mealFlow: MealFlowConfig;
  /** Rules to evaluate */
  rules: NutritionRule[];
  /** Whether to use net carbs for carb calculations */
  useNetCarbs: boolean;
  /** Default serving size multiplier */
  defaultServingMultiplier: number;
  /** Plan-specific tips or guidelines */
  tips?: string[];
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   User Plan Assignment
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * User's active plan assignment with customizations
 */
export interface UserPlanAssignment {
  /** User ID */
  userId: string;
  /** Base plan ID */
  planId: string;
  /** User's customized macro targets (overrides plan defaults) */
  customTargets?: Partial<MacroTargets>;
  /** User's disabled rules */
  disabledRules?: string[];
  /** When the user started this plan */
  startedAt: string;
  /** Goal date (optional) */
  targetDate?: string;
  /** User's notes about their plan */
  notes?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Example Plan (for documentation)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Example: Low Carb Plan
 *
 * @example
 * ```typescript
 * const lowCarbPlan: NutritionPlan = {
 *   id: 'low_carb_standard',
 *   name: 'Low Carb',
 *   shortDescription: 'A science-backed low-carb approach for blood sugar management',
 *   visibility: 'system',
 *   createdBy: null,
 *   difficulty: 'intermediate',
 *   tags: ['low-carb', 'diabetes-friendly', 'weight-loss'],
 *   sourceAttribution: 'Based on evidence-based low-carbohydrate diet research',
 *   version: '1.0.0',
 *   isPremium: false,
 *   icon: '🥗',
 *   accentColor: '#10B981',
 *   dailyTargets: {
 *     calories: { target: 1800, min: 1600, max: 2000 },
 *     protein: { min: 120 },
 *     carbs: { max: 80 },
 *     fat: { min: 60, max: 90 },
 *     fiber: { min: 25 },
 *   },
 *   mealFlow: {
 *     slots: [
 *       { id: 'breakfast', type: 'breakfast', name: 'Breakfast', order: 1, required: true },
 *       { id: 'lunch', type: 'lunch', name: 'Lunch', order: 2, required: true },
 *       { id: 'dinner', type: 'dinner', name: 'Dinner', order: 3, required: true },
 *     ],
 *     allowSkipping: false,
 *     allowReordering: false,
 *   },
 *   rules: [
 *     {
 *       id: 'net_carbs',
 *       type: 'preferNetCarbs',
 *       name: 'Use Net Carbs',
 *       description: 'Fiber is subtracted from total carbs',
 *       severity: 'info',
 *       enabled: true,
 *     },
 *     {
 *       id: 'protein_per_meal',
 *       type: 'proteinPerMealMinimum',
 *       name: 'Protein Distribution',
 *       description: 'Minimum 30g protein per meal for optimal muscle synthesis',
 *       severity: 'warning',
 *       enabled: true,
 *       minGrams: 30,
 *     },
 *   ],
 *   useNetCarbs: true,
 *   defaultServingMultiplier: 1,
 *   tips: [
 *     'Focus on whole foods: vegetables, lean proteins, healthy fats',
 *     'Limit processed foods and added sugars',
 *     'Stay hydrated - aim for 2L water daily',
 *   ],
 *   createdAt: '2026-01-24T00:00:00Z',
 *   updatedAt: '2026-01-24T00:00:00Z',
 * };
 * ```
 */
export type ExamplePlanDocumentation = never;
