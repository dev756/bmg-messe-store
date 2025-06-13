export interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  specialPrice?: number;
  imageUrl: string;
  stockLevel: number;
}

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string;
  stockLevel: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface Order {
  orderNumber: string;
  items: {
    sku: string;
    quantity: number;
  }[];
  customer: Customer;
} 