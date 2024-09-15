import React from 'react';

const MealForm = ({ mealForm, setMealForm, handleMealSubmit, loading }) => {
  return (
    <div className="meal-log">
      <h2>Log Meal</h2>
      <form onSubmit={handleMealSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="meal-date">Date</label>
          <input 
            id="meal-date"
            type="date" 
            value={mealForm.date} 
            onChange={(e) => setMealForm({...mealForm, date: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-name">Meal Name</label>
          <input 
            id="meal-name"
            type="text" 
            value={mealForm.name} 
            onChange={(e) => setMealForm({...mealForm, name: e.target.value})} 
            placeholder="e.g., Breakfast, Lunch, Dinner, Snack" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-description">Description</label>
          <textarea 
            id="meal-description"
            value={mealForm.description} 
            onChange={(e) => setMealForm({...mealForm, description: e.target.value})} 
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
            onChange={(e) => setMealForm({...mealForm, calories: e.target.value})} 
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
            onChange={(e) => setMealForm({...mealForm, protein: e.target.value})} 
            placeholder="Protein in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-carbs">Carbohydrates (g)</label>
          <input 
            id="meal-carbs"
            type="number" 
            value={mealForm.carbs} 
            onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})} 
            placeholder="Carbohydrates in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-fat">Fat (g)</label>
          <input 
            id="meal-fat"
            type="number" 
            value={mealForm.fat} 
            onChange={(e) => setMealForm({...mealForm, fat: e.target.value})} 
            placeholder="Fat in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-fiber">Fiber (g)</label>
          <input 
            id="meal-fiber"
            type="number" 
            value={mealForm.fiber} 
            onChange={(e) => setMealForm({...mealForm, fiber: e.target.value})} 
            placeholder="Fiber in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-sugar">Sugar (g)</label>
          <input 
            id="meal-sugar"
            type="number" 
            value={mealForm.sugar} 
            onChange={(e) => setMealForm({...mealForm, sugar: e.target.value})} 
            placeholder="Sugar in grams" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal-notes">Notes (optional)</label>
          <textarea 
            id="meal-notes"
            value={mealForm.notes} 
            onChange={(e) => setMealForm({...mealForm, notes: e.target.value})} 
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