/**
 * Demo pricing — edit here to change what the pricing section shows.
 * Payments are not integrated yet.
 */
export const pricingNote = 'Pricing shown is demo content and can be changed from configuration.';

export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    period: 'month',
    description: 'For independent instructors getting started with monitoring.',
    features: ['3 learners', '5 test centres', 'Basic monitoring', 'Dashboard alerts', 'Slot history'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    period: 'month',
    description: 'For busy instructors managing a full diary of learners.',
    features: ['15 learners', 'Multiple centres', 'Advanced filters', 'Instant alerts', 'Monitoring history', 'Priority features'],
    cta: 'Get Started',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    period: 'month',
    description: 'For driving schools coordinating teams and many learners.',
    features: ['Unlimited learners', 'Multiple users', 'Advanced monitoring controls', 'Analytics', 'Team management', 'Priority support'],
    cta: 'Get Started',
    highlighted: false,
  },
];
