/* =========================================================
   SETTINGS: edit these
========================================================= */
const CONFIG = {
  // WhatsApp number: country code + number, no "+" or spaces
  whatsappNumber: "918080252353",
  businessName: "Gaurav Tours And Travels",
  // Optional: your Google "write a review" link. Leave empty to hide it.
  googleReviewUrl: ""
};

// Genuine customer reviews shown on the site.
// When someone sends you a review on WhatsApp, add it here, e.g.:
// { name: "Rahul", rating: 5, text: "Great car and smooth trip.", date: "02/10/2026" },
const FEATURED_REVIEWS = [];

const REQUIRED_BOOKING_FIELDS = [
  "name", "phone", "pickupLocation", "dropLocation",
  "travelDate", "pickupTime", "passengers", "vehicle", "tripType"
];


/* =========================================================
   HELPERS
========================================================= */
function whatsappUrl(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(whatsappUrl(message), "_blank", "noopener");
}

// Reads every named field of a form into { fieldName: trimmedValue }
function readForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = String(value).trim();
  });
  return data;
}

// type: "error" or "success". Call with no message to clear.
function showStatus(element, message = "", type = "") {
  element.textContent = message;
  element.classList.remove("error", "success");
  if (type) element.classList.add(type);
}

// Visitor's local date as YYYY-MM-DD (toISOString alone would give the UTC date)
function localDateString(date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function starString(rating) {
  const stars = Math.min(5, Math.max(0, Math.round(Number(rating)) || 0));
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}


/* =========================================================
   WHATSAPP MESSAGES
========================================================= */
function buildBookingMessage(data) {
  const lines = [
    "🚗 NEW CAB BOOKING REQUEST",
    "",
    `👤 Customer: ${data.name}`,
    `📞 Phone: ${data.phone}`,
    "",
    `📍 Pickup Location: ${data.pickupLocation}`,
    `🏁 Drop Location: ${data.dropLocation}`,
    "",
    `📅 Travel Date: ${data.travelDate}`,
    `🕐 Pickup Time: ${data.pickupTime}`
  ];

  if (data.returnDate) lines.push(`📅 Return Date: ${data.returnDate}`);

  lines.push(
    "",
    `👥 Passengers: ${data.passengers}`,
    `🚘 Vehicle: ${data.vehicle}`,
    `🧭 Trip Type: ${data.tripType}`,
    "",
    "💬 Message:",
    data.message || "No special requirements"
  );

  return lines.join("\n");
}

function buildReviewMessage(name, rating, text) {
  return [
    "⭐ NEW CUSTOMER REVIEW",
    "",
    `👤 Name: ${name}`,
    `⭐ Rating: ${starString(rating)} (${rating}/5)`,
    "",
    "💬 Review:",
    text
  ].join("\n");
}


/* =========================================================
   PAGE FEATURES
========================================================= */
function setupBrokenImages() {
  document.querySelectorAll("img").forEach((img) => {
    const markBroken = () => img.classList.add("broken");
    if (img.complete && img.naturalWidth === 0) markBroken();
    else img.addEventListener("error", markBroken);
  });
}

function setupMobileMenu() {
  const nav = document.getElementById("mainNav");

  document.getElementById("menuToggle").addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// Any link with class "wa-link" opens WhatsApp with its data-msg text
function setupWhatsAppLinks() {
  document.querySelectorAll(".wa-link").forEach((link) => {
    const text = link.dataset.msg || "I would like to book a cab.";
    link.href = whatsappUrl(`Hello ${CONFIG.businessName}, ${text}`);
    link.target = "_blank";
    link.rel = "noopener";
  });
}

function setupFaq() {
  document.querySelectorAll(".faq-q").forEach((button) => {
    button.addEventListener("click", () => button.parentElement.classList.toggle("open"));
  });
}


/* =========================================================
   BOOKING FORM
========================================================= */
function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  const status = document.getElementById("bookingStatus");
  const modal = document.getElementById("successModal");
  const travelDate = document.getElementById("travelDate");
  const returnDate = document.getElementById("returnDate");
  const today = localDateString(new Date());

  travelDate.min = today;
  returnDate.min = today;

  travelDate.addEventListener("change", () => {
    returnDate.min = travelDate.value || today;
  });

  document.getElementById("modalDoneBtn").addEventListener("click", () => {
    modal.classList.remove("open");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);

    if (REQUIRED_BOOKING_FIELDS.some((field) => !data[field])) {
      showStatus(status, "Please fill in all required fields.", "error");
      return;
    }

    if (data.returnDate && data.returnDate < data.travelDate) {
      showStatus(status, "Return date cannot be before travel date.", "error");
      return;
    }

    openWhatsApp(buildBookingMessage(data));
    form.reset();
    returnDate.min = today;
    showStatus(status);
    modal.classList.add("open");
  });
}


/* =========================================================
   REVIEWS
   Shows FEATURED_REVIEWS on the page. New reviews from the form
   are sent to you on WhatsApp so you can check and add them above.
========================================================= */
function renderReviews(reviews) {
  const summary = document.getElementById("reviewSummary");
  const list = document.getElementById("reviewList");

  if (reviews.length === 0) {
    summary.replaceChildren();
    list.replaceChildren(
      makeElement("div", "no-reviews", "No reviews yet. Be the first to share your experience!")
    );
    return;
  }

  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  const average = total / reviews.length;
  const countText = `Based on ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;

  summary.replaceChildren(
    makeElement("div", "avg-score", average.toFixed(1)),
    makeElement("div", "stars", starString(average)),
    makeElement("div", "review-count", countText)
  );

  const cards = reviews.slice().reverse().map((review) => {
    const head = makeElement("div", "review-head");
    head.append(
      makeElement("span", "review-name", review.name),
      makeElement("span", "review-date", review.date || "")
    );

    const card = makeElement("div", "review-card");
    card.append(
      head,
      makeElement("div", "stars", starString(review.rating)),
      makeElement("p", "review-text", review.text)
    );
    return card;
  });

  list.replaceChildren(...cards);
}

function setupReviews() {
  const form = document.getElementById("reviewForm");
  const status = document.getElementById("reviewStatus");
  const starButtons = document.querySelectorAll("#starPicker button");
  const googleLink = document.getElementById("googleReviewLink");
  let selectedRating = 0;

  function setRating(value) {
    selectedRating = value;
    starButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.value) <= value);
    });
  }

  starButtons.forEach((button) => {
    button.addEventListener("click", () => setRating(Number(button.dataset.value)));
  });

  if (CONFIG.googleReviewUrl) {
    googleLink.href = CONFIG.googleReviewUrl;
    googleLink.hidden = false;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readForm(form);

    if (selectedRating === 0) {
      showStatus(status, "Please select a star rating.", "error");
      return;
    }

    if (!data.name || !data.text) {
      showStatus(status, "Please enter your name and review.", "error");
      return;
    }

    openWhatsApp(buildReviewMessage(data.name, selectedRating, data.text));
    form.reset();
    setRating(0);
    showStatus(status, "Thank you! WhatsApp has opened with your review. Please tap Send to share it with us.", "success");
  });

  renderReviews(FEATURED_REVIEWS);
}


/* =========================================================
   START
========================================================= */
setupBrokenImages();
setupMobileMenu();
setupWhatsAppLinks();
setupFaq();
setupBookingForm();
setupReviews();
