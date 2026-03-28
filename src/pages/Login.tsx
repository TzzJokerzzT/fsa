/**
 * Login Page - User authentication form
 * Follows form best practices: visible labels, error feedback, loading states
 */

import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/client';
import { useLogin } from '@/shared/api/hooks';
import { Button, Input } from '@/shared/ui';

export function LoginPage() {
  const formId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }

    login.mutate(
      { email: email.trim(), password },
      {
        onError: (error) => {
          setFormError(getApiErrorMessage(error));
        },
      },
    );
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="mt-2 text-text-secondary">
          Sign in to continue building architectures
        </p>
      </div>

      {/* Form */}
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        {/* Form Error */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-error/10 border border-error/20"
            role="alert"
          >
            <p className="text-sm text-error">{formError}</p>
          </motion.div>
        )}

        {/* Email */}
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          disabled={login.isPending}
          required
        />

        {/* Password */}
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={login.isPending}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          required
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          loading={login.isPending}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary-hover font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Create one
          </Link>
        </p>
      </div>
    </>
  );
}
