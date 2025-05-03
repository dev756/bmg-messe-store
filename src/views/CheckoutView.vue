<template>
  <div class="checkout">
    <h1>Checkout</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/" class="continue-shopping">Continue Shopping</router-link>
    </div>
    
    <div v-else class="checkout-content">
      <div v-if="isSubmitting" class="processing-overlay">
        <div class="processing-content">
          <div class="processing-spinner"></div>
          <h2>Processing Your Order</h2>
          <p>Please wait while we process your order...</p>
        </div>
      </div>
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.sku" class="cart-item">
            <div class="item-image">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="quantity">Quantity: {{ item.quantity }}</p>
            </div>
            <div class="item-price">
              CHF {{ item.price.toFixed(2) }}
            </div>
          </div>
        </div>
        
        <div class="order-total">
          <div class="vat">
            <span>Including VAT (8.1%)</span>
            <span>CHF {{ (cartStore.totalPrice - cartStore.totalPrice / 1.081).toFixed(2) }}</span>
          </div>
          <div class="total">
            <span>Total</span>
            <span>CHF {{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="checkout-form">
        <h2>Contact Information</h2>
        <form @submit.prevent="submitOrder">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              required
              placeholder="Enter your full name"
              :class="{ 'error': showNameError }"
              @input="validateName"
            />
            <span v-if="showNameError" class="error-message">Please enter your name</span>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <div class="email-input-wrapper">
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                required
                placeholder="Enter your email"
                :class="{ 'error': showEmailError }"
                @input="validateEmail"
              />
              <span v-if="showEmailError" class="error-icon">⚠️</span>
            </div>
            <span v-if="showEmailError" class="error-message">Please enter a valid email address</span>
          </div>

          <div class="form-group">
            <label>Payment Method</label>
            <div class="payment-options">
              <label class="payment-option disabled">
                <input 
                  type="radio" 
                  v-model="form.paymentMethod" 
                  value="pay_now"
                  disabled
                />
                <span class="payment-label">Pay Now (Coming Soon)</span>
              </label>
              
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="form.paymentMethod" 
                  value="pay_in_store"
                  required
                />
                <span class="payment-label">Pay in Store</span>
              </label>
            </div>
          </div>
          
          <button type="submit" class="place-order-btn" :disabled="isSubmitting || !isFormValid">
            {{ isSubmitting ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useProductStore } from '../stores/products';
import type { Order, Customer } from '../types';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const isSubmitting = ref(false);
const showEmailError = ref(false);
const showNameError = ref(false);

interface FormData {
  name: string;
  email: string;
  paymentMethod: 'pay_now' | 'pay_in_store';
}

const form = ref<FormData>({
  name: '',
  email: '',
  paymentMethod: 'pay_in_store'
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (): void => {
  showEmailError.value = form.value.email !== '' && !emailRegex.test(form.value.email);
};

const validateName = (): void => {
  showNameError.value = form.value.name.trim() === '';
};

const isFormValid = computed((): boolean => {
  return form.value.name.trim() !== '' && 
         emailRegex.test(form.value.email);
});

const submitOrder = async (): Promise<void> => {
  if (isSubmitting.value || !isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    const order: Order = {
      items: cartStore.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      })),
      customer: {
        name: form.value.name,
        email: form.value.email
      } as Customer,
      paymentMethod: form.value.paymentMethod,
      totalPrice: cartStore.totalPrice
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update stock levels
    for (const item of cartStore.items) {
      const product = productStore.products.find(p => p.sku === item.sku);
      if (product) {
        product.stockLevel -= item.quantity;
      }
    }
    
    // Generate a random order number
    const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Clear cart and redirect to success page
    cartStore.clearCart();
    router.push({
      name: 'order-success',
      params: {
        orderNumber,
        paymentMethod: form.value.paymentMethod === 'pay_now' ? 'Pay Now' : 'Pay in Store'
      }
    });
  } catch (error) {
    console.error('Error submitting order:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.checkout {
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

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

.order-summary {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
}

.order-summary h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
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
  font-size: 1.1rem;
  font-weight: 600;
}

.quantity {
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
}

.item-price {
  color: var(--text-color);
  font-weight: 600;
}

.order-total {
  background-color: var(--background-dark);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.vat,
.total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.vat.total,
.total.total {
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.checkout-form {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
}

.checkout-form h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-dark);
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.place-order-btn {
  width: 100%;
  background-color: var(--primary-color);
  color: var(--background-dark);
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.place-order-btn:hover:not(:disabled) {
  background-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.place-order-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.payment-options {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.3s ease;
  background-color: var(--background-dark);
}

.payment-option:hover {
  border-color: var(--primary-color);
}

.payment-option input[type="radio"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--primary-color);
}

.payment-option input[type="radio"]:checked + .payment-label {
  color: var(--primary-color);
  font-weight: 600;
}

.payment-label {
  color: var(--text-color);
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.payment-option input[type="radio"]:checked ~ .payment-option {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    order: 2;
  }
  
  .checkout-form {
    order: 1;
  }
}

.email-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.error-icon {
  position: absolute;
  right: 1rem;
  color: #ff4444;
  font-size: 1.2rem;
}

input.error {
  border-color: #ff4444;
  background-color: rgba(255, 68, 68, 0.05);
}

.error-message {
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: block;
}

.payment-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--background-dark);
}

.payment-option.disabled:hover {
  border-color: var(--border-color);
  background-color: var(--background-dark);
}

.payment-option.disabled .payment-label {
  color: var(--text-secondary);
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.processing-content {
  text-align: center;
  padding: 2rem;
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.processing-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

.processing-content h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.processing-content p {
  color: var(--text-secondary);
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 