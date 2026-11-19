// ─────────────────────────────────────────────────────────────────────────────
// Pamangan business info — edit this file to update menu, prices, and contacts.
// ─────────────────────────────────────────────────────────────────────────────

export const BUSINESS = {
  name: "Pamangan",
  tagline: "Taste the heart of Pampanga",
  phoneDisplay: "613-252-4037",
  phoneE164: "+16132524037",
  facebookUrl: "https://www.facebook.com/profile.php?id=61582639019954",
  messengerUrl: "https://m.me/61582639019954",
  pickupArea: "Stittsville, Ottawa",
  deliveryAreas: ["Stittsville", "Kanata"],
};

export const telLink = `tel:${BUSINESS.phoneE164}`;

// `?&body=` works on both iOS and Android messaging apps.
export const smsLink = (body = "") =>
  `sms:${BUSINESS.phoneE164}${body ? `?&body=${encodeURIComponent(body)}` : ""}`;

// price: number in CAD, or null → "Message us for price"
export const MENU = [
  {
    id: "sisig",
    name: "Kapampangan Sisig",
    native: "Sisig",
    category: "Mains",
    price: 60,
    serving: "Tray · good for 5–6 people",
    description:
      "The pride of Pampanga — crispy, savoury chopped pork with onions, chili and calamansi. Rich, tangy and perfect with rice.",
    image: "/images/menu/sisig.jpg",
    tags: ["Best seller", "Kapampangan classic"],
  },
  {
    id: "kutsinta",
    name: "Black Kutsinta",
    native: "Kutsinta",
    category: "Kakanin & Sweets",
    price: 30,
    serving: "50 pieces · with dulce de leche dip",
    description:
      "Soft, chewy steamed rice cakes topped with grated coconut, served with our homemade dulce de leche dip.",
    image: "/images/menu/kutsinta.jpg",
    tags: ["Best seller", "Sweet"],
  },
  {
    id: "sushi-bake",
    name: "Sushi Bake",
    native: "Sushi Bake",
    category: "Mains",
    price: 30,
    serving: '11.7 × 9.3" tray · with nori sheets',
    description:
      "Creamy, cheesy and loaded with flavour. Seasoned rice layered with a rich, savoury topping — scoop onto nori and enjoy.",
    image: "/images/menu/sushi-bake.jpg",
    tags: ["Crowd favourite"],
  },
  {
    id: "chicken-roll",
    name: "Chicken Roll",
    native: "Chicken Cordon Bleu",
    category: "Mains",
    price: null,
    serving: "Tray · sliced and ready to serve",
    description:
      "Tender chicken rolled with ham and cheese, breaded and fried golden, then sliced into perfect bite-sized rounds.",
    image: "/images/menu/chicken-roll.jpg",
    tags: ["Kid friendly"],
  },
  {
    id: "pansit",
    name: "Pansit",
    native: "Pancit",
    category: "Noodles",
    price: null,
    serving: "Tray",
    description:
      "Stir-fried noodles with vegetables and meat — the Filipino celebration dish for long life and good luck.",
    image: null,
    tags: ["Party staple"],
  },
];

export const formatPrice = (price) =>
  price == null ? "Message for price" : `$${price}`;

export const STEPS = [
  {
    icon: "bi-calendar-check",
    title: "Pre-order",
    desc: "We cook in batches on scheduled days. Send your order before the cut-off — by form, text or Messenger.",
  },
  {
    icon: "bi-chat-heart",
    title: "We confirm",
    desc: "We'll reply to confirm your order, the total, and your pickup or delivery time.",
  },
  {
    icon: "bi-bag-heart",
    title: "Pickup & enjoy",
    desc: "Pick up fresh in Stittsville, or get delivery to selected areas near Stittsville and Kanata (small fee).",
  },
];

export const TESTIMONIAL = {
  original:
    "Dar, migpatayu naka sana restoran Kapampangan keni Ottawa! Nung makananu makapangan kami naman ning tunay a lasa ning Pampanga! Manyaman ya sobra ing sisig ampon black kutsinta mu, nakakabitin ya!",
  translation:
    "You should open a Kapampangan restaurant here in Ottawa, so we can always eat the true taste of Pampanga! Your sisig and black kutsinta are so delicious — we always want more!",
  author: "A happy ka-Pamangan",
};

// Photos shared on our Facebook page
export const GALLERY = [
  { src: "/images/gallery/13.jpg", alt: "Pamangan dishes — black kutsinta, sushi bake, sisig and chicken roll" },
  { src: "/images/gallery/1.jpg", alt: "Customer holding her Pamangan order" },
  { src: "/images/gallery/10.jpg", alt: "Today's orders — trays of kutsinta, sisig and chicken roll" },
  { src: "/images/gallery/4.jpg", alt: "Two customers with their trays of chicken roll and sisig" },
  { src: "/images/gallery/2.jpg", alt: "Customer feedback in Kapampangan" },
  { src: "/images/gallery/5.jpg", alt: "Family enjoying Pamangan food at the dinner table" },
  { src: "/images/gallery/14.jpg", alt: "Prepping orders of black kutsinta" },
  { src: "/images/gallery/7.jpg", alt: "Customer with a tray of black kutsinta" },
  { src: "/images/gallery/6.jpg", alt: "Today's orders — sisig, chicken roll and kutsinta trays" },
  { src: "/images/gallery/9.jpg", alt: "Handing over a Pamangan takeout bag" },
  { src: "/images/gallery/16.jpg", alt: "Trays of black kutsinta and sushi bake" },
  { src: "/images/gallery/12.jpg", alt: "Chicken cordon bleu, black kutsinta and sisig" },
];
