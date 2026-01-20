import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { CartItem, Product, SelectedCustomization } from '../types';
import { useProductStore } from './products';

const CART_STORAGE_KEY = 'mcshop-cart';

// Generate unique cart item ID based on SKU, variants, and customizations
export function generateCartItemId(
  sku: string,
  selectedVariants?: Record<string, string>,
  selectedCustomizations?: SelectedCustomization[]
): string {
  let id = sku;

  // Add variant hash
  if (selectedVariants && Object.keys(selectedVariants).length > 0) {
    const sortedKeys = Object.keys(selectedVariants).sort();
    const variantString = sortedKeys
      .map(key => `${key}:${selectedVariants[key]}`)
      .join('|');
    id = `${id}#${btoa(variantString)}`;
  }

  // Add customization hash
  if (selectedCustomizations && selectedCustomizations.length > 0) {
    const customizationString = selectedCustomizations
      .map(c => {
        const fieldsStr = c.fields
          .map(f => `${f.fieldId}=${f.value}`)
          .sort()
          .join(',');
        return `${c.customizationId}:${fieldsStr}`;
      })
      .sort()
      .join('|');
    id = `${id}@${btoa(customizationString)}`;
  }

  return id;
}

// Calculate total price for customizations
export function calculateCustomizationPrice(customizations?: SelectedCustomization[]): number {
  if (!customizations || customizations.length === 0) return 0;
  return customizations.reduce((sum, c) => sum + c.totalPrice, 0);
}

// Load initial cart data from localStorage
const loadCartFromStorage = (): CartItem[] => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) return [];

  const cartItems = JSON.parse(savedCart) as CartItem[];

  // Handle migration for existing cart items
  return cartItems.map(item => {
    const customizationTotalPrice = calculateCustomizationPrice(item.selectedCustomizations);
    return {
      ...item,
      originalPrice: item.originalPrice ?? item.price,
      cartItemId: item.cartItemId ?? generateCartItemId(item.sku, item.selectedVariants, item.selectedCustomizations),
      customizationTotalPrice: customizationTotalPrice,
      finalPrice: item.price + customizationTotalPrice
    };
  });
};

// Utility function to get the effective price (specialPrice if available, otherwise price)
export function getEffectivePrice(product: Product): number {
  return product.specialPrice ?? product.price;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCartFromStorage());

  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + ((item.finalPrice ?? item.price) * item.quantity), 0)
  );

  // Watch for changes in items and save to localStorage
  watch(items, (newItems) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  }, { deep: true });

  function canAddToCart(
    product: Product,
    selectedVariants?: Record<string, string>,
    selectedCustomizations?: SelectedCustomization[]
  ): boolean {
    const productStore = useProductStore();
    const variantSku = product.hasVariants
      ? productStore.getVariantSku(product, selectedVariants || {})
      : product.sku;
    const cartItemId = generateCartItemId(variantSku, selectedVariants, selectedCustomizations);
    const existingItem = items.value.find(item => item.cartItemId === cartItemId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const stockLevel = product.hasVariants
      ? productStore.getVariantStock(product, selectedVariants || {})
      : (product.stockLevel ?? 0);
    return currentQuantity < stockLevel;
  }

  function addToCart(
    product: Product,
    selectedVariants?: Record<string, string>,
    selectedCustomizations?: SelectedCustomization[]
  ): boolean {
    if (!canAddToCart(product, selectedVariants, selectedCustomizations)) {
      return false;
    }

    const productStore = useProductStore();
    const variantSku = product.hasVariants
      ? productStore.getVariantSku(product, selectedVariants || {})
      : product.sku;
    const cartItemId = generateCartItemId(variantSku, selectedVariants, selectedCustomizations);
    const existingItem = items.value.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      const effectivePrice = product.hasVariants
        ? productStore.getVariantPrice(product, selectedVariants || {})
        : (product.specialPrice ?? product.price);
      const stockLevel = product.hasVariants
        ? productStore.getVariantStock(product, selectedVariants || {})
        : product.stockLevel;
      const imageUrls = product.hasVariants
        ? productStore.getVariantImages(product, selectedVariants || {})
        : product.imageUrls;

      // Determine originalPrice: use effectivePrice if it comes from conditionalPrices, otherwise use base price
      let originalPrice = product.price;
      if (product.conditionalPrices && selectedVariants) {
        const hasConditionalPrice = product.conditionalPrices.some(condition =>
          Object.keys(condition.when).every(key =>
            selectedVariants[key] === condition.when[key]
          )
        );
        if (hasConditionalPrice) {
          originalPrice = effectivePrice; // No discount display for conditional prices
        }
      } else if (product.specialPrice) {
        originalPrice = product.price; // Show discount for special prices
      } else {
        originalPrice = effectivePrice; // Default case
      }

      // Calculate customization price
      const customizationTotalPrice = calculateCustomizationPrice(selectedCustomizations);
      const finalPrice = effectivePrice + customizationTotalPrice;

      items.value.push({
        sku: variantSku,
        name: product.name,
        price: effectivePrice,
        originalPrice: originalPrice,
        quantity: 1,
        imageUrl: imageUrls[0], // Use first image for cart
        stockLevel,
        selectedVariants: selectedVariants ? { ...selectedVariants } : undefined,
        cartItemId,
        selectedCustomizations: selectedCustomizations && selectedCustomizations.length > 0
          ? [...selectedCustomizations]
          : undefined,
        customizationTotalPrice: customizationTotalPrice > 0 ? customizationTotalPrice : undefined,
        finalPrice: customizationTotalPrice > 0 ? finalPrice : undefined
      });
    }
    return true;
  }

  function removeFromCart(cartItemId: string) {
    const index = items.value.findIndex(item => item.cartItemId === cartItemId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    const item = items.value.find(item => item.cartItemId === cartItemId);
    if (item && quantity > 0) {
      const stockLevel = item.stockLevel ?? 0;
      if (quantity <= stockLevel) {
        item.quantity = quantity;
      }
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
    clearCart,
    canAddToCart,
    generateCartItemId
  };
}); 