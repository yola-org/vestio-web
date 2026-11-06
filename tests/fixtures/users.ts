export const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
};

export const mockProfile = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+212600000000',
};

export const mockCategories = [
  {
    id: 1,
    name: 'Femme',
    slug: 'femme',
    subCategories: [
      { id: 11, name: 'Robes', slug: 'robes' },
      { id: 12, name: 'Tops', slug: 'tops' },
    ],
  },
  {
    id: 2,
    name: 'Homme',
    slug: 'homme',
    subCategories: [
      { id: 21, name: 'T-shirts', slug: 't-shirts' },
    ],
  },
];

export const mockCities = [
  { id: 1, name: 'Casablanca' },
  { id: 2, name: 'Rabat' },
  { id: 3, name: 'Marrakech' },
];
