import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Smartphone, BookOpen, Calendar, MapPin, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Star, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/config';
import { Link } from 'react-router-dom';
import GoogleOAuth from './GoogleOAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpPhase, setOtpPhase] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, clearAllAuthData } = useAuth();

  useEffect(() => {
    const registrationSuccess = searchParams.get('registrationSuccess');
    if (registrationSuccess) {
      setSuccess('Registration successful! Please log in to continue.');
      setTimeout(() => {
        setSuccess('');
      }, 5000); // Hide after 5 seconds
    }
  }, [searchParams]);




  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log(BASE_URL)
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
          credentials: "include", // 👈 ye zaroori hai

      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log(data)

      // Check if this is an admin login (no OTP required)
      if (data.user && data.user.role === 'admin') {
        clearAllAuthData();
        login(data.user, data.accessToken, rememberMe);
        setSuccess('Welcome to Admin Dashboard! Redirecting...');
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
        return;
      }
      // if(data.user && data.user.role === 'student') {
        if(data.isOtpTrue) {
          setUserId(data.userId);
          setOtpPhase(true);
          return; 
        }
        else {
          login(data.user, data.accessToken, rememberMe);
          setSuccess('Welcome to your Student Dashboard! Redirecting...');
          setTimeout(() => {
            navigate(`/student-dashboard`);
          }, 1000);
        }
      // }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
        credentials: "include", // 👈 ye zaroori hai
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }


      if (data.accessToken || data.authToken) {
      login(data.user, data.accessToken, rememberMe);
       
        if (data.user && data.user.role === 'tutor') {
          setSuccess('Welcome to your Tutor Dashboard! Redirecting...');
          setTimeout(() => {
            navigate(`/tutor-dashboard`);
          }, 1000);

        }
        else if (data.user && data.user.role === 'student') {
          setSuccess('Welcome to your Student Dashboard! Redirecting...');
          setTimeout(() => {
            navigate(`/student-dashboard`);
          }, 1000);
        }

        else if (data.user && data.user.role === 'parent') {
          setSuccess('Welcome to your Parent Dashboard! Redirecting...');
          setTimeout(() => {
            navigate(`/parent-dashboard`);
          }, 1000);
        } else {
          setSuccess('Welcome to your Dashboard! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
          credentials: "include", // 👈 ye zaroori hai
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setUserId(data.userId);
      setOtp(''); // Clear previous OTP input
      setError('A new OTP has been sent to your email');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center sm:p-6 lg:p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-8 px-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-3">
          Welcome Back
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sign in to access your personalized learning dashboard and connect with amazing tutors
        </p>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Trusted by 10k+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span>Verified Tutors</span>
          </div>
        </div>
      </div>

      <div className="w-full pb-6 max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Login Card */}
        <Card className="w-full md:w-[70%] bg-white shadow-lg relative z-20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <User className="h-7 w-7 text-purple-500" />
              <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              {otpPhase ? 'Enter the OTP sent to your email' : 'Sign in to access your personalized learning dashboard'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-100 p-3 rounded-md mb-4">
                {success}
              </div>
            )}

            {!otpPhase ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-bold text-gray-700">
                      Email Address
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-purple-500" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10"
                        placeholder="john.doe@example.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="block text-sm font-bold text-gray-700">
                      Password
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-5 text-purple-500" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                                     <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <Checkbox
                         id="remember-me"
                         checked={rememberMe}
                         onCheckedChange={(checked) => setRememberMe(checked)}
                         disabled={isLoading}
                       />
                       <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                         Remember me
                       </Label>
                     </div>

                    <div className="text-sm">
                      <Link to="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center mt-auto"
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="otp" className="block text-sm font-bold text-gray-700">
                    OTP Code
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full"
                      placeholder="Enter 6-digit OTP"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying OTP...
                    </span>
                  ) : 'Verify OTP'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center mt-2"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              </form>
            )}

            {!otpPhase && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    {/* <div className="w-full border-t border-gray-300" /> */}
                  </div>
                  {/* <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div> */}
                </div>
                
                {/* Google OAuth for Login */}
                <div className="mt-4">
                  <GoogleOAuth mode="login" />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </CardFooter>
          
        </Card>

        <Card className="w-full md:w-[60%] bg-white shadow-lg relative z-20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-7 w-7 text-purple-500" />
              <CardTitle className="text-xl font-bold">Send Us Your Requirements</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              We'll match you with the perfect tutor for online or in-person sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Tell us about the subject you need help with</p>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Specify your preferred schedule</p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Choose between online or in-person sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Get matched with qualified tutors</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-indigo-600 text-indigo-600 relative overflow-hidden group"
            >
              <span className="relative z-10 transition-colors duration-300 delay-100 group-hover:text-white">
                Submit Requirements
              </span>
              <span className="absolute inset-0 h-full w-0 bg-purple-600 transition-all duration-300 ease-in-out group-hover:w-full z-0"></span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
