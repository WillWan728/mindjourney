import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Overview = ({ exercises, meals, waterIntakes }) => {
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const calorieData = useMemo(() => {
    return last7Days.map(date => ({
      date,
      caloriesIn: meals.filter(meal => meal.date === date).reduce((sum, meal) => sum + meal.calories, 0),
      caloriesOut: exercises.filter(exercise => exercise.date === date).reduce((sum, exercise) => sum + exercise.caloriesBurned, 0),
    }));
  }, [last7Days, meals, exercises]);

  const waterData = useMemo(() => {
    return last7Days.map(date => ({
      date,
      amount: waterIntakes.filter(water => water.date === date).reduce((sum, water) => sum + water.amount, 0),
    }));
  }, [last7Days, waterIntakes]);

  const exerciseMinutes = useMemo(() => {
    return last7Days.map(date => ({
      date,
      minutes: exercises.filter(exercise => exercise.date === date).reduce((sum, exercise) => sum + exercise.duration, 0),
    }));
  }, [last7Days, exercises]);

  const calorieChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Calories In',
        data: calorieData.map(d => d.caloriesIn),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Calories Burned',
        data: calorieData.map(d => d.caloriesOut),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const waterChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: waterData.map(d => d.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const exerciseChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Exercise Minutes',
        data: exerciseMinutes.map(d => d.minutes),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Last 7 Days Overview',
      },
    },
  };

  const totalCaloriesIn = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalCaloriesBurned = exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
  const totalWaterIntake = waterIntakes.reduce((sum, water) => sum + water.amount, 0);
  const totalExerciseMinutes = exercises.reduce((sum, exercise) => sum + exercise.duration, 0);

  return (
    <div className="fitness-overview">
      <h2>Fitness Overview</h2>
      
      <div className="overview-stats">
        <div className="stat-box">
          <h3>Total Calories In</h3>
          <p>{totalCaloriesIn.toFixed(2)} kcal</p>
        </div>
        <div className="stat-box">
          <h3>Total Calories Burned</h3>
          <p>{totalCaloriesBurned.toFixed(2)} kcal</p>
        </div>
        <div className="stat-box">
          <h3>Net Calories</h3>
          <p>{(totalCaloriesIn - totalCaloriesBurned).toFixed(2)} kcal</p>
        </div>
        <div className="stat-box">
          <h3>Total Water Intake</h3>
          <p>{(totalWaterIntake / 1000).toFixed(2)} L</p>
        </div>
        <div className="stat-box">
          <h3>Total Exercise Time</h3>
          <p>{totalExerciseMinutes} minutes</p>
        </div>
      </div>

      <div className="chart-container">
        <h3>Calorie Overview</h3>
        <Line options={chartOptions} data={calorieChartData} />
      </div>

      <div className="chart-container">
        <h3>Water Intake</h3>
        <Line options={chartOptions} data={waterChartData} />
      </div>

      <div className="chart-container">
        <h3>Exercise Duration</h3>
        <Bar options={chartOptions} data={exerciseChartData} />
      </div>
    </div>
  );
};

export default Overview;