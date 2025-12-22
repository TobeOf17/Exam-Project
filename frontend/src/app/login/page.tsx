'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // TODO: Add your authentication logic here
      console.log('Login data:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle successful login
      // router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Top Half - Dark Blue Background */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#3d5a80]" />

      {/* Bottom Half - Wavy Background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#ddd6fe" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
          </defs>

          {/* Wave layers */}
          <path
            d="M0,100 C320,180 480,80 720,120 C960,160 1120,80 1440,120 L1440,400 L0,400 Z"
            fill="url(#gradient1)"
            opacity="0.7"
          />
          <path
            d="M0,140 C360,220 540,120 900,180 C1080,220 1260,140 1440,180 L1440,400 L0,400 Z"
            fill="url(#gradient2)"
            opacity="0.6"
          />
          <path
            d="M0,180 C240,260 600,160 840,220 C1080,280 1320,180 1440,240 L1440,400 L0,400 Z"
            fill="url(#gradient3)"
            opacity="0.5"
          />
          <path
            d="M0,240 C360,290 540,220 900,260 C1200,300 1320,240 1440,280 L1440,400 L0,400 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xl font-medium">Checkout</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Welcome Title */}
          <h1 className="mb-8 text-center text-4xl font-semibold text-gray-300">
            Welcome to Checkout 👋
          </h1>

          {/* Login Card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Enter Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="username"
                  {...register('username')}
                  className={`w-full rounded-lg border ${
                    errors.username ? 'border-red-400' : 'border-gray-300'
                  } bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Enter Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Manager@123"
                  {...register('password')}
                  className={`w-full rounded-lg border ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  } bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-400 py-3 text-lg font-medium text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
