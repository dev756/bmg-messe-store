export interface Product {
  sku: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stockLevel: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
}

export interface Order {
  orderNumber: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  paymentMethod: 'immediate' | 'pickup';
} 