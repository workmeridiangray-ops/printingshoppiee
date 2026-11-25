// ===== Business settings — edit these before going live =====
window.SITE = {
  brand: 'Print Haus',
  phone: '+91 00000 00000',          // shown in header/footer
  whatsapp: '910000000000',          // digits only, with country code — orders are sent here
  email: 'hello@yourdomain.in',
  legalName: '[Legal entity name]',
  gstin: '[GSTIN]',
  hours: 'Mon–Sat, 10am – 7pm IST',

  // Prices in /data are Kraftix's ex-GST prices. 1.00 = same price,
  // 0.95 = 5% cheaper, 1.10 = 10% more. Applied to every product.
  priceMultiplier: 1.0,
  gstRate: 0.18,
  freeShippingAbove: 999,
  shippingFee: 79,
  expressFee: 149,
  designServiceFee: 149,

  // Razorpay: paste your Key ID (rzp_live_… or rzp_test_…) to enable online payment.
  // Leave empty and checkout sends the order to WhatsApp instead.
  razorpayKey: ''
};
