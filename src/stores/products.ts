import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { fetchProducts } from '../services/api';
import type { Product } from '../types';

const PRODUCTS_STORAGE_KEY = 'mcshop-products';

// Load initial products data from localStorage
const loadProductsFromStorage = (): Product[] => {
  const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  return savedProducts ? JSON.parse(savedProducts) as Product[] : [];
};

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>(loadProductsFromStorage());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Watch for changes in products and save to localStorage
  watch(products, (newProducts) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
  }, { deep: true });

  async function loadProducts() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const fetchedProducts = await fetchProducts();
      products.value = fetchedProducts;
    } catch (e) {
      error.value = 'Failed to load products';
      console.error('Error loading products:', e);
    } finally {
      isLoading.value = false;
    }
  }

  // Background refresh that only updates localStorage
  async function refreshProductsInBackground() {
    try {
      const fetchedProducts = await fetchProducts();
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(fetchedProducts));
    } catch (e) {
      console.error('Error refreshing products:', e);
    }
  }

  function updateStockLevel(sku: string, quantity: number) {
    const product = products.value.find(p => p.sku === sku);
    if (product) {
      product.stockLevel -= quantity;
    }
  }

  function getProduct(sku: string): Product | undefined {
    return products.value.find(p => p.sku === sku);
  }

  return {
    products,
    isLoading,
    error,
    loadProducts,
    refreshProductsInBackground,
    updateStockLevel,
    getProduct
  };
}); 