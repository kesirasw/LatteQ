/**
 * Test data for Toolshop (practicesoftwaretesting.com). Values come from ui-context/toolshop/MAP.md.
 */

export const ToolshopData = {
  products: {
    combinationPliers: 'Combination Pliers',
    pliers: 'Pliers',
  },
  searchTerm: 'pliers',
  category: 'Hammer',
  brand: 'ForgeFlex Tools',
  sortOptions: {
    priceAsc: 'Price (Low - High)',
    priceDesc: 'Price (High - Low)',
    nameAsc: 'Name (A - Z)',
    nameDesc: 'Name (Z - A)',
  },
  /**
   * Billing address the shop accepts: with Country Austria, the postcode lookup for 1010 / house 1
   * fills Street, City and State itself (MAP: "Address validation").
   */
  address: { country: 'Austria', countryCode: 'AT', postalCode: '1010', houseNumber: '1' },
  /** A state that doesn't belong to Austria; the shop refuses orders with it (TC-CHK-11, API-04). */
  mismatchedState: 'Missouri',
  contactSubject: 'Customer service',
  contactMessage:
    'Hello from the LatteQ automation practice suite. This message is comfortably longer than fifty characters.',
} as const;

/** Messages shown by the site, exactly as observed (MAP flow IDs in comments). */
export const ToolshopMessages = {
  searchedFor: (term: string) => `Searched for: ${term}`, // C2
  alreadyLoggedIn: /you are already logged in\. You can proceed to checkout\./, // K3
  productAdded: 'Product added to shopping cart.', // P4
  favouriteUnauthorized: 'Unauthorized, can not add product to your favorite list.', // P3
  productDeleted: 'Product deleted.', // K10
  cartEmpty: 'The cart is empty. Nothing to display.', // K10
  paymentSuccess: 'Payment was successful', // K7
  orderThanks: /Thanks for your order! Your invoice number is/, // K15
  invalidCardNumber: 'Invalid card number format.', // K14
  invalidGiftCardNumber: 'Please enter a valid gift card number: exactly 16 letters and/or digits.', // K14
  invalidGiftCardCode: 'Please enter a valid validation code: exactly 4 letters and/or digits.', // K14
  emailRequired: 'Email is required', // A1
  invalidLogin: 'Invalid email or password', // A3
  passwordTooShort: 'Password must be minimal 6 characters long.', // R4
  contactThanks: 'Thanks for your message! We will contact you shortly.', // F2
  forgotPasswordRawKey: 'page.forgot-password.confirm', // R2 (missing translation)
  attachmentNotEmpty: 'File should be empty.', // F3
  attachmentRule: 'Only files with the txt extension are allowed, and files must be 0kb.', // F1
} as const;

/** A unique, valid customer for registration. Throwaway accounts on the public demo, not real credentials. */
export const newToolshopCustomer = () => {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  return {
    first_name: 'Latte',
    last_name: `Tester${unique.slice(-6)}`,
    email: `latteq.${unique}@example.com`,
    password: `LatteQ!${unique.slice(-6)}a`,
    dob: '1990-01-01',
    phone: '0612345678',
    address: {
      street: 'Marvin-Krenn-Gasse',
      house_number: ToolshopData.address.houseNumber,
      city: 'Mittersill',
      state: 'Vorarlberg',
      country: ToolshopData.address.countryCode,
      postal_code: ToolshopData.address.postalCode,
    },
  };
};

export type ToolshopCustomerData = ReturnType<typeof newToolshopCustomer>;
