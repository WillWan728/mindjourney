import React from 'react';
import '../css/homepage.css';
import Navbar from './navbar' 
import people from '../images/people.png';

const FeatureItem = ({ title, number, description }) => (
  <div className="feature-item">
    <h3>{title}</h3>
    <div className="feature-number">{number}</div>
    <p>{description}</p>
  </div>
);

const FeaturesGrid = () => (
  <div className="features-grid">
    <FeatureItem
      title="Sleep"
      number="💤"
      description="Track your sleep patterns, set sleep goals, and improve your rest quality with our comprehensive sleep tracker."
    />
    <FeatureItem
      title="Fitness"
      number="🏃‍♂️"
      description="Monitor your calorie intake, track your workouts, and achieve your fitness goals with our easy-to-use fitness tools."
    />
    <FeatureItem
      title="Wellbeing"
      number="😊"
      description="Journal your thoughts, check your mood, and improve your overall wellbeing with our mindfulness features."
    />
  </div>
);

const LifeBenefitsSection = () => (
  <div className="life-benefits-section">
    <img src={people} alt="People" className="life-benefits-image" />
    <div className="life-benefits-text">
      <h2 className="section-subheading">Why Improving Every Aspect of Life Matters</h2>
      <p>
        Improving all aspects of life is key to a fulfilling and balanced existence.
        By focusing on sleep, fitness, and overall wellbeing, you can enhance your quality
        of life, increase your energy levels, and foster a positive mindset. MindJourney
        provides the tools you need to embark on this holistic journey towards better health
        and happiness.
      </p>
    </div>
  </div>
);

const WellbeingScoreSection = () => (
  <div className="wellbeing-score-section">
    <h2 className="section-subheading">Wellbeing Score</h2>
    <p>
      At MindJourney, we calculate your weekly Wellbeing Score by analyzing three key
      aspects of your life: fitness activities, sleep patterns, and overall wellbeing
      practices. Our algorithm takes into account the frequency and quality of your
      workouts, the duration and consistency of your sleep, and your engagement with
      mindfulness and stress-reduction activities. By combining these crucial elements,
      we provide you with a comprehensive score that reflects your overall wellness.
      This score helps you track your progress, identify areas for improvement, and
      motivate you to maintain a balanced, healthy lifestyle.
    </p>
  </div>
);

function HomePage() {
  return (
    <div className="homepage">
      <Navbar /> 
      <div className="homepage-content">
        <div className="content-wrapper">
          <h2 className="welcome-text">Welcome to MindJourney</h2>
          <h1 className="main-heading">
            Find your path to<br />wellness
          </h1>
          <p className="description">
            At MindJourney, we believe that wellness is a journey, not a destination.
            Our website is designed to help you take charge of your health and wellbeing
            by providing you with the tools you need to track your progress and make
            meaningful changes. Our website allows you to track sleep, fitness, and
            wellbeing features to help you achieve your goals. With MindJourney, you
            will have the support you need to take control of your life.
          </p>
          <a href="/register" className="get-started-button">Get Started</a>
        </div>
      </div>
      <FeaturesGrid />
      <LifeBenefitsSection />
      <WellbeingScoreSection />
    </div>
  );
}

export default HomePage;
