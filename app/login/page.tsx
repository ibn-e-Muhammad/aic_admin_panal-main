'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { createClient } from '@/supabase/client'; 
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation'; 
import 'react-toastify/dist/ReactToastify.css'; 

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter(); 

  const handleLogin = async () => {
    const supabase = createClient(); 
    setIsLoading(true);
    setErrorMessage(''); 
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error; 
      }
      if (data?.session?.access_token) {
       
       
        toast.success('Login successful! Redirecting to home...');
        setTimeout(() => {
          router.push('/'); 
        }, 1200); 
      }
    } catch (error: any) {
      setErrorMessage('Invalid email or password.');
      setTimeout(() => {
        setErrorMessage('');
      }
      , 2500);


      toast.error('Invalid email or password.');
      console.error('Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
    if (token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="grid min-h-screen w-full">
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="p-6 rounded-lg shadow-lg w-96"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              <span>{errorMessage}</span>
            </motion.div>
          )}
          {/* Email Input */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
              <Mail className="absolute top-3 right-3 text-gray-400" />
            </div>
          </div>
          {/* Password Input */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              <Lock className="absolute top-3 right-3 text-gray-400" />
            </div>
          </div>
          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white p-3 rounded-lg transition-transform duration-200 ease-in-out ${
              isLoading ? 'cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="mr-2" /> Login
              </div>
            )}
          </button>
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
}
