import React, { useState } from 'react';
import axios from 'axios';
import { Leaf, User, Lock, ArrowRight, UserPlus, Type, Mail, Phone, Calendar } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        const res = await axios.post('https://sapplingo.onrender.com/api/forgot-password', { email });
        setForgotMessage(res.data.message);
      } else if (isRegistering) {
        await axios.post('https://sapplingo.onrender.com/api/register', {
          name,
          username,
          email,
          phone_number: phoneNumber,
          dob: dob || null,
          password
        });
        const loginRes = await axios.post('https://sapplingo.onrender.com/api/login', {
          username,
          password
        });
        onLogin(loginRes.data);
      } else {
        const loginRes = await axios.post('https://sapplingo.onrender.com/api/login', {
          username,
          password
        });
        onLogin(loginRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-box glass-panel">
        <div className="login-header">
          <Leaf size={48} color="var(--primary-color)" className="login-icon animate-float" />
          <h2 className="login-title text-shadow" style={{ color: 'var(--primary-color)' }}>Welcome to Saplinggo</h2>
          <p className="login-subtitle text-shadow" style={{ color: 'var(--text-dark)' }}>
            {isForgotPassword ? 'Reset your password' : isRegistering ? 'Create a new account' : 'Please sign in to your account'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isForgotPassword ? (
            <>
              <div className="input-group">
                <Mail size={20} className="input-icon" color="var(--primary-color)" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="login-input glass" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setForgotMessage(''); }}
                  required 
                />
              </div>
              {forgotMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{forgotMessage}</div>}
              {error && <div className="login-error animate-shake">{error}</div>}
              
              <button type="submit" className="btn btn-primary login-btn glass-btn" disabled={loading}>
                Send Reset Link
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <span 
                  onClick={() => { setIsForgotPassword(false); setError(''); setForgotMessage(''); }} 
                  style={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline' }}
                >
                  Back to Sign In
                </span>
              </div>
            </>
          ) : (
            <>
              {isRegistering && (
                <>
                  <div className="input-group">
                    <Type size={20} className="input-icon" color="var(--primary-color)" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="login-input glass" 
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Mail size={20} className="input-icon" color="var(--primary-color)" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="login-input glass" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Phone size={20} className="input-icon" color="var(--primary-color)" />
                    <input 
                      type="text" 
                      placeholder="Phone Number" 
                      className="login-input glass" 
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Calendar size={20} className="input-icon" color="var(--primary-color)" />
                    <input 
                      type="date" 
                      placeholder="Date of Birth" 
                      className="login-input glass" 
                      value={dob}
                      onChange={(e) => { setDob(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                </>
              )}
              
              <div className="input-group">
                <User size={20} className="input-icon" color="var(--primary-color)" />
                <input 
                  type="text" 
                  placeholder={isRegistering ? "Username" : "Username or Email"} 
                  className="login-input glass" 
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  required 
                />
              </div>
              <div className="input-group">
                <Lock size={20} className="input-icon" color="var(--primary-color)" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="login-input glass" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required 
                />
              </div>

              {!isRegistering && (
                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                  <span 
                    onClick={() => { setIsForgotPassword(true); setError(''); }} 
                    style={{ cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.9rem' }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}
              
              {error && <div className="login-error animate-shake">{error}</div>}
              
              <button type="submit" className="btn btn-primary login-btn glass-btn" disabled={loading}>
                {isRegistering ? (
                  <><UserPlus size={20} /> Sign Up</>
                ) : (
                  <>Sign In <ArrowRight size={20} /></>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <span 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
                  style={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline' }}
                >
                  {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
                </span>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
