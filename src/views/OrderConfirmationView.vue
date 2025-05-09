<template>
  <div class="order-confirmation">
    <div class="confirmation-card">
      <div class="success-icon">✓</div>
      <h1>Bestellung bestätigt!</h1>
      <p class="order-number">Bestellnummer #{{ orderNumber }}</p>
      
      <div class="confirmation-details">
        <div class="detail-section">
          <h2>Zahlungsinformationen</h2>
          <p class="payment-method">
            Zahlungsmethode: {{ paymentMethodDisplay }}
          </p>
        </div>
        
        <div class="detail-section">
          <h2>Was passiert als nächstes?</h2>
          <p v-if="paymentMethod === 'cash'">
            Sie können Ihre Bestellung bei Abholung bezahlen oder beim Bezahlen mit unserer mobilen App.
          </p>
          <p v-else>
            Ihre Zahlung wurde erfolgreich verarbeitet.
          </p>
          <p class="delivery-info">
            Wir werden Sie benachrichtigen, wenn Ihre Bestellung abgeholt oder geliefert werden kann.
          </p>
        </div>
      </div>
      
      <router-link to="/" class="continue-shopping">
        Weiter einkaufen
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const orderNumber = computed(() => route.params.orderNumber);
const paymentMethod = computed(() => route.params.paymentMethod);

const paymentMethodDisplay = computed(() => {
  switch (paymentMethod.value) {
    case 'credit':
      return 'Credit Card';
    case 'debit':
      return 'Debit Card';
    case 'cash':
      return 'Cash on Delivery';
    default:
      return 'Unknown';
  }
});
</script>

<style scoped>
.order-confirmation {
  padding: 2rem;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-card {
  background-color: var(--background-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color);
  color: var(--background-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
}

h1 {
  color: var(--text-color);
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem;
}

.order-number {
  color: var(--primary-color);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 2rem;
}

.confirmation-details {
  text-align: left;
  margin-bottom: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

h2 {
  color: var(--text-color);
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.payment-method {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.delivery-info {
  color: var(--text-secondary);
  margin: 1rem 0 0;
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

@media (max-width: 768px) {
  .confirmation-card {
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
}
</style> 