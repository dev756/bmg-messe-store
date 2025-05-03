import type { Product } from '../types';

const mockProducts: Product[] = [
  {
    sku: 'BIG-MAC',
    name: 'Big Mac',
    price: 4.99,
    description: 'Two 100% pure beef patties and a slice of cheese, topped with lettuce, onions, pickles and our special sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stockLevel: 10
  },
  {
    sku: 'QUARTER-POUNDER',
    name: 'Quarter Pounder',
    price: 5.49,
    description: 'A quarter pound of 100% pure beef, topped with cheese, onions, pickles, mustard and ketchup.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stockLevel: 8
  },
  {
    sku: 'MCFLURRY',
    name: 'McFlurry',
    price: 3.99,
    description: 'Creamy vanilla soft serve with your choice of mix-ins.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stockLevel: 0
  },
  {
    sku: 'FRIES',
    name: 'French Fries',
    price: 2.99,
    description: 'World famous fries, crispy and golden.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    stockLevel: 15
  }
];

export async function fetchProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts;
}

export async function createOrder(orderData: any): Promise<{ orderNumber: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random order number
  const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return { orderNumber };
} 