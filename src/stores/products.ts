import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { fetchProducts } from '../services/api';
import type { Product, CustomizationType, CustomizationField, PresetOption } from '../types';

const PRODUCTS_STORAGE_KEY = 'mcshop-products-eur';

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

  // Variant helper functions

  // Get total available stock across all variants
  function getTotalAvailableStock(product: Product): number {
    if (!product.hasVariants || !product.variants) {
      return product.stockLevel;
    }

    return product.variants.reduce((total, variant) => total + variant.stockLevel, 0);
  }

  // Check if product has any stock available (for any variant)
  function hasAnyStock(product: Product): boolean {
    return getTotalAvailableStock(product) > 0;
  }

  function getVariantStock(product: Product, selectedVariants: Record<string, string>): number {
    if (!product.hasVariants || !product.variants) {
      return product.stockLevel;
    }

    const variant = product.variants.find(v =>
      Object.keys(selectedVariants).every(key =>
        v.attributes[key] === selectedVariants[key]
      )
    );

    return variant?.stockLevel ?? 0;
  }

  function getVariantSku(product: Product, selectedVariants: Record<string, string>): string {
    if (!product.hasVariants || !product.variants) {
      return product.sku;
    }

    const variant = product.variants.find(v =>
      Object.keys(selectedVariants).every(key =>
        v.attributes[key] === selectedVariants[key]
      )
    );

    return variant?.sku ?? product.sku;
  }

  function getVariantPrice(product: Product, selectedVariants: Record<string, string>): number {
    // Check for conditional pricing first
    if (product.conditionalPrices && product.conditionalPrices.length > 0) {
      const matchingCondition = product.conditionalPrices.find(condition =>
        Object.keys(condition.when).every(key =>
          selectedVariants[key] === condition.when[key]
        )
      );

      if (matchingCondition) {
        return matchingCondition.specialPrice ?? matchingCondition.price;
      }
    }

    // Fall back to base price or variant-specific price
    const basePrice = product.specialPrice ?? product.price;

    if (!product.hasVariants || !product.variants) {
      return basePrice;
    }

    const variant = product.variants.find(v =>
      Object.keys(selectedVariants).every(key =>
        v.attributes[key] === selectedVariants[key]
      )
    );

    return basePrice + (variant?.additionalPrice ?? 0);
  }

  function getVariantImages(product: Product, selectedVariants: Record<string, string>): string[] {
    // Check for conditional images first
    if (product.conditionalImages && product.conditionalImages.length > 0) {
      const matchingCondition = product.conditionalImages.find(condition =>
        Object.keys(condition.when).every(key =>
          selectedVariants[key] === condition.when[key]
        )
      );

      if (matchingCondition) {
        return matchingCondition.imageUrls;
      }
    }

    // Fall back to variant-specific or base images
    if (!product.hasVariants || !product.variants) {
      return product.imageUrls;
    }

    const variant = product.variants.find(v =>
      Object.keys(selectedVariants).every(key =>
        v.attributes[key] === selectedVariants[key]
      )
    );

    return variant?.imageUrls ?? product.imageUrls;
  }

  function updateStockLevel(sku: string, quantity: number, selectedVariants?: Record<string, string>) {
    const product = products.value.find(p =>
      p.sku === sku || p.variants?.some(v => v.sku === sku)
    );
    if (!product) return;

    if (product.hasVariants && selectedVariants && product.variants) {
      const variant = product.variants.find(v =>
        Object.keys(selectedVariants).every(key =>
          v.attributes[key] === selectedVariants[key]
        )
      );
      if (variant) {
        variant.stockLevel -= quantity;
      }
    } else {
      product.stockLevel -= quantity;
    }
  }

  function getProduct(sku: string): Product | undefined {
    return products.value.find(p => p.sku === sku);
  }

  // Get effective customizations for a product, considering variant selection and overrides
  function getEffectiveCustomizations(
    product: Product,
    selectedVariants?: Record<string, string>
  ): CustomizationType[] {
    // Return empty array if no customization config
    if (!product.customizationConfig || !product.customizationConfig.customizations) {
      return [];
    }

    // Get the selected variant if applicable
    const selectedVariant = selectedVariants && product.variants
      ? product.variants.find(v =>
          Object.keys(selectedVariants).every(key =>
            v.attributes[key] === selectedVariants[key]
          )
        )
      : undefined;

    return product.customizationConfig.customizations
      .filter(customization => {
        // Filter by enabled state
        if (!customization.enabled) return false;

        // Filter by availableForVariants if variant is selected
        if (customization.availableForVariants && selectedVariants) {
          const isAvailable = customization.availableForVariants.some(constraint => {
            const selectedValue = selectedVariants[constraint.attributeName];
            return selectedValue && constraint.values.includes(selectedValue);
          });
          if (!isAvailable) return false;
        }

        return true;
      })
      .map(customization => {
        // Check for variant-level overrides
        const override = selectedVariant?.customizationOverrides?.find(
          o => o.customizationId === customization.id
        );

        // If override disables the customization, skip it
        if (override?.enabled === false) {
          return null;
        }

        // Apply field overrides if present
        if (override?.fieldOverrides && override.fieldOverrides.length > 0) {
          const mergedFields = customization.fields.map(field => {
            const fieldOverride = override.fieldOverrides!.find(fo => fo.fieldId === field.id);
            if (!fieldOverride) return field;

            // Create a new field with overrides applied
            const mergedField: CustomizationField = { ...field };

            if (fieldOverride.presets !== undefined) {
              mergedField.presets = fieldOverride.presets;
            }
            if (fieldOverride.customInputPrice !== undefined) {
              mergedField.customInputPrice = fieldOverride.customInputPrice;
            }
            if (fieldOverride.options !== undefined) {
              mergedField.options = fieldOverride.options;
            }
            if (fieldOverride.additionalPrice !== undefined) {
              mergedField.additionalPrice = fieldOverride.additionalPrice;
            }

            return mergedField;
          });

          return {
            ...customization,
            fields: mergedFields
          };
        }

        return customization;
      })
      .filter((c): c is CustomizationType => c !== null)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  return {
    products,
    isLoading,
    error,
    loadProducts,
    refreshProductsInBackground,
    updateStockLevel,
    getProduct,
    getTotalAvailableStock,
    hasAnyStock,
    getVariantStock,
    getVariantSku,
    getVariantPrice,
    getVariantImages,
    getEffectiveCustomizations
  };
}); 