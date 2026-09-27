import portraitImg from '../assets/images/sample_portrait_1790544556730.jpg';
import sneakerImg from '../assets/images/sample_sneaker_1790544566669.jpg';
import bottleImg from '../assets/images/sample_bottle_1790544576895.jpg';
import petImg from '../assets/images/sample_pet_1790544587206.jpg';

export interface SampleImageItem {
  id: string;
  title: string;
  category: string;
  url: string;
  width: number;
  height: number;
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-portrait',
    title: 'Executive Portrait',
    category: 'Portrait & Hair',
    url: portraitImg,
    width: 1024,
    height: 768,
  },
  {
    id: 'sample-sneaker',
    title: 'Streetwear Sneaker',
    category: 'E-Commerce Product',
    url: sneakerImg,
    width: 1024,
    height: 768,
  },
  {
    id: 'sample-bottle',
    title: 'Cosmetics Dropper',
    category: 'Glass & Reflection',
    url: bottleImg,
    width: 1024,
    height: 768,
  },
  {
    id: 'sample-pet',
    title: 'Golden Retriever',
    category: 'Fine Animal Fur',
    url: petImg,
    width: 1024,
    height: 768,
  },
];
