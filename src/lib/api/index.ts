/**
 * API barrel file
 */

// Client
export { apiClient, ApiRequestError, get, post, put, patch, del } from './client';

// Auth
export { googleAuth, getCurrentUser, logout, isAuthenticated } from './auth';

// Users
export {
  getProfile,
  createProfile,
  updateProfile,
  getHealthMetrics,
  calculateBmr,
} from './users';

// Tracking
export {
  getWeightHistory,
  getTodayWeight,
  logWeight,
  deleteWeight,
  getGlucoseHistory,
  getTodayGlucose,
  logGlucose,
  deleteGlucose,
  getDailySummary,
} from './tracking';

// Plans
export { listPlans, getPlanById } from './plans';

// Foods
export { getCategories, searchFoods, getFoodById } from './foods';

// Meals
export {
  createMeal,
  quickLogMeal,
  getMealHistory,
  getTodaysMeals,
  getMealDailySummary,
  getMealById,
  updateMeal,
  updateMealMetadata,
  addFoodItemToMeal,
  removeFoodItemFromMeal,
  deleteMeal,
} from './meals';
