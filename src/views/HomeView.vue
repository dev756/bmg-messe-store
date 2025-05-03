<template>
  <div class="home">
    <h1>Our Products</h1>
    <div v-if="productStore.isLoading" class="loading">
      Loading products...
    </div>
    <div v-else-if="productStore.error" class="error">
      {{ productStore.error }}
    </div>
    <div v-else class="products-grid">
      <div
        v-for="product in productStore.products"
        :key="product.sku"
        class="product-card"
      >
        <router-link :to="`/product/${product.sku}`" class="product-link">
          <div class="product-image">
            <img :src="product.imageUrl" :alt="product.name" />
          </div>
          <div class="product-info">
            <h2 class="product-name">{{ product.name }}</h2>
            <div class="product-details">
              <p class="price">CHF {{ product.price.toFixed(2) }}</p>
              <p class="stock" :class="{ 'low-stock': product.stockLevel <= 5 }">
                {{ product.stockLevel === 0 ? 'Out of Stock' : `${product.stockLevel} in stock` }}
              </p>
            </div>
          </div>
        </router-link>
        <button
          class="add-to-cart"
          :disabled="!canAddToCart(product)"
          @click="addToCart(product)"
        >
          {{ getButtonText(product) }}
        </button>
      </div>
    </div>
    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import Toast from '../components/Toast.vue';
import { ref } from 'vue';
import type { Product } from '../types';

const productStore = useProductStore();
const cartStore = useCartStore();
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

onMounted(async () => {
  await productStore.loadProducts();
});

function canAddToCart(product: Product): boolean {
  return cartStore.canAddToCart(product);
}

function getButtonText(product: Product): string {
  if (product.stockLevel === 0) return 'Out of Stock';
  const currentQuantity = cartStore.items.find(item => item.sku === product.sku)?.quantity || 0;
  return currentQuantity > 0 ? `Add Another (${currentQuantity} in cart)` : 'Add to Cart';
}

function addToCart(product: Product): void {
  const success = cartStore.addToCart(product);
  if (success) {
    toastMessage.value = `${product.name} added to cart`;
    toastType.value = 'success';
  } else {
    toastMessage.value = 'Cannot add more items than available in stock';
    toastType.value = 'error';
  }
  showToast.value = true;
}
</script>

<style scoped>
.home {
  padding: 0;
  text-align: center;
  width: 100%;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 2rem 0 2rem;
  color: var(--text-color);
  padding: 0 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  padding: 0;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-link {
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Creates a 1:1 aspect ratio */
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 120px; /* Ensure consistent height for product info */
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-color);
  line-height: 1.4;
  /* Allow up to 2 lines of text */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-details {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price {
  font-size: 1.1rem;
  color: var(--primary-color);
  font-weight: 600;
  margin: 0;
}

.stock {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.low-stock {
  color: #e57373;
}

.add-to-cart {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 1rem;
  border-radius: 0 0 12px 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  margin-top: auto;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #333;
}

.add-to-cart:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.out-of-stock {
  color: #ff4444;
  font-weight: bold;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }

  .product-image {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 280px;
  }
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.error {
  color: #e57373;
}
</style> 