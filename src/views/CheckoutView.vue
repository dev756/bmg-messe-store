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
                ref="firstNameInput"
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
            <label for="address">Address</label>
            <input
              type="text"
              id="address"
              v-model="form.address"
              @blur="validateAddress"
              :class="{ 'error': addressError }"
              placeholder="Enter your street address"
            />
            <span class="error-message" v-if="addressError">{{ addressError }}</span>
          </div>

          <div class="address-fields">
            <div class="form-group">
              <label for="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                v-model="form.zipCode"
                @blur="validateZipCode"
                :class="{ 'error': zipCodeError }"
                placeholder="Enter ZIP code"
              />
              <span class="error-message" v-if="zipCodeError">{{ zipCodeError }}</span>
            </div>

            <div class="form-group">
              <label for="city">City</label>
              <input
                type="text"
                id="city"
                v-model="form.city"
                @blur="validateCity"
                :class="{ 'error': cityError }"
                placeholder="Enter city"
              />
              <span class="error-message" v-if="cityError">{{ cityError }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <select
              id="country"
              v-model="form.country"
              :class="{ 'error': countryError }"
            >
              <option value="CH">Switzerland</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="IT">Italy</option>
              <option value="FR">France</option>
              <option value="LI">Liechtenstein</option>
            </select>
            <span class="error-message" v-if="countryError">{{ countryError }}</span>
          </div>

          <div class="payment-info">
            <h3>Payment Information</h3>
            <p>You can pay for your order in two ways:</p>
            <ul>
              <li>Pay in store when picking up your order</li>
              <li>Pay in advance using our mobile app (QR code will be shown after order confirmation)</li>
            </ul>
          </div>

          <button 
            v-if="isDev" 
            type="button" 
            class="fill-test-data-btn"
            @click="fillTestData"
          >
            Fill Test Data
          </button>
          
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
import { ref, computed, onMounted } from 'vue';
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

const isDev = ref(import.meta.env.MODE === 'development');

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  zipCode: '',
  city: '',
  country: 'CH'
});

const firstNameError = ref('');
const lastNameError = ref('');
const emailError = ref('');
const addressError = ref('');
const zipCodeError = ref('');
const cityError = ref('');
const countryError = ref('');

const firstNameInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  firstNameInput.value?.focus();
});

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

const validateAddress = () => {
  if (!form.value.address.trim()) {
    addressError.value = 'Address is required';
    return false;
  }
  addressError.value = '';
  return true;
};

const validateZipCode = () => {
  if (!form.value.zipCode.trim()) {
    zipCodeError.value = 'ZIP code is required';
    return false;
  }
  // Basic ZIP code validation for European format
  const zipRegex = /^\d{4,5}$/;
  if (!zipRegex.test(form.value.zipCode)) {
    zipCodeError.value = 'Please enter a valid ZIP code';
    return false;
  }
  zipCodeError.value = '';
  return true;
};

const validateCity = () => {
  if (!form.value.city.trim()) {
    cityError.value = 'City is required';
    return false;
  }
  cityError.value = '';
  return true;
};

const validateCountry = () => {
  if (!form.value.country) {
    countryError.value = 'Country is required';
    return false;
  }
  countryError.value = '';
  return true;
};

const isFormValid = computed(() => {
  return validateFirstName() && 
         validateLastName() && 
         validateEmail() && 
         validateAddress() && 
         validateZipCode() && 
         validateCity() && 
         validateCountry();
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
        email: form.value.email,
        address: form.value.address,
        zipCode: form.value.zipCode,
        city: form.value.city,
        country: form.value.country
      },
      items: cartStore.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))
    };

    const { paymentUrl } = await createOrder(order);
    
    // Clear cart and redirect to success page
    cartStore.clearCart();
    router.push({
      name: 'order-success',
      params: {
        orderNumber: order.orderNumber
      },
      query: {
        paymentUrl: paymentUrl
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

const fillTestData = () => {
  form.value = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    address: 'Bahnhofstrasse 1',
    zipCode: '8001',
    city: 'Zürich',
    country: 'CH'
  };
  // Trigger validation
  validateFirstName();
  validateLastName();
  validateEmail();
  validateAddress();
  validateZipCode();
  validateCity();
  validateCountry();
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

.payment-info {
  background-color: var(--background-dark);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.payment-info h3 {
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: left;
}

.payment-info p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  text-align: left;
}

.payment-info ul {
  color: var(--text-secondary);
  margin: 0;
  padding-left: 1.5rem;
  text-align: left;
}

.payment-info li {
  margin-bottom: 0.5rem;
  text-align: left;
}

.payment-info li:last-child {
  margin-bottom: 0;
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

  .address-fields {
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

.address-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  background-color: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: var(--primary-color);
}

select.error {
  border-color: #dc3545;
}

.fill-test-data-btn {
  width: 100%;
  background-color: var(--background-dark);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.fill-test-data-btn:hover {
  background-color: var(--border-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style> 