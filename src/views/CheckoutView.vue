<template>
  <div class="checkout">
    <h1>Checkout</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/" class="continue-shopping">Continue Shopping</router-link>
    </div>
    
    <div v-else class="checkout-content">
      <form @submit.prevent="handleSubmit" class="checkout-form">
        <div class="form-section">
          <h2>Customer Information</h2>
          <div class="form-group">
            <label for="name">Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="customerInfo.name" 
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="customerInfo.email" 
              required
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-section">
          <h2>Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option">
              <input 
                type="radio" 
                v-model="paymentMethod" 
                value="immediate"
                required
              />
              <span>Pay Now</span>
            </label>
            <label class="payment-option">
              <input 
                type="radio" 
                v-model="paymentMethod" 
                value="pickup"
                required
              />
              <span>Pay on Pickup</span>
            </label>
          </div>
        </div>
        
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Items</span>
            <span>{{ cartStore.totalItems }}</span>
          </div>
        </div>
        
        <button type="submit" class="submit-btn">
          Place Order
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { createOrder } from '../services/api';
import type { CustomerInfo } from '../types';

const router = useRouter();
const cartStore = useCartStore();

const customerInfo = ref<CustomerInfo>({
  name: '',
  email: ''
});

const paymentMethod = ref<'immediate' | 'pickup'>('immediate');

async function handleSubmit() {
  try {
    const orderData = {
      items: cartStore.items,
      customerInfo: customerInfo.value,
      paymentMethod: paymentMethod.value
    };
    
    const { orderNumber } = await createOrder(orderData);
    
    // Clear the cart
    cartStore.clearCart();
    
    // Redirect to order confirmation
    router.push({
      name: 'order-confirmation',
      query: { orderNumber }
    });
  } catch (error) {
    console.error('Failed to place order:', error);
    // Here you would typically show an error message to the user
  }
}
</script>

<style scoped>
.checkout {
  padding: 2rem;
  max-width: 800px;
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

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background-color: #f8f8f8;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.payment-options {
  display: flex;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.order-summary {
  background-color: #f8f8f8;
  padding: 1.5rem;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

.submit-btn {
  background-color: #ffc72c;
  color: #27251f;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #ffd54f;
}
</style> 