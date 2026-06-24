import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, User, Lock, ArrowRight, ArrowLeft, UserPlus, Type, Mail, Phone, Calendar, Eye, EyeOff } from 'lucide-react';
import '../styles/login.css';
import { API_URL } from '../config';

const Login = ({ onLogin, onBack }) => {
  const [loginType, setLoginType] = useState('user'); // 'user' or 'nursery'
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add a class to body specifically for login to change background
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        const res = await axios.post(`${API_URL}/api/forgot-password`, { email: email.trim() });
        setForgotMessage(res.data.message);
      } else if (isRegistering) {
        if (loginType === 'user') {
          await axios.post(`${API_URL}/api/register`, {
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            phone_number: phoneNumber.trim(),
            dob: dob || null,
            password
          });
        } else {
          await axios.post(`${API_URL}/api/nursery/register`, {
            nursery_name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            phone_number: phoneNumber.trim(),
            password
          });
        }
        
        const loginEndpoint = loginType === 'user' ? '/api/login' : '/api/nursery/login';
        const loginRes = await axios.post(`${API_URL}${loginEndpoint}`, {
          username: username.trim(),
          password
        });
        const userObj = loginRes.data;
        if (loginType === 'user') userObj.role = 'user';
        onLogin(userObj);
      } else {
        const loginEndpoint = loginType === 'user' ? '/api/login' : '/api/nursery/login';
        const loginRes = await axios.post(`${API_URL}${loginEndpoint}`, {
          username: username.trim(),
          password
        });
        const userObj = loginRes.data;
        if (loginType === 'user') userObj.role = 'user';
        onLogin(userObj);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-container">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Home
        </button>
      )}

      <div className="login-hero animate-fade-in">
        <h1>Welcome to Saplinggo</h1>
        <p>Discover, nurture, and grow your perfect plant collection with our curated selection of beautiful botanicals.</p>
      </div>

      <div className="login-form-side">
        <div className="login-card animate-fade-in">
        <div className="login-logo">
          <Leaf size={24} color="var(--green-700)" />
        </div>

        <h1 className="login-title">Welcome to Saplinggo</h1>
        <p className="login-subtitle">
          {isForgotPassword ? 'Reset your password' : isRegistering ? 'Create a new account' : 'Sign in to your account'}
        </p>

        {!isForgotPassword && (
          <div className="login-toggle">
            <button 
              className={loginType === 'user' ? 'active' : ''} 
              onClick={() => { setLoginType('user'); setError(''); }}
              type="button"
            >
              User
            </button>
            <button 
              className={loginType === 'nursery' ? 'active' : ''} 
              onClick={() => { setLoginType('nursery'); setError(''); }}
              type="button"
            >
              Nursery
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isForgotPassword ? (
            <>
              <div className="input-group">
                <span className="input-icon"><Mail size={16} /></span>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="login-input" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setForgotMessage(''); }}
                  required 
                />
              </div>
              {forgotMessage && <div style={{ color: 'var(--green-600)', margin: '10px 0', fontSize: '13px', textAlign: 'center' }}>{forgotMessage}</div>}
              {error && <div className="login-error animate-shake" style={{ margin: '10px 0', color: '#b03030', fontSize: '13px', background: '#fce4e4', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}
              
              <button type="submit" className="login-btn-new" disabled={loading} style={{ marginTop: '15px' }}>
                Send Reset Link
              </button>
              
              <p className="register-link">
                <span onClick={() => { setIsForgotPassword(false); setError(''); setForgotMessage(''); }}>
                  Back to Sign In
                </span>
              </p>
            </>
          ) : (
            <>
              {isRegistering && (
                <>
                  <div className="input-group">
                    <span className="input-icon"><Type size={16} /></span>
                    <input 
                      type="text" 
                      placeholder={loginType === 'nursery' ? "Nursery Name" : "Full Name"} 
                      className="login-input" 
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-icon"><Mail size={16} /></span>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="login-input" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-icon"><Phone size={16} /></span>
                    <input 
                      type="text" 
                      placeholder="Phone Number" 
                      className="login-input" 
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                      required 
                    />
                  </div>
                  {loginType === 'user' && (
                    <div className="input-group">
                      <span className="input-icon"><Calendar size={16} /></span>
                      <input 
                        type={dob ? "date" : "text"}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                        placeholder="Date of Birth (Optional)" 
                        className="login-input" 
                        value={dob}
                        onChange={(e) => { setDob(e.target.value); setError(''); }}
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="input-group">
                <span className="input-icon"><User size={16} /></span>
                <input 
                  type="text" 
                  placeholder={isRegistering ? "Username" : "Username or Email"} 
                  className="login-input" 
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  required 
                />
              </div>
              
              <div className="input-group">
                <span className="input-icon"><Lock size={16} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="login-input" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required 
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {!isRegistering && (
                <div className="forgot-link" onClick={() => { setIsForgotPassword(true); setError(''); }}>
                  Forgot password?
                </div>
              )}
              
              {error && <div className="login-error animate-shake" style={{ margin: '15px 0', color: '#b03030', fontSize: '13px', background: '#fce4e4', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}
              
              <button type="submit" className="login-btn-new" disabled={loading} style={{ marginTop: isRegistering ? '15px' : '0' }}>
                {isRegistering ? (
                  <><UserPlus size={18} /> Sign Up</>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>

              <p className="register-link">
                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                <span onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
                  {isRegistering ? 'Sign in' : 'Register here'}
                </span>
              </p>
            </>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
