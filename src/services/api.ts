import type { Product } from '../types';
import { fetchProducts as mockFetchProducts, createOrder as mockCreateOrder } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function fetchProducts(): Promise<Product[]> {
  if (USE_MOCK_API) {
    return mockFetchProducts();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Actindo.Modules.Actindo.POS.ClickAndCollectShop.getOffers`);
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
    const formData = new FormData();
    formData.append('orderNumber', orderData.orderNumber);
    formData.append('email', orderData.customer.email);
    formData.append('firstName', orderData.customer.firstName);
    formData.append('lastName', orderData.customer.lastName);
    formData.append('token', 'XT4RSerZNG7mStjdTJm8r9W3rq');
    
    // Add line items
    orderData.items.forEach((item, index) => {
      formData.append(`lineItems[${index}][sku]`, item.sku);
      formData.append(`lineItems[${index}][quantity]`, item.quantity.toString());
    });

    const response = await fetch(`${API_BASE_URL}/Actindo.Modules.Actindo.POS.ClickAndCollectShop.placeOrder`, {
      method: 'POST',
      body: formData
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