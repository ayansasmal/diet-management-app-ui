/**
 * Nutrition Plan Rule Evaluation Engine
 *
 * Pure functions that evaluate meals against nutrition plans.
 * No side effects - all state is passed in and results are returned.
 *
 * @module RuleEngine
 * @version 1.0.0
 */

import type {
  NutritionPlan,
  NutritionRule,
  MacroTargets,
  NumericConstraint,
  RuleEvaluationResult,
  MealEvaluationResult,
  EvaluationStatus,
  RuleSeverity,
} from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Types for Meal Data
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Nutritional data for a single meal/food item
 */
export interface MealNutrition {
  /** Meal/food identifier */
  id: string;
  /** Display name */
  name: string;
  /** Calories (kcal) */
  calories: number;
  /** Protein (grams) */
  protein: number;
  /** Total carbohydrates (grams) */
  carbs: number;
  /** Dietary fiber (grams) */
  fiber: number;
  /** Fat (grams) */
  fat: number;
  /** Sugar (grams) - optional */
  sugar?: number;
  /** Sodium (mg) - optional */
  sodium?: number;
  /** Glycemic index - optional */
  glycemicIndex?: number;
  /** Glycemic load - optional */
  glycemicLoad?: number;
  /** NOVA classification (1-4) - optional */
  novaClass?: 1 | 2 | 3 | 4;
  /** Food categories for filtering */
  categories?: string[];
}

/**
 * Current state of macro consumption for the day
 */
export interface MacroBudget {
  /** Calories consumed so far */
  caloriesConsumed: number;
  /** Protein consumed (grams) */
  proteinConsumed: number;
  /** Carbs consumed (grams) */
  carbsConsumed: number;
  /** Fiber consumed (grams) */
  fiberConsumed: number;
  /** Fat consumed (grams) */
  fatConsumed: number;
  /** Sugar consumed (grams) */
  sugarConsumed: number;
  /** Sodium consumed (mg) */
  sodiumConsumed: number;
  /** Number of meals consumed today */
  mealsConsumed: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Create an empty macro budget
 */
export function createEmptyBudget(): MacroBudget {
  return {
    caloriesConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fiberConsumed: 0,
    fatConsumed: 0,
    sugarConsumed: 0,
    sodiumConsumed: 0,
    mealsConsumed: 0,
  };
}

/**
 * Add a meal's nutrition to the budget
 */
export function addMealToBudget(budget: MacroBudget, meal: MealNutrition): MacroBudget {
  return {
    caloriesConsumed: budget.caloriesConsumed + meal.calories,
    proteinConsumed: budget.proteinConsumed + meal.protein,
    carbsConsumed: budget.carbsConsumed + meal.carbs,
    fiberConsumed: budget.fiberConsumed + meal.fiber,
    fatConsumed: budget.fatConsumed + meal.fat,
    sugarConsumed: budget.sugarConsumed + (meal.sugar ?? 0),
    sodiumConsumed: budget.sodiumConsumed + (meal.sodium ?? 0),
    mealsConsumed: budget.mealsConsumed + 1,
  };
}

/**
 * Calculate remaining macro targets from budget
 */
export function calculateRemainingBudget(
  targets: MacroTargets,
  consumed: MacroBudget,
  useNetCarbs: boolean = false
): MacroTargets {
  const getRemaining = (constraint: NumericConstraint | undefined, consumed: number): NumericConstraint => {
    if (!constraint) return {};

    const result: NumericConstraint = {};
    if (constraint.target !== undefined) {
      result.target = Math.max(0, constraint.target - consumed);
    }
    if (constraint.min !== undefined) {
      result.min = Math.max(0, constraint.min - consumed);
    }
    if (constraint.max !== undefined) {
      result.max = Math.max(0, constraint.max - consumed);
    }
    return result;
  };

  // For net carbs, subtract fiber from carbs consumed
  const effectiveCarbsConsumed = useNetCarbs
    ? Math.max(0, consumed.carbsConsumed - consumed.fiberConsumed)
    : consumed.carbsConsumed;

  return {
    calories: getRemaining(targets.calories, consumed.caloriesConsumed),
    protein: getRemaining(targets.protein, consumed.proteinConsumed),
    carbs: getRemaining(targets.carbs, effectiveCarbsConsumed),
    fat: getRemaining(targets.fat, consumed.fatConsumed),
    fiber: getRemaining(targets.fiber, consumed.fiberConsumed),
    sugar: getRemaining(targets.sugar, consumed.sugarConsumed),
    sodium: getRemaining(targets.sodium, consumed.sodiumConsumed),
  };
}

/**
 * Check if a value satisfies a numeric constraint
 */
export function checkConstraint(
  value: number,
  constraint: NumericConstraint | undefined
): { satisfied: boolean; reason?: string } {
  if (!constraint) return { satisfied: true };

  if (constraint.min !== undefined && value < constraint.min) {
    return {
      satisfied: false,
      reason: `Below minimum (${value} < ${constraint.min})`,
    };
  }

  if (constraint.max !== undefined && value > constraint.max) {
    return {
      satisfied: false,
      reason: `Exceeds maximum (${value} > ${constraint.max})`,
    };
  }

  return { satisfied: true };
}

/**
 * Determine the worst status from multiple results
 */
function worstStatus(statuses: EvaluationStatus[]): EvaluationStatus {
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('warning')) return 'warning';
  return 'pass';
}

/**
 * Map severity to evaluation status
 */
function severityToStatus(severity: RuleSeverity, violated: boolean): EvaluationStatus {
  if (!violated) return 'pass';
  switch (severity) {
    case 'error':
      return 'fail';
    case 'warning':
      return 'warning';
    case 'info':
      return 'pass'; // Info-level violations don't fail
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Individual Rule Evaluators
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Evaluate: Protein per meal minimum
 */
function evaluateProteinPerMeal(
  rule: Extract<NutritionRule, { type: 'proteinPerMealMinimum' }>,
  meal: MealNutrition
): RuleEvaluationResult {
  const violated = meal.protein < rule.minGrams;

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    status: severityToStatus(rule.severity, violated),
    severity: rule.severity,
    reason: violated
      ? `Only ${meal.protein}g protein - aim for ${rule.minGrams}g+ per meal`
      : `Good protein: ${meal.protein}g (target: ${rule.minGrams}g+)`,
    details: violated
      ? { actual: meal.protein, expected: { min: rule.minGrams }, unit: 'g protein' }
      : undefined,
  };
}

/**
 * Evaluate: Limit ultra-processed foods (NOVA class 4)
 */
function evaluateLimitProcessed(
  rule: Extract<NutritionRule, { type: 'limitUltraProcessed' }>,
  meal: MealNutrition,
  budget: MacroBudget,
  targets: MacroTargets
): RuleEvaluationResult {
  // If meal isn't classified, pass
  if (meal.novaClass === undefined) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: rule.severity,
      reason: 'Food classification unavailable',
    };
  }

  const isUltraProcessed = meal.novaClass === 4;
  if (!isUltraProcessed) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: rule.severity,
      reason: 'Whole or minimally processed food',
    };
  }

  // Calculate what percentage this would be
  const targetCalories = targets.calories.target ?? targets.calories.max ?? 2000;
  const currentPercentage = (budget.caloriesConsumed / targetCalories) * 100;
  const mealPercentage = (meal.calories / targetCalories) * 100;
  const wouldExceed = (currentPercentage + mealPercentage) > rule.maxPercentage;

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    status: severityToStatus(rule.severity, wouldExceed),
    severity: rule.severity,
    reason: wouldExceed
      ? `Ultra-processed food would exceed ${rule.maxPercentage}% limit`
      : `Ultra-processed food - within ${rule.maxPercentage}% limit`,
    details: wouldExceed
      ? { actual: currentPercentage + mealPercentage, expected: { max: rule.maxPercentage }, unit: '% of calories' }
      : undefined,
  };
}

/**
 * Evaluate: Food category restriction
 */
function evaluateFoodCategory(
  rule: Extract<NutritionRule, { type: 'foodCategoryRestriction' }>,
  meal: MealNutrition
): RuleEvaluationResult {
  const mealCategories = meal.categories ?? [];
  const restrictedFound = rule.restrictedCategories.filter((cat) =>
    mealCategories.some((mc) => mc.toLowerCase() === cat.toLowerCase())
  );

  if (restrictedFound.length === 0) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: rule.severity,
      reason: 'No restricted categories',
    };
  }

  const violated = rule.action === 'block';
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    status: violated ? 'fail' : 'warning',
    severity: rule.severity,
    reason: `Contains restricted: ${restrictedFound.join(', ')}`,
  };
}

/**
 * Evaluate: Macro ratio constraint
 */
function evaluateMacroRatio(
  rule: Extract<NutritionRule, { type: 'macroRatio' }>,
  meal: MealNutrition,
  budget: MacroBudget
): RuleEvaluationResult {
  // Calculate calories from the macro
  const macroCalories = {
    protein: (budget.proteinConsumed + meal.protein) * 4,
    carbs: (budget.carbsConsumed + meal.carbs) * 4,
    fat: (budget.fatConsumed + meal.fat) * 9,
  };

  const totalCalories = budget.caloriesConsumed + meal.calories;
  if (totalCalories === 0) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: rule.severity,
      reason: 'No calories consumed yet',
    };
  }

  const actualPercentage = (macroCalories[rule.macro] / totalCalories) * 100;
  const check = checkConstraint(actualPercentage, rule.percentage);

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    status: severityToStatus(rule.severity, !check.satisfied),
    severity: rule.severity,
    reason: check.satisfied
      ? `${rule.macro} at ${actualPercentage.toFixed(0)}% of calories`
      : `${rule.macro} at ${actualPercentage.toFixed(0)}% - ${check.reason}`,
    details: !check.satisfied
      ? { actual: actualPercentage, expected: rule.percentage, unit: '% of calories' }
      : undefined,
  };
}

/**
 * Evaluate: Glycemic control
 */
function evaluateGlycemic(
  rule: Extract<NutritionRule, { type: 'glycemicControl' }>,
  meal: MealNutrition
): RuleEvaluationResult {
  const violations: string[] = [];

  if (rule.maxGI !== undefined && meal.glycemicIndex !== undefined) {
    if (meal.glycemicIndex > rule.maxGI) {
      violations.push(`GI ${meal.glycemicIndex} > ${rule.maxGI}`);
    }
  }

  if (rule.maxGL !== undefined && meal.glycemicLoad !== undefined) {
    if (meal.glycemicLoad > rule.maxGL) {
      violations.push(`GL ${meal.glycemicLoad} > ${rule.maxGL}`);
    }
  }

  if (violations.length === 0) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: rule.severity,
      reason: meal.glycemicIndex !== undefined
        ? `GI: ${meal.glycemicIndex}, GL: ${meal.glycemicLoad ?? 'N/A'}`
        : 'Glycemic data unavailable',
    };
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    status: severityToStatus(rule.severity, true),
    severity: rule.severity,
    reason: `High glycemic impact: ${violations.join(', ')}`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Evaluation Functions
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Evaluate a single rule against a meal
 */
export function evaluateRule(
  rule: NutritionRule,
  meal: MealNutrition,
  budget: MacroBudget,
  targets: MacroTargets
): RuleEvaluationResult {
  // Skip disabled rules
  if (!rule.enabled) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'pass',
      severity: 'info',
      reason: 'Rule disabled',
    };
  }

  switch (rule.type) {
    case 'preferNetCarbs':
      // This rule doesn't evaluate meals - it's a calculation modifier
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'pass',
        severity: 'info',
        reason: 'Net carbs calculation enabled',
      };

    case 'proteinPerMealMinimum':
      return evaluateProteinPerMeal(rule, meal);

    case 'limitUltraProcessed':
      return evaluateLimitProcessed(rule, meal, budget, targets);

    case 'foodCategoryRestriction':
      return evaluateFoodCategory(rule, meal);

    case 'macroRatio':
      return evaluateMacroRatio(rule, meal, budget);

    case 'glycemicControl':
      return evaluateGlycemic(rule, meal);

    case 'mealTiming':
      // Meal timing would need current time - handled separately
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'pass',
        severity: 'info',
        reason: 'Timing rule - evaluated at meal time',
      };

    default:
      // Exhaustiveness check
      const _exhaustive: never = rule;
      return {
        ruleId: (rule as NutritionRule).id,
        ruleName: (rule as NutritionRule).name,
        status: 'pass',
        severity: 'info',
        reason: 'Unknown rule type',
      };
  }
}

/**
 * Evaluate daily macro constraints for a meal
 */
export function evaluateDailyMacros(
  meal: MealNutrition,
  budget: MacroBudget,
  targets: MacroTargets,
  useNetCarbs: boolean
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // Calculate what totals would be after this meal
  const projectedBudget = addMealToBudget(budget, meal);

  // Net carbs adjustment
  const effectiveCarbs = useNetCarbs
    ? Math.max(0, projectedBudget.carbsConsumed - projectedBudget.fiberConsumed)
    : projectedBudget.carbsConsumed;

  // Check each macro target
  const macroChecks = [
    { name: 'Calories', value: projectedBudget.caloriesConsumed, constraint: targets.calories, unit: 'kcal' },
    { name: 'Protein', value: projectedBudget.proteinConsumed, constraint: targets.protein, unit: 'g' },
    { name: 'Carbs', value: effectiveCarbs, constraint: targets.carbs, unit: 'g' },
    { name: 'Fat', value: projectedBudget.fatConsumed, constraint: targets.fat, unit: 'g' },
    { name: 'Fiber', value: projectedBudget.fiberConsumed, constraint: targets.fiber, unit: 'g' },
    { name: 'Sugar', value: projectedBudget.sugarConsumed, constraint: targets.sugar, unit: 'g' },
    { name: 'Sodium', value: projectedBudget.sodiumConsumed, constraint: targets.sodium, unit: 'mg' },
  ];

  for (const check of macroChecks) {
    if (!check.constraint) continue;

    const result = checkConstraint(check.value, check.constraint);

    if (!result.satisfied) {
      results.push({
        ruleId: `daily_${check.name.toLowerCase()}`,
        ruleName: `Daily ${check.name}`,
        status: 'warning', // Exceeding daily limits is a warning, not a block
        severity: 'warning',
        reason: `${check.name}: ${check.value}${check.unit} - ${result.reason}`,
        details: {
          actual: check.value,
          expected: check.constraint,
          unit: check.unit,
        },
      });
    }
  }

  return results;
}

/**
 * Evaluate a meal against a complete nutrition plan
 *
 * This is the main entry point for meal evaluation.
 *
 * @param plan - The nutrition plan to evaluate against
 * @param meal - The meal being evaluated
 * @param currentBudget - Current macro consumption for the day
 * @returns Evaluation result with status, reasons, and remaining budget
 */
export function evaluateMeal(
  plan: NutritionPlan,
  meal: MealNutrition,
  currentBudget: MacroBudget
): MealEvaluationResult {
  const allResults: RuleEvaluationResult[] = [];

  // 1. Evaluate daily macro constraints
  const macroResults = evaluateDailyMacros(
    meal,
    currentBudget,
    plan.dailyTargets,
    plan.useNetCarbs
  );
  allResults.push(...macroResults);

  // 2. Evaluate each rule
  for (const rule of plan.rules) {
    const result = evaluateRule(rule, meal, currentBudget, plan.dailyTargets);
    allResults.push(result);
  }

  // 3. Calculate remaining budget after this meal
  const projectedBudget = addMealToBudget(currentBudget, meal);
  const remainingBudget = calculateRemainingBudget(
    plan.dailyTargets,
    projectedBudget,
    plan.useNetCarbs
  );

  // 4. Determine overall status
  const statuses = allResults.map((r) => r.status);
  const overallStatus = worstStatus(statuses);

  // 5. Generate summary reason
  const failedRules = allResults.filter((r) => r.status === 'fail');
  const warningRules = allResults.filter((r) => r.status === 'warning');

  let summaryReason: string | undefined;
  if (failedRules.length > 0) {
    summaryReason = failedRules.map((r) => r.reason).join('; ');
  } else if (warningRules.length > 0) {
    summaryReason = warningRules.map((r) => r.reason).join('; ');
  }

  return {
    status: overallStatus,
    rules: allResults,
    remainingBudget,
    summaryReason,
  };
}

/**
 * Filter available meals based on plan constraints
 *
 * Returns meals grouped by their evaluation status.
 *
 * @param plan - The nutrition plan to evaluate against
 * @param availableMeals - All meals to consider
 * @param currentBudget - Current macro consumption for the day
 * @returns Meals grouped by pass/warning/fail
 */
export function filterAvailableMeals(
  plan: NutritionPlan,
  availableMeals: MealNutrition[],
  currentBudget: MacroBudget
): {
  allowed: Array<{ meal: MealNutrition; result: MealEvaluationResult }>;
  warnings: Array<{ meal: MealNutrition; result: MealEvaluationResult }>;
  blocked: Array<{ meal: MealNutrition; result: MealEvaluationResult }>;
} {
  const allowed: Array<{ meal: MealNutrition; result: MealEvaluationResult }> = [];
  const warnings: Array<{ meal: MealNutrition; result: MealEvaluationResult }> = [];
  const blocked: Array<{ meal: MealNutrition; result: MealEvaluationResult }> = [];

  for (const meal of availableMeals) {
    const result = evaluateMeal(plan, meal, currentBudget);

    switch (result.status) {
      case 'pass':
        allowed.push({ meal, result });
        break;
      case 'warning':
        warnings.push({ meal, result });
        break;
      case 'fail':
        blocked.push({ meal, result });
        break;
    }
  }

  return { allowed, warnings, blocked };
}

/**
 * Calculate what percentage of daily targets have been consumed
 */
export function calculateProgress(
  budget: MacroBudget,
  targets: MacroTargets,
  useNetCarbs: boolean
): Record<string, { consumed: number; target: number; percentage: number }> {
  const getProgress = (consumed: number, constraint: NumericConstraint | undefined) => {
    const target = constraint?.target ?? constraint?.max ?? constraint?.min ?? 0;
    return {
      consumed,
      target,
      percentage: target > 0 ? Math.round((consumed / target) * 100) : 0,
    };
  };

  const effectiveCarbs = useNetCarbs
    ? Math.max(0, budget.carbsConsumed - budget.fiberConsumed)
    : budget.carbsConsumed;

  return {
    calories: getProgress(budget.caloriesConsumed, targets.calories),
    protein: getProgress(budget.proteinConsumed, targets.protein),
    carbs: getProgress(effectiveCarbs, targets.carbs),
    fat: getProgress(budget.fatConsumed, targets.fat),
    fiber: getProgress(budget.fiberConsumed, targets.fiber),
  };
}
