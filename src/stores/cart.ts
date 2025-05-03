import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product } from '../types';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  function addToCart(product: Product) {
    const existingItem = items.value.find(item => item.sku === product.sku);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  }

  function removeFromCart(sku: string) {
    const index = items.value.findIndex(item => item.sku === sku);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(sku: string, quantity: number) {
    const item = items.value.find(item => item.sku === sku);
    if (item) {
      item.quantity = quantity;
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
    clearCart
  };
}); 