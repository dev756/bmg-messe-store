<template>
  <div class="product-detail">
    <div v-if="productStore.isLoading" class="loading">
      Produktdetails laden...
    </div>
    <div v-else-if="productStore.error" class="error">
      {{ productStore.error }}
    </div>
    <div v-else-if="product" class="product-content">
      <div class="product-image-container">
        <div class="image-gallery">
          <!-- Previous arrow -->
          <button
            v-if="currentImages.length > 1"
            class="image-nav prev"
            @click="prevImage"
            aria-label="Previous image"
          >
            ‹
          </button>

          <div class="product-image" @click="openLightbox">
            <img :src="currentImage" :alt="product.name" />
            <!-- Image counter -->
            <div v-if="currentImages.length > 1" class="image-counter">
              {{ currentImageIndex + 1 }} / {{ currentImages.length }}
            </div>
          </div>

          <!-- Next arrow -->
          <button
            v-if="currentImages.length > 1"
            class="image-nav next"
            @click="nextImage"
            aria-label="Next image"
          >
            ›
          </button>
        </div>
        <!-- Thumbnail strip -->
        <div v-if="currentImages.length > 1" class="image-thumbnails">
          <button
            v-for="(img, index) in currentImages"
            :key="index"
            :class="['thumbnail', { active: index === currentImageIndex }]"
            @click="selectImage(index)"
          >
            <img :src="img" :alt="`${product.name} - Image ${index + 1}`" />
          </button>
        </div>
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <PriceDisplay
          :price="effectivePrice"
          :special-price="undefined"
          size="large"
        />

        <!-- Variant Selectors -->
        <div v-if="product.hasVariants && product.variantAttributes" class="variant-selectors">
          <div
            v-for="attribute in product.variantAttributes"
            :key="attribute.name"
            class="variant-selector"
          >
            <label>{{ attribute.name }}</label>
            <div class="variant-options">
              <button
                v-for="value in getAvailableValuesForAttribute(attribute.name)"
                :key="value"
                :class="['variant-option', {
                  'selected': selectedVariants[attribute.name] === value,
                  'out-of-stock': !isVariantAvailable(attribute.name, value)
                }]"
                :disabled="!isVariantAvailable(attribute.name, value)"
                @click="selectVariant(attribute.name, value)"
              >
                {{ value }}
              </button>
            </div>
          </div>
        </div>

        <!-- Customizations Section -->
        <ProductCustomizations
          v-if="product && hasCustomizations"
          ref="customizationsRef"
          :product="product"
          :selected-variants="selectedVariants"
          @update:customizations="handleCustomizationsUpdate"
          @validation-change="handleCustomizationsValidationChange"
        />

        <!-- Price Summary (shown when customizations are selected) -->
        <div v-if="hasSelectedCustomizations" class="price-summary">
          <div class="price-row">
            <span>Produktpreis:</span>
            <span>EUR {{ effectivePrice.toFixed(2) }}</span>
          </div>
          <div v-for="customization in selectedCustomizations" :key="customization.customizationId" class="price-row customization-row">
            <span>{{ customization.customizationName }}:</span>
            <span>EUR {{ customization.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="price-row total-row">
            <span>Gesamt:</span>
            <span>EUR {{ totalPriceWithCustomizations.toFixed(2) }}</span>
          </div>
        </div>

        <p class="stock" :class="{ 'low-stock': currentStock <= 5 }">
          <span v-if="currentStock === 0">Leider kein Bestand mehr</span>
          <span v-else-if="currentStock <= 5">Nur noch wenige verfügbar</span>
          <span v-else>Auf Lager</span>
        </p>
        <button
          class="add-to-cart"
          :disabled="!canAddToCart"
          @click="addToCart($event)"
        >
          {{ buttonText }}
        </button>

        <h2 class="product-info-heading">Produktinformation</h2>
        <div class="description" v-html="product.description"></div>
      </div>
    </div>
    <div v-else class="error">
      Produkt nicht gefunden
    </div>

    <!-- Image Lightbox -->
    <div
      v-if="isLightboxOpen"
      class="lightbox-overlay"
      @click="closeLightbox"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div class="lightbox-content" @click.stop>
        <!-- Previous arrow -->
        <button
          v-if="currentImages.length > 1"
          class="lightbox-nav prev"
          @click="prevImageLightbox"
          aria-label="Previous image"
        >
          ‹
        </button>

        <img :src="currentImage" :alt="product?.name" />

        <!-- Next arrow -->
        <button
          v-if="currentImages.length > 1"
          class="lightbox-nav next"
          @click="nextImageLightbox"
          aria-label="Next image"
        >
          ›
        </button>

        <!-- Image counter -->
        <div v-if="currentImages.length > 1" class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ currentImages.length }}
        </div>
      </div>
    </div>

    <AddToCartAnimation
      v-if="showAnimation && product"
      :image-url="currentImage"
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
import { useCartStore, generateCartItemId } from '../stores/cart';
import { useProductStore } from '../stores/products';
import Toast from '../components/Toast.vue';
import AddToCartAnimation from '../components/AddToCartAnimation.vue';
import PriceDisplay from '../components/PriceDisplay.vue';
import ProductCustomizations from '../components/ProductCustomizations.vue';
import type { Product, SelectedCustomization } from '../types';

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

// Variant selection state
const selectedVariants = ref<Record<string, string>>({});

// Customization state
const selectedCustomizations = ref<SelectedCustomization[]>([]);
const customizationsValid = ref(true);
const customizationsRef = ref<InstanceType<typeof ProductCustomizations> | null>(null);

// Image cycling state
const currentImageIndex = ref(0);

// Lightbox state
const isLightboxOpen = ref(false);

const product = computed(() => {
  const sku = route.params.sku as string;
  return productStore.getProduct(sku);
});

// Computed properties for current variant
const currentStock = computed(() => {
  if (!product.value) return 0;
  if (!product.value.hasVariants) return product.value.stockLevel ?? 0;
  return productStore.getVariantStock(product.value, selectedVariants.value);
});

const effectivePrice = computed(() => {
  if (!product.value) return 0;
  if (!product.value.hasVariants) return product.value.specialPrice ?? product.value.price;
  return productStore.getVariantPrice(product.value, selectedVariants.value);
});

// Customization pricing
const customizationTotalPrice = computed(() => {
  return selectedCustomizations.value.reduce((sum, c) => sum + c.totalPrice, 0);
});

const totalPriceWithCustomizations = computed(() => {
  return effectivePrice.value + customizationTotalPrice.value;
});

const hasCustomizations = computed(() => {
  if (!product.value) return false;
  const customizations = productStore.getEffectiveCustomizations(product.value, selectedVariants.value);
  return customizations.length > 0;
});

const hasSelectedCustomizations = computed(() => {
  return selectedCustomizations.value.length > 0;
});

const currentImages = computed(() => {
  if (!product.value) return [];
  if (!product.value.hasVariants) return product.value.imageUrls;
  return productStore.getVariantImages(product.value, selectedVariants.value);
});

const currentImage = computed(() => {
  const images = currentImages.value;
  if (images.length === 0) return '';
  return images[currentImageIndex.value] || images[0];
});

const canAddToCart = computed(() => {
  if (!product.value) return false;

  // Check if all required variants are selected
  if (product.value.hasVariants && product.value.variantAttributes) {
    const allSelected = product.value.variantAttributes.every(
      attr => selectedVariants.value[attr.name]
    );
    if (!allSelected) return false;
  }

  return cartStore.canAddToCart(product.value, selectedVariants.value);
});

const buttonText = computed(() => {
  if (!product.value) return 'Hinzufügen';

  if (product.value.hasVariants && product.value.variantAttributes) {
    const allSelected = product.value.variantAttributes.every(
      attr => selectedVariants.value[attr.name]
    );
    if (!allSelected) return 'Bitte Optionen wählen';
  }

  if (currentStock.value === 0) return 'Leider ausverkauft';

  const variantSku = product.value.hasVariants
    ? productStore.getVariantSku(product.value, selectedVariants.value)
    : product.value.sku;
  const cartItemId = generateCartItemId(variantSku, product.value.hasVariants ? selectedVariants.value : undefined);
  const currentQuantity = cartStore.items.find(item => item.cartItemId === cartItemId)?.quantity || 0;

  return currentQuantity > 0 ? `+1 hinzufügen (${currentQuantity} im Warenkorb)` : 'Hinzufügen';
});

// Get available values for a specific variant attribute based on current selections
function getAvailableValuesForAttribute(attributeName: string): string[] {
  if (!product.value || !product.value.variantAttributes || !product.value.variants) {
    return [];
  }

  const attribute = product.value.variantAttributes.find(attr => attr.name === attributeName);
  if (!attribute) return [];

  // First attribute in the array always shows all values (no filtering)
  const isFirstAttribute = product.value.variantAttributes[0].name === attributeName;
  if (isFirstAttribute) {
    return attribute.values;
  }

  // For subsequent attributes, filter based on selections from attributes that come before
  const attributeIndex = product.value.variantAttributes.findIndex(attr => attr.name === attributeName);
  const priorSelections: Record<string, string> = {};

  // Only consider selections from attributes that come before this one
  for (let i = 0; i < attributeIndex; i++) {
    const priorAttr = product.value.variantAttributes[i];
    if (selectedVariants.value[priorAttr.name]) {
      priorSelections[priorAttr.name] = selectedVariants.value[priorAttr.name];
    }
  }

  // Filter values that have at least one valid variant combination with prior selections
  return attribute.values.filter(value => {
    const testVariants = { ...priorSelections, [attributeName]: value };

    // Check if there's at least one variant that matches this combination
    return product.value!.variants!.some(variant => {
      return Object.keys(testVariants).every(key =>
        variant.attributes[key] === testVariants[key]
      );
    });
  });
}

onMounted(async () => {
  // Load products if not already loaded
  if (productStore.products.length === 0) {
    await productStore.loadProducts();
  }

  // Redirect to home if product not found
  if (!product.value) {
    router.push('/');
    return;
  }

  // Auto-select first available variant for each attribute
  if (product.value.hasVariants && product.value.variantAttributes) {
    product.value.variantAttributes.forEach(attr => {
      const availableValues = getAvailableValuesForAttribute(attr.name);
      const firstAvailable = availableValues.find(val =>
        isVariantCombinationAvailable({ ...selectedVariants.value, [attr.name]: val })
      );
      if (firstAvailable) {
        selectedVariants.value[attr.name] = firstAvailable;
      }
    });
  }
});

// Image cycling handlers
function nextImage() {
  if (currentImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % currentImages.value.length;
  }
}

function prevImage() {
  if (currentImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + currentImages.value.length) % currentImages.value.length;
  }
}

function selectImage(index: number) {
  currentImageIndex.value = index;
}

// Lightbox handlers
function openLightbox() {
  isLightboxOpen.value = true;
}

function closeLightbox() {
  isLightboxOpen.value = false;
}

function nextImageLightbox(event: MouseEvent) {
  event.stopPropagation();
  nextImage();
}

function prevImageLightbox(event: MouseEvent) {
  event.stopPropagation();
  prevImage();
}

// Touch/swipe support
const touchStartX = ref(0);
const touchEndX = ref(0);

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0].clientX;
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX.value = event.changedTouches[0].clientX;
  handleSwipe();
}

function handleSwipe() {
  const swipeDistance = touchStartX.value - touchEndX.value;
  const minSwipeDistance = 50;

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped left - next image
      nextImage();
    } else {
      // Swiped right - previous image
      prevImage();
    }
  }
}

// Variant selection handlers
function selectVariant(attributeName: string, value: string) {
  const newSelection = {
    ...selectedVariants.value,
    [attributeName]: value
  };

  // Clear selections for attributes that come AFTER this one in the array
  if (product.value && product.value.variantAttributes) {
    const attributeIndex = product.value.variantAttributes.findIndex(attr => attr.name === attributeName);

    // Clear all attributes that come after this one
    for (let i = attributeIndex + 1; i < product.value.variantAttributes.length; i++) {
      const laterAttr = product.value.variantAttributes[i];
      delete newSelection[laterAttr.name];
    }
  }

  selectedVariants.value = newSelection;
  // Reset image index when variant changes
  currentImageIndex.value = 0;
}

function isVariantAvailable(attributeName: string, value: string): boolean {
  if (!product.value || !product.value.variantAttributes) return false;

  // Only check against selections from attributes that come BEFORE this one
  const attributeIndex = product.value.variantAttributes.findIndex(attr => attr.name === attributeName);
  const priorSelections: Record<string, string> = {};

  for (let i = 0; i < attributeIndex; i++) {
    const priorAttr = product.value.variantAttributes[i];
    if (selectedVariants.value[priorAttr.name]) {
      priorSelections[priorAttr.name] = selectedVariants.value[priorAttr.name];
    }
  }

  const testVariants = { ...priorSelections, [attributeName]: value };
  return isVariantCombinationAvailable(testVariants);
}

function isVariantCombinationAvailable(testVariants: Record<string, string>): boolean {
  if (!product.value || !product.value.variants) return false;

  const variant = product.value.variants.find(v =>
    Object.keys(testVariants).every(key =>
      v.attributes[key] === testVariants[key]
    )
  );

  return variant ? variant.stockLevel > 0 : false;
}

function handleCustomizationsUpdate(customizations: SelectedCustomization[]) {
  selectedCustomizations.value = customizations;
}

function handleCustomizationsValidationChange(isValid: boolean) {
  customizationsValid.value = isValid;
}

function addToCart(event: MouseEvent) {
  if (product.value) {
    // Validate customizations before adding to cart
    if (hasCustomizations.value && customizationsRef.value) {
      const isValid = customizationsRef.value.validateAll();
      if (!isValid) {
        toastMessage.value = 'Bitte alle Pflichtfelder ausfüllen';
        toastType.value = 'error';
        showToast.value = true;
        return;
      }
    }
    const variantsToPass = product.value.hasVariants ? selectedVariants.value : undefined;
    const customizationsToPass = selectedCustomizations.value.length > 0 ? selectedCustomizations.value : undefined;
    const success = cartStore.addToCart(product.value, variantsToPass, customizationsToPass);
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

.product-image-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.image-gallery {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-image {
  position: relative;
  flex: 1;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s ease-in-out;
}

.product-image:hover {
  box-shadow: var(--shadow-md);
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

.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  animation: fadeIn 0.2s ease;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lightbox-nav {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.lightbox-nav:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
}

.lightbox-nav:active {
  transform: scale(0.95);
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.image-nav {
  background-color: white;
  color: var(--text-color);
  border: 2px solid var(--border-color);
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.image-nav:hover {
  background-color: var(--background-light);
  border-color: var(--text-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.image-nav:active {
  transform: scale(0.95);
}

.image-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.image-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  padding: 0;
  background: none;
  box-shadow: var(--shadow-sm);
}

.thumbnail:hover {
  border-color: var(--text-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.thumbnail.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

.product-info-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 2rem 0 1rem 0;
}

.description {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1.1rem;
}

.description :deep(ul) {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
  list-style-position: inside;
}

.description :deep(li) {
  text-align: left;
  margin-bottom: 0.5rem;
}

.description :deep(p) {
  text-align: left;
  margin: 1rem 0;
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
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;
  margin-top: 1rem;
  box-shadow: var(--shadow-md);
}

.add-to-cart:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.add-to-cart:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.variant-selectors {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.variant-selector {
  margin-bottom: 1.5rem;
}

.variant-selector:last-child {
  margin-bottom: 0;
}

.variant-selector label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-color);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-option {
  padding: 0.6rem 1.25rem;
  border: 2px solid var(--border-color);
  background-color: white;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  font-size: 0.9rem;
  box-shadow: var(--shadow-sm);
}

.variant-option:hover:not(:disabled) {
  border-color: #000;
  background-color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.variant-option.selected {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: var(--shadow-md);
}

.variant-option.selected:hover:not(:disabled) {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: #fff;
}

.variant-option:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
  box-shadow: none;
}

.stock {
  font-weight: 600;
  margin: 1rem 0;
}

.low-stock {
  color: #ff6b6b;
}

/* Price Summary */
.price-summary {
  background-color: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: var(--text-color);
}

.customization-row {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.total-row {
  border-top: 2px solid #000;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
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

  .product-image-container {
    width: 100%;
    max-width: 100%;
  }

  .image-gallery {
    gap: 0.5rem;
  }

  .product-image {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .image-nav {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    font-size: 1.5rem;
  }

  .lightbox-nav {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    font-size: 1.8rem;
  }

  .lightbox-content {
    gap: 1rem;
  }
}
</style> 