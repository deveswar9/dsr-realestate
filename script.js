/**
 * DSR Real Estate - Vanilla JavaScript
 * Filters, modal, dynamic property cards, WhatsApp click-to-chat
 */

// WhatsApp configuration (single source of truth)
const WHATSAPP_PHONE = '+919347749926';
const DEFAULT_MESSAGE = 'నమస్తే, మీ వెబ్‌సైట్‌లో ఉన్న ఇల్లు గురించి వివరాలు కావాలి.';

// Sample property data
const properties = [
  {
    id: 1,
    type: 'rent',
    typeLabel: 'అద్దెకు',
    price: 25000,
    location: 'జూబ్లీ హిల్స్, హైదరాబాద్',
    direction: 'తూర్పు',
    mostLovable: true,
    image: 'images/house1.png',
  },
  {
    id: 2,
    type: 'sale',
    typeLabel: 'అమ్మకానికి',
    price: 8500000,
    location: 'ఫిల్మ్ నగర్, హైదరాబాద్',
    direction: 'పడమర',
    mostLovable: false,
    image: 'images/house2.png',
  },
  {
    id: 3,
    type: 'rent',
    typeLabel: 'అద్దెకు',
    price: 35000,
    location: 'బంజారా హిల్స్, హైదరాబాద్',
    direction: 'ఉత్తరం',
    mostLovable: true,
    image: 'images/house3.png',
  },
  {
    id: 4,
    type: 'sale',
    typeLabel: 'అమ్మకానికి',
    price: 12000000,
    location: 'గాచిబోవ్లి, హైదరాబాద్',
    direction: 'దక్షిణం',
    mostLovable: true,
    image: 'images/house4.png',
  },
  {
    id: 5,
    type: 'rent',
    typeLabel: 'అద్దెకు',
    price: 18000,
    location: 'కుకట్పల్లి, హైదరాబాద్',
    direction: 'తూర్పు',
    mostLovable: false,
    image: 'images/house5.png',
  },
  {
    id: 6,
    type: 'sale',
    typeLabel: 'అమ్మకానికి',
    price: 6500000,
    location: 'మద్దపూర్, హైదరాబాద్',
    direction: 'పడమర',
    mostLovable: false,
    image: 'images/house6.png',
  },
];

// State
let currentTypeFilter = 'all';
let directionFilter = '';
let mostLovableFilter = false;
let selectedProperty = null;

// DOM Elements
const gridEl = document.getElementById('properties-grid');
const noResultsEl = document.getElementById('no-results');
const navBtns = document.querySelectorAll('.nav-btn');
const directionEl = document.getElementById('direction-filter');
const mostLovableEl = document.getElementById('most-lovable-filter');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const whatsappFloat = document.getElementById('whatsapp-float');
const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');

/**
 * Format price with Indian Rupee symbol
 */
function formatPrice(price) {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)} కోట్లు`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} లక్షలు`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(0)}K`;
  }
  return `₹${price}`;
}

/**
 * Create property card element
 */
function createCard(property) {
  const card = document.createElement('article');
  card.className = 'property-card';
  card.dataset.id = property.id;

  const badge = property.mostLovable
    ? '<span class="property-badge">అత్యంత ప్రజాదరణ పొందిన ఇల్లు</span>'
    : '';

  const imageHtml = property.image
    ? `<img src="${property.image}" alt="${property.location}" class="property-image-img">`
    : '<div class="property-image-placeholder">ఇల్లు చిత్రం</div>';

  card.innerHTML = `
    <div class="property-image">${imageHtml}</div>
    <div class="property-body">
      <p class="property-type">${property.typeLabel}</p>
      <p class="property-price">${formatPrice(property.price)}</p>
      <p class="property-location">${property.location}</p>
      <p class="property-direction">దిశ: ${property.direction}</p>
      ${badge}
      <button class="property-btn" data-action="details">ఇంకా వివరాలు తెలుసుకోండి</button>
    </div>
  `;

  const btn = card.querySelector('.property-btn');
  btn.addEventListener('click', () => openModal(property));

  return card;
}

/**
 * Open WhatsApp chat with pre-filled message
 * @param {string} message - Telugu message (will be URL-encoded in JS)
 */
function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message || DEFAULT_MESSAGE);
  const phone = WHATSAPP_PHONE.replace(/\s/g, '');
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Get WhatsApp message for current context (property-specific or default)
 */
function getWhatsAppMessage() {
  if (selectedProperty) {
    return `నమస్తే, ${selectedProperty.location} ఇల్లు గురించి వివరాలు కావాలి.`;
  }
  return DEFAULT_MESSAGE;
}

/**
 * Filter properties based on current state
 */
function filterProperties() {
  return properties.filter((p) => {
    // Type filter
    if (currentTypeFilter !== 'all' && p.type !== currentTypeFilter) return false;

    // Direction filter
    if (directionFilter && p.direction !== directionFilter) return false;

    // Most lovable filter
    if (mostLovableFilter && !p.mostLovable) return false;

    return true;
  });
}

/**
 * Render property cards
 */
function renderCards() {
  const filtered = filterProperties();
  gridEl.innerHTML = '';

  if (filtered.length === 0) {
    noResultsEl.hidden = false;
    return;
  }

  noResultsEl.hidden = true;
  filtered.forEach((property) => {
    gridEl.appendChild(createCard(property));
  });
}

/**
 * Open modal popup
 * @param {Object} [property] - Selected property for property-specific WhatsApp message
 */
function openModal(property) {
  selectedProperty = property || null;
  modalOverlay.classList.add('is-open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Trap focus inside modal
  modalClose.focus();
}

/**
 * Close modal popup
 */
function closeModal() {
  modalOverlay.classList.remove('is-open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Event: Nav buttons (All / Rent / Buy)
 */
navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    navBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentTypeFilter = btn.dataset.filter;
    renderCards();
  });
});

/**
 * Event: Direction filter
 */
directionEl.addEventListener('change', () => {
  directionFilter = directionEl.value;
  renderCards();
});

/**
 * Event: Most lovable checkbox
 */
mostLovableEl.addEventListener('change', () => {
  mostLovableFilter = mostLovableEl.checked;
  renderCards();
});

/**
 * Event: Modal close
 */
modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
    closeModal();
  }
});

/**
 * Event: Floating WhatsApp button
 */
whatsappFloat.addEventListener('click', (e) => {
  e.preventDefault();
  openWhatsApp(getWhatsAppMessage());
});

/**
 * Event: Modal WhatsApp button
 */
modalWhatsappBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openWhatsApp(getWhatsAppMessage());
});

// Initial render
renderCards();
