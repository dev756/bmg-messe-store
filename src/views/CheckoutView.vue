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
          <div class="name-fields">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                v-model="form.firstName"
                @blur="validateFirstName"
                :class="{ 'error': firstNameError }"
                placeholder="Enter your first name"
              />
              <span class="error-message" v-if="firstNameError">{{ firstNameError }}</span>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                v-model="form.lastName"
                @blur="validateLastName"
                :class="{ 'error': lastNameError }"
                placeholder="Enter your last name"
              />
              <span class="error-message" v-if="lastNameError">{{ lastNameError }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              @blur="validateEmail"
              :class="{ 'error': emailError }"
              placeholder="Enter your email"
            />
            <span class="error-message" v-if="emailError">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label>Payment Method</label>
            <div class="payment-options">
              <div class="payment-option disabled">
                <input 
                  type="radio" 
                  v-model="form.paymentMethod" 
                  value="pay_now"
                  disabled
                />
                <label class="payment-label">Pay Now (Coming Soon)</label>
              </div>
              
              <div class="payment-option">
                <input 
                  type="radio" 
                  v-model="form.paymentMethod" 
                  value="pay_in_store"
                  required
                />
                <label class="payment-label">Pay in Store</label>
              </div>
            </div>
          </div>
          
          <button type="submit" class="place-order-btn" :disabled="isSubmitting || !isFormValid">
            {{ isSubmitting ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>
    </div>
    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useProductStore } from '../stores/products';
import type { Order, Customer } from '../types';
import Toast from '../components/Toast.vue';
import { createOrder } from '../services/api';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const isSubmitting = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('error');
const showEmailError = ref(false);
const showNameError = ref(false);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  paymentMethod: 'pay_in_store'
});

const firstNameError = ref('');
const lastNameError = ref('');
const emailError = ref('');

const generateOrderNumber = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KS-${year}-${result}`;
};

const validateFirstName = () => {
  if (!form.value.firstName.trim()) {
    firstNameError.value = 'First name is required';
    return false;
  }
  firstNameError.value = '';
  return true;
};

const validateLastName = () => {
  if (!form.value.lastName.trim()) {
    lastNameError.value = 'Last name is required';
    return false;
  }
  lastNameError.value = '';
  return true;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email) {
    emailError.value = 'Email is required';
    return false;
  }
  if (!emailRegex.test(form.value.email)) {
    emailError.value = 'Please enter a valid email address';
    return false;
  }
  emailError.value = '';
  return true;
};

const isFormValid = computed(() => {
  return validateFirstName() && validateLastName() && validateEmail();
});

const submitOrder = async (): Promise<void> => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    const order: Order = {
      orderNumber: generateOrderNumber(),
      customer: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email
      },
      items: cartStore.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      })),
      paymentMethod: form.value.paymentMethod
    };

    await createOrder(order);
    
    // Clear cart and redirect to success page
    cartStore.clearCart();
    router.push({
      name: 'order-success',
      params: {
        orderNumber: order.orderNumber,
        paymentMethod: form.value.paymentMethod === 'pay_now' ? 'Pay Now' : 'Pay in Store'
      }
    });
  } catch (error) {
    console.error('Failed to place order:', error);
    showToast.value = true;
    toastMessage.value = 'Failed to place order. Please try again.';
    toastType.value = 'error';
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

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.3s ease;
  background-color: var(--background-dark);
}

.payment-option input[type="radio"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--primary-color);
  margin: 0;
}

.payment-label {
  color: var(--text-color);
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  line-height: 1;
  position: relative;
  top: 3px;
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

  .name-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }
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

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
</style> 