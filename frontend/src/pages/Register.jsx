import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SparklesCore } from "../components/ui/sparkles";

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden bg-[#0C0C14] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .reg-card { 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(255, 255, 255, 0.07); 
          border-radius: 24px; 
          padding: 32px; 
          width: 100%; 
          max-width: 440px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .reg-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          outline: none;
          transition: all 0.2s;
          font-size: 14px;
        }
        .reg-input:focus {
          border-color: #7DF9C2;
          background: rgba(255, 255, 255, 0.08);
        }
        .reg-btn {
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
          font-size: 14px;
        }
        .reg-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(125, 249, 194, 0.3);
        }
        .reg-btn:disabled {
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
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold font-['Syne'] text-white tracking-tighter mb-1">
            Career<span className="text-[#7DF9C2]">OS</span>
          </h1>
          <p className="text-white/40 font-medium text-sm">Join the next generation of professionals</p>
        </div>

        <div className="reg-card">
          <h2 className="text-lg font-bold font-['Syne'] text-white mb-5">Create Account</h2>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                ⚠ {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="reg-input"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="reg-input"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="reg-input"
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
                minLength={8}
                className="reg-input"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading} className="reg-btn mt-4">
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>

            <div className="pt-4 text-center">
              <Link to="/login" className="text-sm font-medium text-white/40 hover:text-[#7DF9C2] transition-colors">
                Already have an account? <span className="text-[#7DF9C2]">Sign In</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
