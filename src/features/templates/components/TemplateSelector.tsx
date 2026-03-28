import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  ChevronRight,
  Layers,
  LayoutGrid,
  Network,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent } from '@/shared/ui';
import {
  type ArchitectureTemplate,
  architectureTemplates,
} from '../data/templates';

/**
 * Template Selector Component
 * Displays available architecture templates with preview and filtering
 */

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: ArchitectureTemplate) => void;
}

// Icon mapping for template types
const templateIcons: Record<string, React.ElementType> = {
  mvc: Workflow,
  mvvm: Workflow,
  flux: Zap,
  redux: Zap,
  'react-query': Zap,
  'clean-architecture': Layers,
  'atomic-design': LayoutGrid,
  'feature-sliced': Boxes,
  microfrontends: Network,
};

// Complexity badge colors
const complexityColors: Record<ArchitectureTemplate['complexity'], string> = {
  simple: 'success',
  medium: 'warning',
  complex: 'error',
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.2 },
  },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

type FilterType = 'all' | ArchitectureTemplate['complexity'];

export function TemplateSelector({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTemplate, setSelectedTemplate] =
    useState<ArchitectureTemplate | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (filter === 'all') return architectureTemplates;
    return architectureTemplates.filter((t) => t.complexity === filter);
  }, [filter]);

  // Handle template selection
  const handleSelect = (template: ArchitectureTemplate) => {
    setSelectedTemplate(template);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
      setSelectedTemplate(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-surface-100/80 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface-200 border-l border-surface-400 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-400">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Architecture Templates
                </h2>
                <p className="text-sm text-text-secondary">
                  Start with a pre-built pattern
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-surface-400">
              {(['all', 'simple', 'medium', 'complex'] as FilterType[]).map(
                (f) => (
                  <Button
                    key={f}
                    variant={filter === f ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ),
              )}
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-auto p-4">
              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredTemplates.map((template) => {
                  const Icon = templateIcons[template.id] || Workflow;
                  const isSelected = selectedTemplate?.id === template.id;

                  return (
                    <motion.div key={template.id} variants={listItemVariants}>
                      <Card
                        variant={isSelected ? 'elevated' : 'bordered'}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleSelect(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-surface-300 text-text-muted'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-text-primary">
                                  {template.name}
                                </h3>
                                <Badge
                                  variant={
                                    complexityColors[template.complexity] as
                                      | 'success'
                                      | 'warning'
                                      | 'error'
                                  }
                                  size="sm"
                                >
                                  {template.complexity}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-secondary line-clamp-2">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                <span>{template.nodes.length} nodes</span>
                                <span>{template.edges.length} connections</span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight
                              className={`w-5 h-5 transition-transform ${
                                isSelected
                                  ? 'text-primary translate-x-1'
                                  : 'text-text-muted'
                              }`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-400 bg-surface-300/50">
              {selectedTemplate ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {selectedTemplate.nodes.length} nodes will be created
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm}>Use Template</Button>
                </div>
              ) : (
                <p className="text-center text-sm text-text-muted">
                  Select a template to get started
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
