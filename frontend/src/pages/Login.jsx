import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SparklesCore } from "../components/ui/sparkles";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden bg-[#0C0C14] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .login-card { 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(255, 255, 255, 0.07); 
          border-radius: 24px; 
          padding: 40px; 
          width: 100%; 
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .login-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #7DF9C2;
          background: rgba(255, 255, 255, 0.08);
        }
        .login-btn {
          width: 100%;
          background: #7DF9C2;
          color: #0C0C14;
          font-weight: 800;
          font-family: 'Syne', sans-serif;
          padding: 14px;
          border-radius: 12px;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(125, 249, 194, 0.3);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div className="absolute inset-0">
        <SparklesCore
          background="transparent"
          minSize={0.5}
          maxSize={1.2}
          particleDensity={120}
          className="w-full h-full"
          particleColor="#7DF9C2"
          speed={1}
        />
      </div>

      <div className="relative z-20">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold font-['Syne'] text-white tracking-tighter mb-2">
            Career<span className="text-[#7DF9C2]">OS</span>
          </h1>
          <p className="text-white/40 font-medium">Elevate your professional journey</p>
        </div>

        <div className="login-card">
          <h2 className="text-xl font-bold font-['Syne'] text-white mb-6">Sign In</h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                ⚠ {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="login-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="login-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn mt-2">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="pt-4 text-center">
              <Link to="/register" className="text-sm font-medium text-white/40 hover:text-[#7DF9C2] transition-colors">
                Don't have an account? <span className="text-[#7DF9C2]">Sign Up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;