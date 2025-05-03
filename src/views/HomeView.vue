<template>
  <div class="home">
    <h1>Our Menu</h1>
    <div class="products-grid">
      <div v-for="product in products" :key="product.sku" class="product-card">
        <router-link :to="`/product/${product.sku}`" class="product-link">
          <img :src="product.imageUrl" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h2>{{ product.name }}</h2>
            <p class="price">${{ product.price.toFixed(2) }}</p>
            <p v-if="product.stockLevel === 0" class="out-of-stock">Out of Stock</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchProducts } from '../services/api';
import type { Product } from '../types';

const products = ref<Product[]>([]);

onMounted(async () => {
  try {
    products.value = await fetchProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
});
</script>

<style scoped>
.home {
  padding: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.price {
  font-weight: bold;
  color: #ffc72c;
  margin: 0.5rem 0;
}

.out-of-stock {
  color: #ff4444;
  font-weight: bold;
}
</style> 