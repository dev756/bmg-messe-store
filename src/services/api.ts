import type { Product } from '../types';
import { fetchProducts as mockFetchProducts, createOrder as mockCreateOrder } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

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
    const orderNumber = await mockCreateOrder(orderData);
    return { orderNumber };
  }

  try {
    const payload = {
      orderNumber: orderData.orderNumber,
      email: orderData.customer.email,
      name: orderData.customer.name,
      token: "XT4RSerZNG7mStjdTJm8r9W3rq",
      lineItems: orderData.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))
    };

    const response = await fetch(`${API_BASE_URL}/Actindo.Modules.Actindo.POS.ClickAndCollectShop.placeOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    return { orderNumber: orderData.orderNumber };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
} 