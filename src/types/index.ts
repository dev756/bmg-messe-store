export interface VariantAttribute {
  name: string;           // e.g., "Color", "Size"
  values: string[];       // e.g., ["Red", "Blue", "Green"]
}

// ============================================
// Customization Types
// ============================================

// Input types for customization fields
export type CustomizationInputType = 'text' | 'number' | 'select' | 'toggle' | 'preset-select';

// Validation rules
export interface CustomizationValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

// Option for select inputs
export interface CustomizationOption {
  value: string;
  label: string;
  additionalPrice?: number;
}

// Generic preset option - contains arbitrary key-value pairs
// that map to other field IDs in the same customization
export interface PresetOption {
  id: string;                              // Unique preset ID (e.g., "plea-10")
  label: string;                           // Display label (e.g., "Plea (#10)")
  values: Record<string, string | number>; // Values to auto-fill (e.g., { name: "Plea", number: 10 })
  price: number;                           // Price when this preset is selected
}

// Individual field in a customization
export interface CustomizationField {
  id: string;
  label: string;
  inputType: CustomizationInputType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: CustomizationOption[];         // For 'select' type
  presets?: PresetOption[];                // For 'preset-select' type
  allowCustomInput?: boolean;              // For 'preset-select': allow custom values
  customInputPrice?: number;               // For 'preset-select': price when using custom input
  targetFields?: string[];                 // For 'preset-select': which field IDs to auto-fill
  validation?: CustomizationValidation;
  additionalPrice?: number;                // For other field types
  dependsOn?: {                            // Conditional visibility
    fieldId: string;
    values?: (string | boolean | number)[]; // Show when field matches any of these values
    customOnly?: boolean;                   // Show only when preset-select is in custom mode
  };
}

// A customization type (e.g., "flocking", "badge")
export interface CustomizationType {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  fields: CustomizationField[];
  availableForVariants?: { attributeName: string; values: string[] }[];
  sortOrder?: number;
  basePrice?: number;  // Price applied when customization is enabled (for simple add-ons without fields)
}

// Product-level config
export interface ProductCustomizationConfig {
  customizations: CustomizationType[];
}

// Variant-level override
export interface VariantCustomizationOverride {
  customizationId: string;
  enabled?: boolean;
  fieldOverrides?: {
    fieldId: string;
    presets?: PresetOption[];              // Override presets (with different prices) for this variant
    customInputPrice?: number;             // Override custom input price for this variant
    options?: CustomizationOption[];
    additionalPrice?: number;
  }[];
}

// Selected field value (for cart)
export interface SelectedCustomizationField {
  fieldId: string;
  value: string | number | boolean;
  displayValue: string;
  additionalPrice: number;
}

// Selected customization (for cart)
export interface SelectedCustomization {
  customizationId: string;
  customizationName: string;
  fields: SelectedCustomizationField[];
  totalPrice: number;
}

export interface ConditionalPrice {
  when: Record<string, string>;  // e.g., { "Modell": "Kinder" }
  price: number;
  specialPrice?: number;
}

export interface ConditionalImages {
  when: Record<string, string>;  // e.g., { "Modell": "Herren" }
  imageUrls: string[];
}

export interface VariantCombination {
  attributes: Record<string, string>;  // e.g., { "Color": "Red", "Size": "M" }
  sku: string;            // Unique variant SKU (e.g., "test-m-red")
  stockLevel: number;     // Stock for this specific combination
  imageUrls?: string[];   // Optional variant-specific images
  additionalPrice?: number; // Optional price modifier (e.g., +5 for XL)
  customizationOverrides?: VariantCustomizationOverride[]; // Override customization settings for this variant
}

export interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  specialPrice?: number;
  imageUrls: string[];    // Array of product images
  stockLevel: number;

  // Variant fields
  hasVariants?: boolean;              // Flag for variant products
  variantAttributes?: VariantAttribute[];  // Available variant types
  variants?: VariantCombination[];    // All possible combinations
  conditionalPrices?: ConditionalPrice[];  // Prices based on variant selections
  conditionalImages?: ConditionalImages[]; // Images based on variant selections

  // Customization fields
  customizationConfig?: ProductCustomizationConfig;
}

export interface CartItem {
  sku: string;            // Now contains variant SKU if applicable
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string;
  stockLevel: number;

  // Variant fields
  selectedVariants?: Record<string, string>;  // Selected variant attributes
  cartItemId: string;     // Unique ID: sku + variant hash + customization hash

  // Customization fields
  selectedCustomizations?: SelectedCustomization[];
  customizationTotalPrice?: number;
  finalPrice?: number;    // price + customizationTotalPrice
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface Order {
  orderNumber: string;
  items: {
    sku: string;                           // Variant SKU
    quantity: number;
    selectedVariants?: Record<string, string>;  // Optional: for internal tracking
    customizations?: {
      customizationId: string;
      fields: { fieldId: string; value: string | number | boolean }[];
    }[];
  }[];
  customer: Customer;
} 