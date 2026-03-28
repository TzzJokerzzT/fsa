import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  Building2,
  type GitBranch,
  Grid3X3,
  Layers,
  Network,
  Plus,
  Workflow,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArchitectureList, useArchitectureStore } from '@/app/store';
import { ArchitectureCard } from '@/features/architecture-list';
import { useArchitectureSync } from '@/shared/api/hooks';
import type { ArchitectureType } from '@/shared/types';
import { Button, Card, useToast } from '@/shared/ui';

/**
 * Home/Dashboard Page
 * Shows overview and recent architectures
 */

const architectureTemplates: {
  type: ArchitectureType;
  name: string;
  description: string;
  icon: typeof GitBranch;
}[] = [
  {
    type: 'monolithic',
    name: 'Monolithic SPA',
    description: 'Traditional single-page application structure',
    icon: Building2,
  },
  {
    type: 'modular',
    name: 'Modular',
    description: 'Organized by technical responsibilities',
    icon: Boxes,
  },
  {
    type: 'feature-based',
    name: 'Feature-Based',
    description: 'Organized by business features',
    icon: Grid3X3,
  },
  {
    type: 'atomic-design',
    name: 'Atomic Design',
    description: 'Atoms, molecules, organisms, templates',
    icon: Workflow,
  },
  {
    type: 'microfrontends',
    name: 'Microfrontends',
    description: 'Independent deployable frontend modules',
    icon: Network,
  },
  {
    type: 'clean-architecture',
    name: 'Clean Architecture',
    description: 'Layered approach with clear boundaries',
    icon: Layers,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export default function HomePage() {
  const architectures = useArchitectureList();
  const createArchitecture = useArchitectureStore((s) => s.createArchitecture);
  const updateArchitectureName = useArchitectureStore(
    (s) => s.updateArchitectureName,
  );
  const navigate = useNavigate();
  const toast = useToast();
  const { deleteFromApi } = useArchitectureSync();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateFromTemplate = (
    template: (typeof architectureTemplates)[0],
  ) => {
    const id = createArchitecture(
      template.name,
      template.type,
      template.description,
    );
    navigate(`/builder/${id}`);
  };

  const handleRename = useCallback(
    (id: string, newName: string) => {
      updateArchitectureName(id, newName);
      toast.success('Architecture renamed', `Renamed to "${newName}"`);
    },
    [updateArchitectureName, toast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteFromApi(id);
        toast.success('Architecture deleted');
      } catch (error) {
        toast.error(
          'Failed to delete',
          error instanceof Error ? error.message : 'Unknown error',
        );
      } finally {
        setDeletingId(null);
      }
    },
    [deleteFromApi, toast],
  );

  useEffect(() => {
    document.title = 'FAS | Dashboard';
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">
            Frontend Architecture Simulator
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Visualize, build, and understand how modern frontend applications
            are structured using different architectural patterns.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card
            variant="bordered"
            className="bg-gradient-to-r from-primary/10 to-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-text-primary">
                  Start Building
                </h2>
                <p className="text-sm text-text-secondary">
                  Create a new architecture diagram or explore templates
                </p>
              </div>
              <Link to="/builder">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  New Architecture
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Templates */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Architecture Templates
            </h2>
            <Link to="/learn" className="text-sm text-primary hover:underline">
              Learn more
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {architectureTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <motion.div
                  key={template.type}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    variant="bordered"
                    className="h-full hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-300 text-primary group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-text-primary">
                          {template.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {template.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Recent Architectures */}
        {architectures.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">
                Your Architectures
              </h2>
              <span className="text-sm text-text-muted">
                {architectures.length} total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {architectures.map((arch) => (
                  <ArchitectureCard
                    key={arch.id}
                    architecture={arch}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    isDeleting={deletingId === arch.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Features Overview */}
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Architecture Builder"
              description="Drag & drop interface to create and visualize component hierarchies and data flow"
              link="/builder"
            />
            <FeatureCard
              title="Data Flow Simulation"
              description="Watch how props, state, and events flow through your architecture in real-time"
              link="/builder"
            />
            <FeatureCard
              title="Architecture Comparison"
              description="Compare two architectures side by side with complexity metrics"
              link="/compare"
            />
            <FeatureCard
              title="Learning Mode"
              description="Interactive tutorials explaining each architectural pattern"
              link="/learn"
            />
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link to={link}>
      <Card
        variant="bordered"
        className="h-full hover:border-primary/50 transition-colors group"
      >
        <h3 className="font-medium text-text-primary mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </Card>
    </Link>
  );
}
