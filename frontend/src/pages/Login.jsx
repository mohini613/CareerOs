import { useState } from 'react';
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
  const navigate = useNavigate();
  const { login } = useAuth();

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
<div className="h-screen relative flex items-center justify-center overflow-hidden bg-black">
  
  <div className="absolute inset-0">
    <SparklesCore
      background="transparent"
      minSize={0.5}
      maxSize={1.2}
      particleDensity={120}
      className="w-full h-full"
      particleColor="#ffffff"
      speed={1}
    />
  </div>     
<div className="relative z-20 max-w-md w-full space-y-8">    
      <div>
<h2 className="mt-6 text-center text-6xl font-bold text-white font-times">
  CareerOS
</h2>            
          <p className="mt-2 text-center text-1xl font text-white font-times">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg border-2 border-crimson-900" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-400 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border-2 border-crimson-900 placeholder-crimson-600 text-crimson-900 rounded-md focus:outline-none focus:ring-2 focus:ring-crimson-900 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border-2 border-crimson-900 placeholder-crimson-600 text-crimson-900 rounded-md focus:outline-none focus:ring-2 focus:ring-crimson-900 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-black text-sm font-medium rounded-md text-blush-100 bg-crimson-900 hover:bg-crimson-800 focus:outline-none disabled:bg-crimson-700"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        <div className ="flex items-center">
          <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 accent-crimson-900"
          />
          <label htmlFor="remember-me" classNmae="ml-2 text-sm text-crimson-700">
            Remember Me
          </label>
        </div>
          <div className="text-center">
            <Link to="/register" className="font-medium text-crimson-900 hover:text-crimson-700">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;