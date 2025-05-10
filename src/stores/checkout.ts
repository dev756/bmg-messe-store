import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getNextName } from '../data/swissNames';

export const useCheckoutStore = defineStore('checkout', () => {
  const customerData = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      zip: '',
      country: 'CH'
    }
  });

  function fillDummyData() {
    const { firstName, lastName, email } = getNextName();
    customerData.value = {
      firstName,
      lastName,
      email,
      phone: '+41 79 123 45 67',
      address: {
        street: 'Bahnhofstrasse 1',
        city: 'Zürich',
        zip: '8001',
        country: 'CH'
      }
    };
  }

  function resetCustomerData() {
    customerData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        zip: '',
        country: 'CH'
      }
    };
  }

  return {
    customerData,
    fillDummyData,
    resetCustomerData
  };
}); 