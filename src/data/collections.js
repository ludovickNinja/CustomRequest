export const collections = [
  {
    id: 'crownring',
    label: 'CrownRing · Bleu Royale · Carlex · Torque',
    shortLabel: 'CrownRing Collection',
    tagline: 'Modern. Bold. Distinctive.',
    subline: 'Explore CrownRing, Bleu Royale, Carlex & Torque',
    image: '/images/crownring-hero.jpg',
    logo: '/images/crownring-logo.svg',
  },
  {
    id: 'noam-carver',
    label: 'Noam Carver Collection',
    shortLabel: 'Noam Carver Collection',
    tagline: 'Timeless. Elegant. Refined.',
    subline: 'Explore the Noam Carver Collection',
    image: '/images/noam-carver-hero.jpg',
    logo: '/images/noam-carver-logo.svg',
  },
  {
    id: 'mia-my-caroline',
    label: 'MFit® My Caroline® Collection',
    shortLabel: 'MFit® My Caroline®',
    tagline: 'Romantic. Feminine. Forever.',
    subline: 'Explore the Mia® My Caroline® Collection',
    image: '/images/mia-hero.jpg',
    logo: '/images/mia-logo.svg',
  },
];

export const fullCustom = {
  id: 'full-custom',
  label: 'Full Custom Request',
  shortLabel: 'Full Custom Request',
  tagline: 'Designed entirely by you.',
  subline: 'Create a completely custom ring from scratch with our experts.',
  image: '/images/full-custom-hero.jpg',
  logo: '/images/pencil.svg',
};

export function findCollection(id) {
  if (!id) return null;
  if (id === fullCustom.id) return fullCustom;
  return collections.find((c) => c.id === id) || null;
}
