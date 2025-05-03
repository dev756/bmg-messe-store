import type { Product } from '../types';

const mockProducts: Product[] = [
  {
    sku: 'ks-001',
    name: 'Bergen Pro All Black',
    price: 119.00,
    description: 'The Classic watch combines timeless design with modern functionality. Featuring a stainless steel case, sapphire crystal glass, and a premium leather strap.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/0eaadf582f30f10491e85fff3838ae35.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 10
  },
  {
    sku: 'ks-002',
    name: 'Bergen Pro Sandstone',
    price: 119.00,
    description: 'The Sport watch is designed for active lifestyles. With water resistance up to 200m, a durable rubber strap, and a rotating bezel for timing functions.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/a2e1f45e9cdf1aa42da2d00c8dc63440.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 15
  },
  {
    sku: 'ks-003',
    name: 'Bergen Pro Muted Sage',
    price: 119.90,
    description: 'The Chronograph features a sophisticated movement with stopwatch functionality. The elegant design includes a tachymeter scale and multiple sub-dials.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/4aa5ff0f0b782b2495c40f9c8a3882ca.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 8
  },
  {
    sku: 'ks-004',
    name: 'Zurich Oversize Dark Tortoise Green',
    price: 119.90,
    description: 'The Automatic watch showcases a self-winding mechanical movement. With a transparent case back, you can admire the intricate inner workings.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/5b2720ada94ceb538169daced0d0845e.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 12
  },

];

export async function fetchProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts;
}

export async function createOrder(_orderData: any): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Generate a random order number
  return `KS-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
} 