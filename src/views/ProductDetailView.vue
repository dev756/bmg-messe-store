<template>
  <div class="product-detail" v-if="product">
    <div class="product-container">
      <div class="product-image">
        <img :src="product.imageUrl" :alt="product.name" />
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="price">${{ product.price.toFixed(2) }}</p>
        <p class="description">{{ product.description }}</p>
        <div class="stock-info">
          <p :class="{ 'out-of-stock': product.stockLevel === 0 }">
            {{ product.stockLevel === 0 ? 'Out of Stock' : `In Stock: ${product.stockLevel}` }}
          </p>
        </div>
        <button 
          @click="addToCart" 
          :disabled="product.stockLevel === 0"
          class="add-to-cart-btn"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Loading...
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchProducts } from '../services/api';
import { useCartStore } from '../stores/cart';
import type { Product } from '../types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const product = ref<Product | null>(null);

onMounted(async () => {
  try {
    const products = await fetchProducts();
    const foundProduct = products.find(p => p.sku === route.params.sku);
    
    if (foundProduct) {
      product.value = foundProduct;
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Failed to load product:', error);
  }
});

function addToCart() {
  if (product.value) {
    cartStore.addToCart(product.value);
  }
}
</script>

<style scoped>
.product-detail {
  padding: 2rem;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-info h1 {
  margin: 0;
  color: #333;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffc72c;
}

.description {
  color: #666;
  line-height: 1.6;
}

.stock-info {
  margin: 1rem 0;
}

.out-of-stock {
  color: #ff4444;
  font-weight: bold;
}

.add-to-cart-btn {
  background-color: #ffc72c;
  color: #27251f;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #ffd54f;
}

.add-to-cart-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
}
</style> 