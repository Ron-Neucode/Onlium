import { useState } from 'react';
import CreateAccount from './CreateAccount';
import Login from './Login';
import './styles/RegisterUniversity.css';

const RegisterUniversity = () => {
  const [activeTab, setActiveTab] = useState('signup');

  return (
    <div className="register-page">

      <div className="register-blob register-blob--1" />
      <div className="register-blob register-blob--2" />

      {/* Left side */}
      <div className="register-left">
        <h2 className="register-left__title">
          Onlium offers Interactive learning experience
        </h2>
        <div className="stair-deco">
          <div className="stair-deco__step" />
          <div className="stair-deco__step" />
          <div className="stair-deco__step" />
          <div className="stair-deco__step" />
        </div>
      </div>

      {/* Card */}
      <div className="register-card-wrap">
        <div className="register-card">
          <h1 className="register-card__title">
            {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>

          <div className="register-tabs">
            <button
              className={`register-tab ${activeTab === 'signup' ? 'register-tab--active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
            <button
              className={`register-tab ${activeTab === 'login' ? 'register-tab--active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
          </div>

          {activeTab === 'signup' ? (
            <CreateAccount onSwitchToLogin={() => setActiveTab('login')} />
          ) : (
            <Login onSwitchToSignup={() => setActiveTab('signup')} />
          )}
        </div>
      </div>

    </div>
  );
};

export default RegisterUniversity;
