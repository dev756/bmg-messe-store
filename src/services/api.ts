import type { Product } from '../types';
import { fetchProducts as mockFetchProducts, createOrder as mockCreateOrder } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const USE_MOCK_API = import.meta.env.DEV;

export async function fetchProducts(): Promise<Product[]> {
  if (USE_MOCK_API) {
    return mockFetchProducts();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function createOrder(orderData: any): Promise<{ orderNumber: string }> {
  if (USE_MOCK_API) {
    return mockCreateOrder(orderData);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
} 