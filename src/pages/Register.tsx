/**
 * Register Page - User registration form
 * Follows form best practices: visible labels, error feedback, loading states
 */

import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, UserPlus } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/client';
import { useRegister } from '@/shared/api/hooks';
import { Button, Input } from '@/shared/ui';

export function RegisterPage() {
  const formId = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    register.mutate(
      { name: name.trim(), email: email.trim(), password },
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
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="mt-2 text-text-secondary">
          Start building frontend architectures today
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

        {/* Name */}
        <Input
          type="text"
          label="Name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          disabled={register.isPending}
          required
        />

        {/* Email */}
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          disabled={register.isPending}
          required
        />

        {/* Password */}
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={register.isPending}
          helperText="Must be at least 8 characters"
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

        {/* Confirm Password */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={register.isPending}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 cursor-pointer"
              tabIndex={-1}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
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
          loading={register.isPending}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
