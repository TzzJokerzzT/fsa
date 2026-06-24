/**
 * Auth Layout - Centered card layout for auth pages
 * Provides a clean, minimal layout for login/register forms
 */

import { motion } from 'framer-motion';
import { Link, Outlet } from 'react-router-dom';
import logo from '@/assets/logo.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-100">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <motion.div
        className="relative flex-1 flex flex-col items-center justify-center p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            to="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-2 -m-2"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white shadow-lg">
              <img
                src={logo}
                aria-label="Frontend Architecture Logo"
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text-primary">
                Frontend Architecture
              </span>
              <span className="text-sm text-text-muted">Simulator</span>
            </div>
          </Link>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md bg-surface-200 rounded-2xl border border-surface-400 shadow-xl p-8"
        >
          <Outlet />
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-sm text-text-muted"
        >
          Build and visualize frontend architectures
        </motion.p>
      </motion.div>
    </div>
  );
}
