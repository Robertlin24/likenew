export type ServiceOption = {
  id: string;
  name: string;
  description: string;
  cans: number;
  price: number;
  popular?: boolean;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'basic',
    name: 'Basic Clean',
    description: 'Quick exterior wash and deodorizing rinse.',
    cans: 1,
    price: 25,
  },
  {
    id: 'standard',
    name: 'Standard Clean',
    description: 'Deep wash with high-pressure rinse.',
    cans: 2,
    price: 50,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Clean',
    description: 'Deep wash, sanitize, and fresh scent.',
    cans: 3,
    price: 60,
  },
];

export const getServiceByCans = (cans?: number) =>
  SERVICE_OPTIONS.find((service) => service.cans === cans) ?? SERVICE_OPTIONS[0];
