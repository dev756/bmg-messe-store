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

export async function createOrder(orderData: any): Promise<{ paymentUrl: string }> {
  if (USE_MOCK_API) {
    await mockCreateOrder(orderData);
    return { 
      paymentUrl: `https://example.com/payment/${orderData.orderNumber}`
    };
  }

  try {
    const formData = new FormData();
    formData.append('orderNumber', orderData.orderNumber);
    formData.append('email', orderData.customer.email);
    formData.append('firstName', orderData.customer.firstName);
    formData.append('lastName', orderData.customer.lastName);
    formData.append('token', 'XT4RSerZNG7mStjdTJm8r9W3rq');
    formData.append('city', orderData.customer.city);
    formData.append('zipCode', orderData.customer.zipCode);
    formData.append('address', orderData.customer.address);
    formData.append('country', orderData.customer.country);
    if(orderData.transactionId) {
      formData.append('transactionId', orderData.transactionId);
    }
    
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
    
    const data = await response.json();
    return { 
      paymentUrl: data.paymentUrl || `${API_BASE_URL}/payment/${orderData.orderNumber}`
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function checkPassword(password: string): Promise<boolean> {
  if (USE_MOCK_API) {
    return password === 'test';
  }

  try {
    const formData = new FormData();
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/Actindo.Modules.Actindo.POS.ClickAndCollectShop.checkPassword`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to check password');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking password:', error);
    throw error;
  }
} 