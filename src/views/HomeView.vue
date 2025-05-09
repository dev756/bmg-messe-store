<template>
  <div class="home">
    <h1>Unsere Produkte</h1>
    <div v-if="productStore.isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Produkte werden geladen...</p>
    </div>
    <div v-else-if="productStore.error" class="error">
      <p>Fehler beim Laden der Produkte. Bitte versuchen Sie es später erneut.</p>
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
              <p class="stock" :class="{ 'low-stock': (product.stockLevel ?? 0) <= 5 }">
                {{ (product.stockLevel ?? 0) === 0 ? 'Leider kein Bestand mehr' : (product.stockLevel ?? 0) <= 5 ? 'Nur noch ' + (product.stockLevel ?? 0) + ' verfügbar' : 'Auf Lager' }}
              </p>
            </div>
          </div>
        </router-link>
        <button
          class="add-to-cart"
          :disabled="(product.stockLevel ?? 0) === 0"
          @click="addToCart(product, $event)"
        >
          {{ (product.stockLevel ?? 0) === 0 ? 'Leider ausverkauft' : 'In den Warenkorb' }}
        </button>
      </div>
    </div>
    <AddToCartAnimation
      v-if="showAnimation && animationProduct"
      :image-url="animationProduct.imageUrl || ''"
      :product-name="animationProduct.name || ''"
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import Toast from '../components/Toast.vue';
import AddToCartAnimation from '../components/AddToCartAnimation.vue';
import type { Product } from '../types';

const productStore = useProductStore();
const cartStore = useCartStore();
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');
let refreshInterval: number;

// Animation state
const showAnimation = ref(false);
const animationProduct = ref<Product | null>(null);
const animationStart = ref({ x: 0, y: 0 });
const animationEnd = ref({ x: 0, y: 0 });

function addToCart(product: Product, event: MouseEvent) {
  const success = cartStore.addToCart(product);
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
      x: buttonRect.left + buttonRect.width / 2 - 30, // Center the 60px wide animation
      y: buttonRect.top + buttonRect.height / 2 - 30
    };
    animationEnd.value = {
      x: cartRect.left + cartRect.width / 2 - 30,
      y: cartRect.top + cartRect.height / 2 - 30
    };

    // Start animation
    animationProduct.value = product;
    showAnimation.value = true;

    // Reset animation after it completes
    setTimeout(() => {
      showAnimation.value = false;
      animationProduct.value = null;
    }, 800);

    toastMessage.value = `${product.name} zum Warenkorb hinzugefügt`;
    toastType.value = 'success';
  } else {
    toastMessage.value = 'Kann nicht mehr Artikel als verfügbar hinzufügen';
    toastType.value = 'error';
  }
  showToast.value = true;
}

onMounted(async () => {
  await productStore.loadProducts();
  // Refresh products every minute
  refreshInterval = window.setInterval(() => {
    productStore.loadProducts();
  }, 60000); // 60000 ms = 1 minute
});

onUnmounted(() => {
  // Clean up the interval when component is unmounted
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.home {
  padding: 0 0.5rem;
  text-align: center;
  width: 100%;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0rem 0 2rem;
  color: var(--text-color);
  padding: 0 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  padding: 0;
}

@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1000px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.product-card {
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 200px;
  margin: 0 auto;
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
  padding-top: 100%;
  overflow: hidden;
  background-color: white;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  padding: 0.5rem;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 80px;
  background-color: var(--background-light);
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em; /* Ensures consistent height for 2 lines */
}

.product-details {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.5rem;
}

.price {
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 600;
  margin: 0;
}

.stock {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.8rem;
}

.low-stock {
  color: #e57373;
}

.add-to-cart {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.5rem;
  border-radius: 0 0 8px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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