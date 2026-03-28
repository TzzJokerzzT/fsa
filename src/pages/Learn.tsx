import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

/**
 * Learn Page - Interactive tutorials about architectural patterns
 */

const architecturePatterns = [
  {
    id: 'monolithic',
    name: 'Monolithic SPA',
    description:
      'A traditional single-page application where all code lives in one codebase and is deployed as a single unit.',
    pros: [
      'Simple to develop and deploy',
      'Easy to understand for small teams',
      'Lower initial complexity',
    ],
    cons: [
      'Can become unwieldy as it grows',
      'Harder to scale teams independently',
      'Longer build times as codebase grows',
    ],
    bestFor: 'Small to medium applications, MVP development, small teams',
  },
  {
    id: 'modular',
    name: 'Modular Architecture',
    description:
      'Code is organized by technical responsibility (components, services, utils, etc.).',
    pros: [
      'Clear separation of concerns',
      'Easy to find code by type',
      'Good for medium-sized applications',
    ],
    cons: [
      'Feature code spread across folders',
      'Can lead to circular dependencies',
      'Harder to extract features',
    ],
    bestFor:
      'Medium-sized applications, teams familiar with traditional structures',
  },
  {
    id: 'feature-based',
    name: 'Feature-Based Architecture',
    description:
      'Code is organized by business features/domains. Each feature contains all related code.',
    pros: [
      'High cohesion within features',
      'Easy to add/remove features',
      'Better for larger teams',
    ],
    cons: [
      'Shared code management can be tricky',
      'May have some duplication',
      'Requires good feature boundaries',
    ],
    bestFor: 'Medium to large applications, multiple teams, complex domains',
  },
  {
    id: 'atomic-design',
    name: 'Atomic Design',
    description:
      'UI components organized in hierarchy: Atoms → Molecules → Organisms → Templates → Pages.',
    pros: [
      'Promotes reusability',
      'Clear component hierarchy',
      'Great for design systems',
    ],
    cons: [
      'Can be over-engineered for simple apps',
      'Learning curve for naming',
      'Atoms can become too granular',
    ],
    bestFor: 'Design systems, component libraries, UI-heavy applications',
  },
  {
    id: 'microfrontends',
    name: 'Microfrontends',
    description:
      'Frontend split into multiple independently deployable applications that compose together.',
    pros: ['Independent deployment', 'Technology flexibility', 'Team autonomy'],
    cons: [
      'Complex infrastructure',
      'Performance overhead',
      'Consistency challenges',
    ],
    bestFor: 'Large organizations, multiple teams, legacy migration',
  },
  {
    id: 'clean-architecture',
    name: 'Clean Architecture',
    description:
      'Layered approach with domain at center, adapters around it, and frameworks at edges.',
    pros: [
      'Framework independence',
      'Testable business logic',
      'Clear boundaries',
    ],
    cons: [
      'More boilerplate',
      'Steeper learning curve',
      'Can be overkill for simple apps',
    ],
    bestFor:
      'Complex business logic, long-lived applications, enterprise software',
  },
  {
    id: 'hexagonal',
    name: 'Hexagonal Architecture (Ports & Adapters)',
    description:
      'Core domain is isolated from external concerns through ports (interfaces) and adapters (implementations). Primary adapters drive the application, secondary adapters are driven by it.',
    pros: [
      'Complete isolation of business logic',
      'Easy to swap implementations (DB, UI, APIs)',
      'Highly testable - mock adapters for testing',
      'Clear dependency direction (outside → inside)',
    ],
    cons: [
      'More interfaces and abstractions',
      'Can feel over-engineered for simple CRUD',
      'Requires discipline to maintain boundaries',
      'Learning curve for the ports/adapters concept',
    ],
    bestFor:
      'Applications with complex business rules, systems requiring multiple interfaces (web, CLI, API), long-term maintainability',
  },
  {
    id: 'vertical-slice',
    name: 'Vertical Slice Architecture',
    description:
      'Code is organized by features/slices that cut vertically through all layers. Each slice contains UI, business logic, and data access for a single feature.',
    pros: [
      'High cohesion - all feature code together',
      'Easy to understand feature scope',
      'Minimal coupling between features',
      'Simple to add/remove features',
      'Each slice can use different patterns',
    ],
    cons: [
      'Some code duplication across slices',
      'Shared behavior needs careful planning',
      'Can diverge in implementation styles',
      'Cross-cutting concerns need strategy',
    ],
    bestFor:
      'CQRS applications, teams working on separate features, applications with distinct bounded contexts',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function LearnPage() {
  useEffect(() => {
    document.title = 'FAS | Learn';
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">
              Learn Architecture Patterns
            </h1>
          </div>
          <p className="text-text-secondary max-w-2xl">
            Explore different frontend architecture patterns, understand their
            trade-offs, and learn when to use each one.
          </p>
        </motion.div>

        {/* Patterns */}
        <motion.div variants={itemVariants} className="space-y-6">
          {architecturePatterns.map((pattern) => (
            <Card key={pattern.id} variant="bordered" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle as="h2">{pattern.name}</CardTitle>
                  <Badge variant={pattern.id as any} size="sm">
                    {pattern.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-text-primary">{pattern.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pros */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-success">Pros</h4>
                    <ul className="space-y-1">
                      {pattern.pros.map((pro, i) => (
                        <li
                          key={i}
                          className="text-sm text-text-secondary flex items-start gap-2"
                        >
                          <span className="text-success mt-0.5">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-error">Cons</h4>
                    <ul className="space-y-1">
                      {pattern.cons.map((con, i) => (
                        <li
                          key={i}
                          className="text-sm text-text-secondary flex items-start gap-2"
                        >
                          <span className="text-error mt-0.5">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-400">
                  <p className="text-sm">
                    <span className="font-medium text-text-primary">
                      Best for:{' '}
                    </span>
                    <span className="text-text-secondary">
                      {pattern.bestFor}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Resources */}
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResourceLink
              title="React Architecture Patterns"
              description="Official React documentation on project structure"
              href="https://react.dev/learn/thinking-in-react"
            />
            <ResourceLink
              title="Micro Frontends"
              description="In-depth guide to micro frontend architectures"
              href="https://micro-frontends.org/"
            />
            <ResourceLink
              title="Clean Architecture"
              description="Robert C. Martin's Clean Architecture principles"
              href="https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"
            />
            <ResourceLink
              title="Atomic Design"
              description="Brad Frost's methodology for design systems"
              href="https://atomicdesign.bradfrost.com/"
            />
            <ResourceLink
              title="Hexagonal Architecture"
              description="Alistair Cockburn's Ports and Adapters pattern"
              href="https://alistair.cockburn.us/hexagonal-architecture/"
            />
            <ResourceLink
              title="Vertical Slice Architecture"
              description="Jimmy Bogard's approach to feature-based slices"
              href="https://www.jimmybogard.com/vertical-slice-architecture/"
            />
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function ResourceLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <Card
        variant="bordered"
        className="h-full hover:border-primary/50 transition-colors group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-text-muted flex-shrink-0 group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </a>
  );
}
