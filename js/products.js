// ---------------------------
// PRODUCTS DATA
// ---------------------------

const products = [
  {
    id: "p1",
    name: "Bamboo Toothbrush",
    price: 4.99,
    category: "Bathroom",
    badges: ["organic", "biodegradable"],
    image: "images/products/Bamboo_Toothbrush.png",
    description: "Eco-friendly bamboo toothbrush with soft bristles.",
  },

  {
    id: "p2",
    name: "Reusable Water Bottle",
    price: 12.5,
    category: "Lifestyle",
    badges: ["reusable"],
    image: "images/products/Reusable_Water_Bottle.png",
    description:
      "Stainless steel reusable water bottle, keeps drinks cold for 12 hours.",
  },

  {
    id: "p3",
    name: "Cotton Tote Bag",
    price: 7.99,
    category: "Lifestyle",
    badges: ["plastic-free", "reusable"],
    image: "images/products/Cotton_Tote_Bag.png",
    description: "Strong cotton tote bag, perfect for grocery shopping.",
  },

  {
    id: "p4",
    name: "Bamboo Cutlery Set",
    price: 14.99,
    category: "Kitchen",
    badges: ["biodegradable", "plastic-free"],
    image: "images/products/Bamboo_Cutlery_Set.png",
    description: "Reusable bamboo cutlery set with travel pouch.",
  },

  {
    id: "p5",
    name: "Organic Soap Bar",
    price: 3.99,
    category: "Bathroom",
    badges: ["organic"],
    image: "images/products/Organic_Soap_Bar.png",
    description: "Chemical-free handmade organic soap bar.",
  },

  {
    id: "p6",
    name: "Coconut Fiber Scrubber",
    price: 5.49,
    category: "Cleaning",
    badges: ["biodegradable"],
    image: "images/products/Coconut_Fiber_Scrubber.png",
    description: "Natural coconut fiber scrubber for dishwashing.",
  },
  {
    id: "p7",
    name: "Beeswax Food Wraps (Set of 3)",
    price: 9.99,
    category: "Kitchen",
    badges: ["reusable", "plastic-free"],
    image: "images/products/Beeswax_Food_Wraps.png",
    description:
      "Reusable beeswax wraps for food storage — washable and compostable.",
  },
  {
    id: "p8",
    name: "Glass Lunch Jar",
    price: 18.5,
    category: "Kitchen",
    badges: ["reusable", "plastic-free"],
    image: "images/products/Glass_Lunch_Jar.png",
    description:
      "Leak-proof glass jar with stainless lid — perfect for salads and meals on the go.",
  },
  {
    id: "p9",
    name: "Zero-Waste Starter Kit",
    price: 29.99,
    category: "Lifestyle",
    badges: ["plastic-free", "reusable"],
    image: "images/products/Zero_Waste_Starter_Kit.png",
    description:
      "Starter kit with bamboo cutlery, reusable straw, and tote — great eco gift.",
  },
];

// Make products array available globally
window.products = products;
