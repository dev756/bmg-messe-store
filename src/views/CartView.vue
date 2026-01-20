<template>
  <div class="cart">
    <h1>Warenkorb</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Der Warenkorb ist leer</p>
      <router-link to="/" class="continue-shopping">Weiter einkaufen</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-summary">
        <h2>Zusammenfassung</h2>
        <div class="order-total">
          <div class="vat">
            <span>Versand</span>
            <span>EUR 0.00</span>
          </div>
          <div class="vat">
            <span>Inkl. MwSt. (19%)</span>
            <span>EUR {{ (cartStore.totalPrice - cartStore.totalPrice / 1.19).toFixed(2) }}</span>
          </div>
          <div class="total">
            <span>Total</span>
            <span>EUR {{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        <router-link to="/checkout" class="checkout-btn">
          Weiter zur Kasse
        </router-link>
      </div>

      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.cartItemId" class="cart-item">
          <div class="item-image">
            <img :src="item.imageUrl" :alt="item.name" />
          </div>
          <div class="item-content">
            <div class="item-details">
              <div class="item-header">
                <h3>{{ item.name }}</h3>
                <span class="item-base-price">EUR {{ item.price.toFixed(2) }}</span>
              </div>

              <!-- Display selected variants -->
              <div v-if="item.selectedVariants" class="item-variants">
                <span
                  v-for="(value, key) in item.selectedVariants"
                  :key="key"
                  class="variant-badge"
                >
                  {{ key }}: {{ value }}
                </span>
              </div>

              <!-- Display customizations as indented sub-items -->
              <div v-if="item.selectedCustomizations && item.selectedCustomizations.length > 0" class="customizations-list">
                <div
                  v-for="customization in item.selectedCustomizations"
                  :key="customization.customizationId"
                  class="customization-line"
                >
                  <span class="customization-icon">↳</span>
                  <span class="customization-text">
                    {{ customization.customizationName }}: {{ getCustomizationDisplayText(customization) }}
                  </span>
                  <span class="customization-line-price">+EUR {{ customization.totalPrice.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Show special price if applicable -->
              <div v-if="item.price !== item.originalPrice" class="special-price-note">
                <PriceDisplay :price="item.originalPrice" :special-price="item.price" />
              </div>
            </div>
            <div class="item-actions">
              <div class="quantity-controls">
                <button
                  @click="decreaseQuantity(item.cartItemId)"
                  :disabled="item.quantity <= 1"
                  class="quantity-btn"
                >-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.cartItemId)"
                  :disabled="item.quantity >= item.stockLevel"
                  class="quantity-btn"
                >+</button>
              </div>
              <div class="item-total">
                EUR {{ ((item.finalPrice ?? item.price) * item.quantity).toFixed(2) }}
              </div>
              <button @click="cartStore.removeFromCart(item.cartItemId)" class="remove-btn">
                Entfernen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart';
import PriceDisplay from '../components/PriceDisplay.vue';
import type { SelectedCustomization } from '../types';

const cartStore = useCartStore();

// Get display text for a customization (e.g., "Plea (#10)" or custom values)
function getCustomizationDisplayText(customization: SelectedCustomization): string {
  // Simple addon with no fields
  if (customization.fields.length === 0) {
    return 'Hinzugefügt';
  }

  // Find the main display field (preset or primary value)
  const presetField = customization.fields.find(f => f.fieldId === 'preset');

  if (presetField) {
    if (presetField.value === 'custom') {
      // Show custom values
      const nameField = customization.fields.find(f => f.fieldId === 'name');
      const numberField = customization.fields.find(f => f.fieldId === 'number');
      if (nameField && numberField) {
        return `${nameField.value} (#${numberField.value})`;
      }
      return customization.fields
        .filter(f => f.fieldId !== 'preset')
        .map(f => f.displayValue)
        .join(', ');
    }
    // Show preset label
    return presetField.displayValue;
  }

  // For toggle customizations (like badge)
  const toggleField = customization.fields.find(f => f.value === true);
  if (toggleField) {
    return toggleField.displayValue === 'Ja' ? 'Hinzugefügt' : toggleField.displayValue;
  }

  // Default: join all display values
  return customization.fields.map(f => f.displayValue).join(', ');
}

function increaseQuantity(cartItemId: string) {
  const item = cartStore.items.find(item => item.cartItemId === cartItemId);
  if (item && item.quantity < item.stockLevel) {
    cartStore.updateQuantity(cartItemId, item.quantity + 1);
  }
}

function decreaseQuantity(cartItemId: string) {
  const item = cartStore.items.find(item => item.cartItemId === cartItemId);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(cartItemId, item.quantity - 1);
  }
}
</script>

<style scoped>
.cart {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: var(--text-color);
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.empty-cart p {
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.continue-shopping {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.15s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-md);
}

.continue-shopping:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.cart-items {
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  grid-row: 1 / 3;
  align-self: start;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.item-details {
  min-width: 0;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 600;
  word-wrap: break-word;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.item-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.variant-badge {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #ddd;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.item-header h3 {
  flex: 1;
}

.item-base-price {
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.customizations-list {
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  border-left: 2px solid var(--border-color);
  padding-left: 0.75rem;
}

.customization-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.customization-icon {
  color: var(--text-secondary);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.customization-text {
  flex: 1;
  color: var(--text-secondary);
}

.customization-line-price {
  color: var(--primary-color);
  font-weight: 600;
  white-space: nowrap;
}

.special-price-note {
  margin-top: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-btn {
  background-color: white;
  color: var(--text-color);
  border: 2px solid var(--border-color);
  width: 44px;
  height: 44px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0;
  box-shadow: var(--shadow-sm);
}

.quantity-btn:hover:not(:disabled) {
  background-color: var(--background-light);
  border-color: var(--text-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.quantity-btn:disabled {
  background-color: var(--background-light);
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.quantity {
  color: var(--text-color);
  font-weight: 600;
  min-width: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
}

.item-total {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.1rem;
  margin-left: auto;
}

.remove-btn {
  background-color: white;
  color: #ef4444;
  border: 2px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.remove-btn:hover {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.remove-btn::before {
  content: "×";
  font-size: 1.2rem;
  font-weight: 600;
}

.cart-summary {
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.cart-summary h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.order-total {
  margin-bottom: 1.5rem;
  background-color: var(--background-light);
  padding: 1rem;
  border-radius: 6px;
}

.vat,
.total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.checkout-btn {
  display: block;
  background-color: #000;
  color: white;
  text-align: center;
  padding: 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
  margin-top: 1.5rem;
  transition: all 0.15s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-md);
}

.checkout-btn:hover {
  background-color: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .item-image {
    grid-row: 1 / 3;
  }

  .item-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quantity-controls {
    width: 100%;
    justify-content: center;
  }

  .item-total {
    width: 100%;
    text-align: center;
    font-size: 1.2rem;
  }

  .remove-btn {
    width: 100%;
  }
}
</style> 