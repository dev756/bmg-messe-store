<template>
  <div class="cart">
    <h1>Shopping Cart</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/" class="continue-shopping">Continue Shopping</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.sku" class="cart-item">
          <img :src="item.imageUrl" :alt="item.name" class="item-image" />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="item-price">${{ item.price.toFixed(2) }}</p>
            <div class="quantity-controls">
              <button 
                @click="updateQuantity(item.sku, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="quantity-btn"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.sku, item.quantity + 1)"
                :disabled="item.quantity >= item.stockLevel"
                class="quantity-btn"
              >
                +
              </button>
            </div>
          </div>
          <button @click="removeItem(item.sku)" class="remove-btn">Remove</button>
        </div>
      </div>
      
      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Items</span>
          <span>{{ cartStore.totalItems }}</span>
        </div>
        <router-link to="/checkout" class="checkout-btn">
          Proceed to Checkout
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

function updateQuantity(sku: string, quantity: number) {
  cartStore.updateQuantity(sku, quantity);
}

function removeItem(sku: string) {
  cartStore.removeFromCart(sku);
}
</script>

<style scoped>
.cart {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
}

.continue-shopping {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #ffc72c;
  color: #27251f;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.continue-shopping:hover {
  background-color: #ffd54f;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  align-items: center;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-price {
  color: #ffc72c;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  background-color: #f0f0f0;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
}

.remove-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cart-summary {
  background-color: #f8f8f8;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

.checkout-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  background-color: #ffc72c;
  color: #27251f;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #ffd54f;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}
</style> 