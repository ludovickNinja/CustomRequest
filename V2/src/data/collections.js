export const collections = [
  {
    id: 'crownring',
    label: 'CrownRing · Bleu Royale · Carlex · Torque',
    shortLabel: 'CrownRing Collection',
    tagline: 'Modern. Bold. Distinctive.',
    subline: 'Explore CrownRing, Bleu Royale, Carlex & Torque',
    image: 'https://www.crownring.com/b2b/images/homeBanners/b2b_CX2023_Us.jpg',
    logo: 'https://www.crownring.com/b2b/images/homeBanners/b2b_CX2023_Us.jpg',
  },
  {
    id: 'noam-carver',
    label: 'Noam Carver Collection',
    shortLabel: 'Noam Carver Collection',
    tagline: 'Timeless. Elegant. Refined.',
    subline: 'Explore the Noam Carver Collection',
    image: 'https://www.crownring.com/b2b/images/homeBanners/b2b_NC2023_Us.jpg',
    logo: 'https://www.crownring.com/b2b/images/homeBanners/b2b_NC2023_Us.jpg',
  },
  {
    id: 'mia-my-caroline',
    label: 'MFit® My Caroline® Collection',
    shortLabel: 'MFit® My Caroline®',
    tagline: 'Romantic. Feminine. Forever.',
    subline: 'Explore the MFit® My Caroline® Collection',
    image: 'https://www.crownring.com/b2b/images/homeBanners/b2b_MFIT2023_Us.jpg',
    logo: 'https://www.crownring.com/b2b/images/homeBanners/b2b_MFIT2023_Us.jpg',
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
