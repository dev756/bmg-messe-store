export interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockLevel: number;
}

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stockLevel: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Order {
  orderNumber: string;
  items: {
    sku: string;
    quantity: number;
  }[];
  customer: Customer;
  paymentMethod: 'pay_now' | 'pay_in_store';
  totalPrice: number;
} 