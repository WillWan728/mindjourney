import React from 'react';
import { useAchievement } from '../../utils/achievementUtils';


const MealForm = ({ mealForm, setMealForm, handleMealSubmit, loading }) => {
  const { logNutritionData, getAchievementProgress, fetchUserData } = useAchievement();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      // First, submit the meal data
      await handleMealSubmit(event);

      // Then, log the nutrition data
      try {
        console.log("Logging nutrition data");
        const result = await logNutritionData(mealForm);
        console.log('logNutritionData result:', result);

        if (result.success) {
          // Fetch updated user data to ensure we have the latest progress
          await fetchUserData();
          
          // Now get the updated progress
          const updatedProgress = getAchievementProgress('food');
          console.log('Updated achievement progress:', updatedProgress);

          if (updatedProgress >= 7) {
            alert(`Congratulations! You've logged your meals for 7 days in a row and earned 15 points for completing the Nutrition Master achievement!`);
          } else {
            alert(`Meal logged successfully!`);
          }
        } else {
          console.error('Failed to log nutrition:', result.message);
          alert(`Meal logged successfully, but there was an issue updating your achievement progress. Please try again later. Error: ${result.message}`);
        }
      } catch (nutritionError) {
        console.error('Error logging nutrition:', nutritionError);
        alert(`Meal logged successfully! However, there was an error updating your achievement progress. Your meal has been recorded, but the achievement may not have updated correctly. Error: ${nutritionError.message}`);
      }
    } catch (error) {
      console.error('Error submitting meal:', error);
      alert(`An error occurred while submitting the meal: ${error.message}. Please try again.`);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.split('-')[1];
  
    setMealForm((prevForm) => ({
      ...prevForm,
      [field]: ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'].includes(field)
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  return (
    <div className="meal-log">
      <h2>Log Meal</h2>
      <form onSubmit={onSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="meal-date">Date</label>
          <input 
            id="meal-date"
            type="date" 
            value={mealForm.date} 
            onChange={handleInputChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-name">Meal Name</label>
          <input 
            id="meal-name"
            type="text" 
            value={mealForm.name} 
            onChange={handleInputChange}
            placeholder="e.g., Breakfast, Lunch, Dinner, Snack" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-description">Description</label>
          <textarea 
            id="meal-description"
            value={mealForm.description} 
            onChange={handleInputChange}
            placeholder="Brief description of the meal" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-calories">Calories</label>
          <input 
            id="meal-calories"
            type="number" 
            value={mealForm.calories} 
            onChange={handleInputChange}
            placeholder="Total calories" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-protein">Protein (g)</label>
          <input 
            id="meal-protein"
            type="number" 
            value={mealForm.protein} 
            onChange={handleInputChange}
            placeholder="Protein in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-carbs">Carbohydrates (g)</label>
          <input 
            id="meal-carbs"
            type="number" 
            value={mealForm.carbs} 
            onChange={handleInputChange}
            placeholder="Carbohydrates in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-fat">Fat (g)</label>
          <input 
            id="meal-fat"
            type="number" 
            value={mealForm.fat} 
            onChange={handleInputChange}
            placeholder="Fat in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-fiber">Fiber (g)</label>
          <input 
            id="meal-fiber"
            type="number" 
            value={mealForm.fiber} 
            onChange={handleInputChange}
            placeholder="Fiber in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-sugar">Sugar (g)</label>
          <input 
            id="meal-sugar"
            type="number" 
            value={mealForm.sugar} 
            onChange={handleInputChange}
            placeholder="Sugar in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-notes">Notes (optional)</label>
          <textarea 
            id="meal-notes"
            value={mealForm.notes} 
            onChange={handleInputChange}
            placeholder="Any additional notes" 
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Meal'}
        </button>
      </form>
    </div>
  );
};

export default MealForm;