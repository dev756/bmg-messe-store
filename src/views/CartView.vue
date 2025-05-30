<template>
  <div class="cart">
    <h1>Warenkorb</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Der Warenkorb ist leer</p>
      <router-link to="/" class="continue-shopping">Weiter einkaufen</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.sku" class="cart-item">
          <div class="item-image">
            <img :src="item.imageUrl" :alt="item.name" />
          </div>
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="price">EUR {{ item.price.toFixed(2) }}</p>
          </div>
          <div class="quantity-controls">
            <button 
              @click="decreaseQuantity(item.sku)" 
              :disabled="item.quantity <= 1"
              class="quantity-btn"
            >-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button 
              @click="increaseQuantity(item.sku)" 
              :disabled="item.quantity >= item.stockLevel"
              class="quantity-btn"
            >+</button>
          </div>
          <div class="item-total">
            EUR {{ (item.price * item.quantity).toFixed(2) }}
          </div>
          <button @click="cartStore.removeFromCart(item.sku)" class="remove-btn">
            Entfernen
          </button>
        </div>
      </div>
      
      <div class="cart-summary">
        <h2>Zusammenfassung</h2>
        <div class="order-total">
          <div class="vat">
            <span>Inkl. MwSt. (8.1%)</span>
            <span>EUR {{ (cartStore.totalPrice - cartStore.totalPrice / 1.081).toFixed(2) }}</span>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

function increaseQuantity(sku: string) {
  const item = cartStore.items.find(item => item.sku === sku);
  if (item && item.quantity < item.stockLevel) {
    cartStore.updateQuantity(sku, item.quantity + 1);
  }
}

function decreaseQuantity(sku: string) {
  const item = cartStore.items.find(item => item.sku === sku);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(sku, item.quantity - 1);
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
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.empty-cart p {
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.continue-shopping {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--background-dark);
  padding: 1rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-items {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
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
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 600;
}

.price {
  color: var(--primary-color);
  font-weight: 600;
  margin: 0.5rem 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-btn {
  background-color: var(--background-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.5rem;
  font-weight: 500;
  padding: 0;
}

.quantity-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: var(--background-dark);
  border-color: var(--primary-color);
}

.quantity-btn:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  opacity: 0.7;
}

.quantity {
  color: var(--text-color);
  font-weight: 600;
  min-width: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
}

.item-total {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
}

.remove-btn {
  background-color: #e57373;
  color: white;
  border: 1px solid #e57373;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn:hover {
  background-color: #ef9a9a;
  border-color: #ef9a9a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(229, 115, 115, 0.2);
}

.remove-btn::before {
  content: "×";
  font-size: 1.2rem;
  font-weight: 600;
}

.cart-summary {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
}

.cart-summary h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.order-total {
  margin-bottom: 1.5rem;
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
  background-color: var(--primary-color);
  color: var(--background-dark);
  text-align: center;
  padding: 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .item-image {
    grid-row: 1;
    grid-column: 1;
  }

  .item-details {
    grid-row: 1;
    grid-column: 2;
  }

  .quantity-controls {
    grid-row: 2;
    grid-column: 1 / -1;
    justify-content: center;
    margin: 0.5rem 0;
  }

  .item-total {
    grid-row: 3;
    grid-column: 1;
    text-align: left;
  }

  .remove-btn {
    grid-row: 3;
    grid-column: 2;
    justify-self: end;
  }

  .cart-summary {
    position: static;
  }
}
</style> 