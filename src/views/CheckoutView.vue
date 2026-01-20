<template>
  <div class="checkout">
    <h1>Bestellabschluss</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Der Warenkorb ist leer</p>
      <router-link to="/" class="continue-shopping">Weiter einkaufen</router-link>
    </div>
    
    <div v-else class="checkout-content">
      <div v-if="isSubmitting" class="processing-overlay">
        <div class="processing-content">
          <div class="processing-spinner"></div>
          <h2>Bestellung wird verarbeitet</h2>
          <p>Bitte warten Sie, während wir Ihre Bestellung verarbeiten...</p>
        </div>
      </div>
      <div class="order-summary">
        <h2>Bestellübersicht</h2>
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.cartItemId" class="cart-item">
            <div class="item-image">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
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
              <!-- Display customizations -->
              <div v-if="item.selectedCustomizations && item.selectedCustomizations.length > 0" class="item-customizations">
                <div
                  v-for="customization in item.selectedCustomizations"
                  :key="customization.customizationId"
                  class="customization-item"
                >
                  <span class="customization-label">{{ customization.customizationName }}:</span>
                  <span class="customization-value">{{ getCustomizationDisplayText(customization) }}</span>
                  <span class="customization-price">+EUR {{ customization.totalPrice.toFixed(2) }}</span>
                </div>
              </div>
              <p class="quantity">Menge: {{ item.quantity }}</p>
            </div>
            <div class="item-price">
              <PriceDisplay :price="item.originalPrice" :special-price="item.price !== item.originalPrice ? item.price : undefined" />
            </div>
          </div>
        </div>
        
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
      </div>
      
      <div class="checkout-form">
        <h2>Lieferadresse</h2>
        <form @submit.prevent="submitOrder">
          <button 
            v-if="isDev || showTestData" 
            type="button" 
            class="fill-test-data-btn"
            @click="fillTestData"
          >
            Testdaten einfüllen
          </button>

          <div class="name-fields">
            <div class="form-group">
              <label for="firstName">Vorname</label>
              <input
                type="text"
                id="firstName"
                v-model="form.firstName"
                @blur="validateFirstName"
                :class="{ 'error': firstNameError }"
                placeholder="Vornamen eingeben"
                ref="firstNameInput"
              />
              <span class="error-message" v-if="firstNameError">{{ firstNameError }}</span>
            </div>

            <div class="form-group">
              <label for="lastName">Nachname</label>
              <input
                type="text"
                id="lastName"
                v-model="form.lastName"
                @blur="validateLastName"
                :class="{ 'error': lastNameError }"
                placeholder="Nachnamen eingeben"
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
              placeholder="Email eingeben"
            />
            <span class="error-message" v-if="emailError">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label for="address">Adresse</label>
            <input
              type="text"
              id="address"
              v-model="form.address"
              @blur="validateAddress"
              :class="{ 'error': addressError }"
              placeholder="Straße und Nummer eingeben"
            />
            <span class="error-message" v-if="addressError">{{ addressError }}</span>
          </div>

          <div class="address-fields">
            <div class="form-group">
              <label for="zipCode">PLZ</label>
              <input
                type="text"
                id="zipCode"
                v-model="form.zipCode"
                @blur="validateZipCode"
                :class="{ 'error': zipCodeError }"
                placeholder="PLZ eingeben"
              />
              <span class="error-message" v-if="zipCodeError">{{ zipCodeError }}</span>
            </div>

            <div class="form-group">
              <label for="city">Ort</label>
              <input
                type="text"
                id="city"
                v-model="form.city"
                @blur="validateCity"
                :class="{ 'error': cityError }"
                placeholder="Ort eingeben"
              />
              <span class="error-message" v-if="cityError">{{ cityError }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="country">Land</label>
            <select
              id="country"
              v-model="form.country"
              :class="{ 'error': countryError }"
            >
              <option value="DE">Deutschland</option>
             <!--- <option value="CH">Schweiz</option>
              <option value="AT">Österreich</option>
              <option value="IT">Italien</option>
              <option value="FR">Frankreich</option>
              <option value="LI">Liechtenstein</option>-->
            </select>
            <span class="error-message" v-if="countryError">{{ countryError }}</span>
          </div>

          <div class="payment-info">
            <h3>Zahlungsinformationen</h3>
            <p>Sie können Ihre Bestellung in zwei verschiedenen Weisen bezahlen:</p>
            <ul>
              <li>Nach Abschluss der Bestellung an der Kasse zahlen</li>
              <li>Den QR-Code scannen und bequem über das Handy online bezahlen (QR-Code wird nach Bestellbestätigung angezeigt)</li>
            </ul>
          </div>
          
          <button type="submit" class="place-order-btn" :disabled="isSubmitting || !isFormValid">
            {{ isSubmitting ? 'Verarbeitung...' : 'Bestellung aufgeben' }}
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
import type { Order, Customer, SelectedCustomization } from '../types';
import Toast from '../components/Toast.vue';
import { createOrder } from '../services/api';
import { getNextName } from '../data/swissNames';
import PriceDisplay from '../components/PriceDisplay.vue';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const isSubmitting = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('error');

const isDev = ref(import.meta.env.MODE === 'development');
const showTestData = ref(import.meta.env.VITE_SHOW_TEST_DATA === 'true');

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  zipCode: '',
  city: '',
  country: 'DE'
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
  return `BMG-${year}-${result}`;
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
        sku: item.sku,  // This is now the variant SKU
        quantity: item.quantity,
        price: item.price,  // Base product price
        customizationTotalPrice: item.customizationTotalPrice || 0,
        finalPrice: item.finalPrice || item.price,  // Total including customizations
        selectedVariants: item.selectedVariants,  // Include variant info for backend tracking
        customizations: item.selectedCustomizations?.map(c => ({
          customizationId: c.customizationId,
          customizationName: c.customizationName,
          totalPrice: c.totalPrice,
          fields: c.fields.map(f => ({
            fieldId: f.fieldId,
            value: f.value
          }))
        }))
      }))
    };

    const { paymentUrl } = await createOrder(order);

    // Update stock levels for each cart item
    cartStore.items.forEach(item => {
      productStore.updateStockLevel(item.sku, item.quantity, item.selectedVariants);
    });

    // Store total amount before clearing cart
    const totalAmount = cartStore.totalPrice;

    // Clear cart and redirect to success page
    cartStore.clearCart();
    router.push({
      name: 'order-success',
      params: {
        orderNumber: order.orderNumber
      },
      query: {
        paymentUrl: paymentUrl,
        totalAmount: totalAmount.toString()
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

// Get display text for a customization
function getCustomizationDisplayText(customization: SelectedCustomization): string {
  // Simple addon with no fields
  if (customization.fields.length === 0) {
    return 'Hinzugefügt';
  }

  const presetField = customization.fields.find(f => f.fieldId === 'preset');

  if (presetField) {
    if (presetField.value === 'custom') {
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
    return presetField.displayValue;
  }

  const toggleField = customization.fields.find(f => f.value === true);
  if (toggleField) {
    return toggleField.displayValue === 'Ja' ? 'Hinzugefügt' : toggleField.displayValue;
  }

  return customization.fields.map(f => f.displayValue).join(', ');
}

const fillTestData = () => {
  const { firstName, lastName, email } = getNextName();
  form.value = {
    firstName,
    lastName,
    email,
    address: 'Carl-Zeiss-Ring 15',
    zipCode: '85737',
    city: 'Ismaning',
    country: 'DE'
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
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
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

.item-customizations {
  margin-top: 0.5rem;
}

.customization-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.25rem 0;
}

.customization-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.customization-value {
  color: var(--text-color);
}

.customization-price {
  color: var(--primary-color);
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
  background-color: var(--background-light);
  border-radius: 6px;
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
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
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
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.15s ease-in-out;
  box-shadow: var(--shadow-sm);
  font-family: 'Signika', 'Tahoma', sans-serif;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
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
  background-color: #000;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-md);
}

.place-order-btn:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.place-order-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.payment-info {
  background-color: var(--background-light);
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
  border: 1px solid var(--border-color);
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
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
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
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.15s ease-in-out;
  background-color: white;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  font-family: 'Signika', 'Tahoma', sans-serif;
}

select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

select.error {
  border-color: #dc3545;
}

.fill-test-data-btn {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-md);
}

.fill-test-data-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}
</style> 