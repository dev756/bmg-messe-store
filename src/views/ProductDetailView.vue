<template>
  <div class="product-detail">
    <div v-if="productStore.isLoading" class="loading">
      Loading product details...
    </div>
    <div v-else-if="productStore.error" class="error">
      {{ productStore.error }}
    </div>
    <div v-else-if="product" class="product-content">
      <div class="product-image">
        <img :src="product.imageUrl" :alt="product.name" />
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>
        <p class="price">CHF {{ product.price.toFixed(2) }}</p>
        <p class="stock" :class="{ 'low-stock': product.stockLevel <= 5 }">
          {{ product.stockLevel === 0 ? 'Out of Stock' : `${product.stockLevel} in stock` }}
        </p>
        <button
          class="add-to-cart"
          :disabled="!canAddToCart"
          @click="addToCart"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div v-else class="error">
      Product not found
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useProductStore } from '../stores/products';
import Toast from '../components/Toast.vue';
import type { Product } from '../types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

const product = computed(() => {
  const sku = route.params.sku as string;
  return productStore.getProduct(sku);
});

const canAddToCart = computed(() => {
  if (!product.value) return false;
  return cartStore.canAddToCart(product.value);
});

const buttonText = computed(() => {
  if (!product.value) return 'Add to Cart';
  if (product.value.stockLevel === 0) return 'Out of Stock';
  const currentQuantity = cartStore.items.find(item => item.sku === product.value?.sku)?.quantity || 0;
  return currentQuantity > 0 ? `Add Another (${currentQuantity} in cart)` : 'Add to Cart';
});

onMounted(async () => {
  // Load products if not already loaded
  if (productStore.products.length === 0) {
    await productStore.loadProducts();
  }
  
  // Redirect to home if product not found
  if (!product.value) {
    router.push('/');
  }
});

function addToCart() {
  if (product.value) {
    const success = cartStore.addToCart(product.value);
    if (success) {
      toastMessage.value = `${product.value.name} added to cart`;
      toastType.value = 'success';
    } else {
      toastMessage.value = 'Cannot add more items than available in stock';
      toastType.value = 'error';
    }
    showToast.value = true;
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
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--background-light);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.product-image {
  position: relative;
  width: 400px;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin: 0 auto 2rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.product-image:hover img {
  transform: scale(1.05);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-info h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

.description {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1.1rem;
}

.stock-info {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--background-dark);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.stock-info p {
  margin: 0;
  font-weight: 500;
}

.out-of-stock {
  color: #ff4444;
  font-weight: bold;
}

.add-to-cart {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
  margin-top: 1rem;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.add-to-cart:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.error {
  color: #e57373;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }

  .product-info h1 {
    font-size: 2rem;
  }

  .price {
    font-size: 1.8rem;
  }

  .product-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    aspect-ratio: 1;
    margin-bottom: 2rem;
  }
}
</style> 