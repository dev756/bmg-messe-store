<template>
  <div class="home">
    <h1>Unsere VIP Produkte</h1>
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
            <img :src="product.imageUrls[0]" :alt="product.name" />
          </div>
          <div class="product-info">
            <h2 class="product-name">{{ product.name }}</h2>
            <div class="product-details">
              <PriceDisplay :price="product.price" :special-price="product.specialPrice" />
            </div>
          </div>
        </router-link>
        <p class="stock" :class="{ 'low-stock': getStockLevel(product) <= 5 && getStockLevel(product) > 0 }">
          {{ getStockMessage(product) }}
        </p>
        <button
          class="add-to-cart"
          :disabled="!productStore.hasAnyStock(product) || product.hasVariants"
          @click="product.hasVariants ? navigateToProduct(product.sku, $event) : addToCart(product, $event)"
        >
          {{ getButtonText(product) }}
        </button>
      </div>
    </div>
    <AddToCartAnimation
      v-if="showAnimation && animationProduct"
      :image-url="animationProduct.imageUrls?.[0] || ''"
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
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import Toast from '../components/Toast.vue';
import AddToCartAnimation from '../components/AddToCartAnimation.vue';
import PriceDisplay from '../components/PriceDisplay.vue';
import type { Product } from '../types';

const router = useRouter();
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

// Helper functions for stock display
function getStockLevel(product: Product): number {
  return productStore.getTotalAvailableStock(product);
}

function getStockMessage(product: Product): string {
  const stockLevel = getStockLevel(product);

  if (stockLevel === 0) {
    return 'Leider kein Bestand mehr';
  }

  if (product.hasVariants) {
    // For variant products, just show "Available" or stock count
    return stockLevel <= 5 ? `Nur noch ${stockLevel} verfügbar` : 'Auf Lager';
  }

  return stockLevel <= 5 ? `Nur noch ${stockLevel} verfügbar` : 'Auf Lager';
}

function getButtonText(product: Product): string {
  const stockLevel = getStockLevel(product);

  if (stockLevel === 0) {
    return 'Leider ausverkauft';
  }

  if (product.hasVariants) {
    return 'Optionen wählen';
  }

  return 'In den Warenkorb';
}

function navigateToProduct(sku: string, event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  router.push(`/product/${sku}`);
}

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
  // Load products from localStorage
  await productStore.loadProducts();
  
  // Trigger immediate background refresh
  productStore.refreshProductsInBackground();
  
  // Start background refresh interval
  refreshInterval = window.setInterval(() => {
    productStore.refreshProductsInBackground();
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
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  padding: 0;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.product-card {
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.15s ease-in-out;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-shadow: var(--shadow-sm);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-color);
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 100px;
  background-color: var(--background-light);
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
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
  font-size: 0.85rem;
  padding: 0.25rem 1rem 0.5rem 1rem;
  background-color: var(--background-light);
}

.low-stock {
  color: #e57373;
}

.add-to-cart {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 0 0 8px 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;
  margin-top: 0;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
}

.add-to-cart:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.out-of-stock {
  color: #ff4444;
  font-weight: bold;
  margin-top: 0.5rem;
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