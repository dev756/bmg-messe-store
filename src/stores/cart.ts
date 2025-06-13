import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { CartItem, Product } from '../types';

const CART_STORAGE_KEY = 'mcshop-cart';

// Load initial cart data from localStorage
const loadCartFromStorage = (): CartItem[] => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) return [];
  
  const cartItems = JSON.parse(savedCart) as CartItem[];
  
  // Handle migration for existing cart items that don't have originalPrice
  return cartItems.map(item => ({
    ...item,
    originalPrice: item.originalPrice ?? item.price // Use existing price as originalPrice if not present
  }));
};

// Utility function to get the effective price (specialPrice if available, otherwise price)
export function getEffectivePrice(product: Product): number {
  return product.specialPrice ?? product.price;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCartFromStorage());

  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  // Watch for changes in items and save to localStorage
  watch(items, (newItems) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  }, { deep: true });

  function canAddToCart(product: Product): boolean {
    const existingItem = items.value.find(item => item.sku === product.sku);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const stockLevel = product.stockLevel ?? 0;
    return currentQuantity < stockLevel;
  }

  function addToCart(product: Product): boolean {
    if (!canAddToCart(product)) {
      return false;
    }

    const existingItem = items.value.find(item => item.sku === product.sku);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      // Use the effective price when adding to cart
      const effectivePrice = getEffectivePrice(product);
      items.value.push({ 
        ...product, 
        price: effectivePrice, // Store the effective price in cart
        originalPrice: product.price, // Store the original price for comparison
        quantity: 1 
      });
    }
    return true;
  }

  function removeFromCart(sku: string) {
    const index = items.value.findIndex(item => item.sku === sku);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(sku: string, quantity: number) {
    const item = items.value.find(item => item.sku === sku);
    if (item && quantity > 0) {
      const stockLevel = item.stockLevel ?? 0;
      if (quantity <= stockLevel) {
        item.quantity = quantity;
      }
    }
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    canAddToCart
  };
}); 