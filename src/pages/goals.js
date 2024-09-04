import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { addGoal, updateGoal, deleteGoal, getUserGoals } from '../backend/goals';
import Navbar2 from './navbar2';
import '../css/goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: '', targetDate: '' });
  const [activeTab, setActiveTab] = useState('add');
  const [editingGoal, setEditingGoal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const user = auth.currentUser;
    if (user) {
      const userGoals = await getUserGoals(user.uid);
      setGoals(userGoals);
    }
  };

  const handleAddGoal = async () => {
    if (newGoal.title.trim() === '' || newGoal.description.trim() === '') return;

    const user = auth.currentUser;
    if (user) {
      await addGoal(user.uid, newGoal);
      setNewGoal({ title: '', description: '', category: '', targetDate: '' });
      fetchGoals();
    }
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal.id);
    setEditForm({ ...goal });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveEdit = async () => {
    await updateGoal(editForm.id, editForm);
    setEditingGoal(null);
    setEditForm({});
    fetchGoals();
  };

  const handleDeleteGoal = async (goalId) => {
    await deleteGoal(goalId);
    fetchGoals();
  };

  const handleToggleCompletion = async (goalId, completed) => {
    await updateGoal(goalId, { completed });
    fetchGoals();
  };

  return (
    <div className="page-container">
      <Navbar2 />
      <div className="goals-tracker-container">
        <h1 className="main-title">Goals Tracker</h1>
        
        <div className="tab-navigation">
          <button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>Add Goal</button>
          <button className={activeTab === 'edit' ? 'active' : ''} onClick={() => setActiveTab('edit')}>My Goals</button>
          <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed Goals</button>
        </div>

        <div className="tab-content">
          {activeTab === 'add' && (
            <div className="add-goal">
              <h2>Add New Goal</h2>
              <form className="goal-form" onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Goal Title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Goal Description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    type="text"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    placeholder="Category"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="targetDate">Target Date</label>
                  <input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="add-goal-button">Add Goal</button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="my-goals">
              <h2>My Goals</h2>
              {goals.filter(goal => !goal.completed).map((goal) => (
                <div key={goal.id} className="goal-item">
                  {editingGoal === goal.id ? (
                    <form className="goal-form" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                      <div className="form-group">
                        <label htmlFor={`title-${goal.id}`}>Title</label>
                        <input
                          id={`title-${goal.id}`}
                          type="text"
                          value={editForm.title}
                          onChange={(e) => handleEditFormChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`description-${goal.id}`}>Description</label>
                        <textarea
                          id={`description-${goal.id}`}
                          value={editForm.description}
                          onChange={(e) => handleEditFormChange('description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`category-${goal.id}`}>Category</label>
                        <input
                          id={`category-${goal.id}`}
                          type="text"
                          value={editForm.category}
                          onChange={(e) => handleEditFormChange('category', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`targetDate-${goal.id}`}>Target Date</label>
                        <input
                          id={`targetDate-${goal.id}`}
                          type="date"
                          value={editForm.targetDate}
                          onChange={(e) => handleEditFormChange('targetDate', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setEditingGoal(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3>{goal.title}</h3>
                      <p>{goal.description}</p>
                      <p>Category: {goal.category}</p>
                      <p>Target Date: {goal.targetDate}</p>
                      <div className="goal-actions">
                        <button onClick={() => handleEditClick(goal)}>Edit</button>
                        <button onClick={() => handleToggleCompletion(goal.id, true)}>Mark as Completed</button>
                        <button onClick={() => handleDeleteGoal(goal.id)}>Delete Goal</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="completed-goals">
              <h2>Completed Goals</h2>
              {goals.filter(goal => goal.completed).map((goal) => (
                <div key={goal.id} className="goal-item">
                  <h3>{goal.title}</h3>
                  <p>{goal.description}</p>
                  <p>Category: {goal.category}</p>
                  <p>Target Date: {goal.targetDate}</p>
                  <div className="goal-actions">
                    <button onClick={() => handleToggleCompletion(goal.id, false)}>Mark as Incomplete</button>
                    <button onClick={() => handleDeleteGoal(goal.id)}>Delete Goal</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;