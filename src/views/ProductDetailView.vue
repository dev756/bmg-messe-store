<template>
  <div class="product-detail">
    <div v-if="productStore.isLoading" class="loading">
      Produktdetails laden...
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
        <p class="price">CHF {{ product.price.toFixed(2) }}</p>
        <div class="description" v-html="product.description"></div>
        <p class="stock" :class="{ 'low-stock': (product.stockLevel ?? 0) <= 5 }">
          {{ (product.stockLevel ?? 0) === 0 ? 'Leider kein Bestand mehr' : (product.stockLevel ?? 0) <= 5 ? 'Nur noch wenige verfügbar' : 'Auf Lager' }}
        </p>
        <button
          class="add-to-cart"
          :disabled="!canAddToCart"
          @click="addToCart($event)"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div v-else class="error">
      Produkt nicht gefunden
    </div>
    <AddToCartAnimation
      v-if="showAnimation && product"
      :image-url="product.imageUrl"
      :product-name="product.name"
      :start-position="animationStart"
      :end-position="animationEnd"
    />
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
import AddToCartAnimation from '../components/AddToCartAnimation.vue';
import type { Product } from '../types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Animation state
const showAnimation = ref(false);
const animationStart = ref({ x: 0, y: 0 });
const animationEnd = ref({ x: 0, y: 0 });

const product = computed(() => {
  const sku = route.params.sku as string;
  return productStore.getProduct(sku);
});

const canAddToCart = computed(() => {
  if (!product.value) return false;
  return cartStore.canAddToCart(product.value);
});

const buttonText = computed(() => {
  if (!product.value) return 'Hinzufügen';
  if ((product.value.stockLevel ?? 0) === 0) return 'Leider ausverkauft';
  const currentQuantity = cartStore.items.find(item => item.sku === product.value?.sku)?.quantity || 0;
  return currentQuantity > 0 ? `+1 hinzufügen (${currentQuantity} im Warenkorb)` : 'Hinzufügen';
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

function addToCart(event: MouseEvent) {
  if (product.value) {
    const success = cartStore.addToCart(product.value);
    if (success) {
      // Get the button position
      const button = event.currentTarget as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      
      // Get the cart icon position (assuming it's in the header)
      const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
      const cartRect = cartIcon?.getBoundingClientRect() || { 
        left: window.innerWidth - 100, 
        top: 20,
        width: 40,
        height: 40
      };

      // Set animation positions
      animationStart.value = {
        x: buttonRect.left + buttonRect.width / 2 - 30,
        y: buttonRect.top + buttonRect.height / 2 - 30
      };
      animationEnd.value = {
        x: cartRect.left + cartRect.width / 2 - 30,
        y: cartRect.top + cartRect.height / 2 - 30
      };

      // Start animation
      showAnimation.value = true;

      // Reset animation after it completes
      setTimeout(() => {
        showAnimation.value = false;
      }, 800);

      toastMessage.value = `${product.value.name} zum Warenkorb hinzugefügt`;
      toastType.value = 'success';
    } else {
      toastMessage.value = 'Kann nicht mehr hinzufügen als im Lager vorhanden';
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