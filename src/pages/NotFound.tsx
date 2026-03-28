import { motion } from 'framer-motion';
import { Compass, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';

/**
 * NotFound (404) Page
 * Displayed when a user navigates to a non-existent route
 * Provides helpful navigation options back to the app
 */

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  },
};

const suggestedLinks = [
  { to: '/', label: 'Home', description: 'Return to the dashboard' },
  { to: '/builder', label: 'Builder', description: 'Create an architecture' },
  { to: '/learn', label: 'Learn', description: 'Explore patterns' },
  { to: '/compare', label: 'Compare', description: 'Compare architectures' },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg"
      >
        <Card variant="bordered" className="text-center">
          {/* Animated 404 Illustration */}
          <div className="flex justify-center mb-6">
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="relative"
            >
              {/* Large 404 text */}
              <div className="text-8xl font-bold text-surface-300 select-none">
                404
              </div>
              {/* Compass icon overlay */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-12 h-12 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Page Not Found
          </h1>
          <p className="text-text-secondary mb-8">
            The page you're looking for seems to have wandered off. Let's get
            you back on track.
          </p>

          {/* Primary Action */}
          <Link to="/" className="inline-block mb-8">
            <Button size="lg" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>

          {/* Suggested Links */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-4">
              <Search className="w-4 h-4" />
              <span>Or try one of these pages:</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {suggestedLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 rounded-lg bg-surface-200 hover:bg-surface-300 transition-colors text-left"
                  >
                    <div className="font-medium text-text-primary text-sm">
                      {link.label}
                    </div>
                    <div className="text-xs text-text-muted">
                      {link.description}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
