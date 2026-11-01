const products = [
    {
        id: "pancakes",
        name: "Fluffy Pancakes",
        category: "Breakfast",
        description: "Golden pancakes served with maple syrup and fresh berries.",
        price: 125,
        image: "https://www.cucinabyelena.com/wp-content/uploads/2024/09/Ultimate-Fluffy-Pancakes-Recipe-20-scaled.jpg"
    },
    {
        id: "breakfast-plate",
        name: "Classic Breakfast Plate",
        category: "Breakfast",
        description: "Eggs, toast, and savory breakfast favorites to start your day.",
        price: 175,
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "waffles",
        name: "Berry Waffles",
        category: "Breakfast",
        description: "Crisp waffles topped with berries and a drizzle of syrup.",
        price: 145,
        image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "burger",
        name: "Deluxe Burger",
        category: "Main Course",
        description: "Premium beef burger with fresh vegetables and special sauce.",
        price: 245,
        image: "https://img.taste.com.au/Ldl7mSIx/taste/2016/11/deluxe-bacon-burgers-108150-1.jpeg"
    },
    {
        id: "pasta",
        name: "Creamy Garlic Pasta",
        category: "Main Course",
        description: "Creamy garlic sauce tossed with pasta and herbs.",
        price: 225,
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "chicken-meal",
        name: "Crispy Chicken Meal",
        category: "Main Course",
        description: "Golden crispy chicken served with a hearty side.",
        price: 235,
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "chocolate-cake",
        name: "Chocolate Cake",
        category: "Dessert",
        description: "Rich, moist chocolate cake with creamy frosting.",
        price: 185,
        image: "https://assets-jpcust.jwpsrv.com/thumbnails/8Mhboqg7-1280.jpg"
    },
    {
        id: "cheesecake",
        name: "Strawberry Cheesecake",
        category: "Dessert",
        description: "Smooth cheesecake finished with sweet strawberry topping.",
        price: 165,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "brownie",
        name: "Fudgy Brownie",
        category: "Dessert",
        description: "A soft-centered chocolate brownie baked to perfection.",
        price: 95,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "iced-coffee",
        name: "Iced Coffee",
        category: "Beverage",
        description: "Refreshing cold brew coffee topped with creamy foam.",
        price: 95,
        image: "https://www.allrecipes.com/thmb/Hqro0FNdnDEwDjrEoxhMfKdWfOY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/21667-easy-iced-coffee-ddmfs-4x3-0093-7becf3932bd64ed7b594d46c02d0889f.jpg"
    },
    {
        id: "fruit-smoothie",
        name: "Fruit Smoothie",
        category: "Beverage",
        description: "A chilled blend of fresh fruit for a bright, refreshing sip.",
        price: 115,
        image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "lemonade",
        name: "Fresh Lemonade",
        category: "Beverage",
        description: "Freshly squeezed lemonade served ice cold.",
        price: 75,
        image: "assets/fresh-lemonade.svg"
    }
];

const productGrid = document.querySelector("#products-grid");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#product-sort");
const resultMessage = document.querySelector("#menu-result");
const filterButtons = document.querySelectorAll(".filter-button");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cart-panel");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const closeCartButton = document.querySelector("#cart-close");
const clearCartButton = document.querySelector("#clear-cart");
const cartToast = document.querySelector("#cart-toast");
const cartToastMessage = document.querySelector("#cart-toast-message");
const cartToastViewButton = document.querySelector("#cart-toast-view");

let activeCategory = "All";
let toastTimeout;
const cart = new Map();
const cartStorageKey = "spud-food-store-cart";

function restoreCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
        if (!Array.isArray(savedCart)) {
            throw new TypeError("Saved cart data must be a list.");
        }

        savedCart.forEach((savedItem) => {
            if (!savedItem || typeof savedItem !== "object") return;
            const product = products.find((item) => item.id === savedItem.id);
            if (product && Number.isSafeInteger(savedItem.quantity) && savedItem.quantity > 0) {
                cart.set(product.id, { product, quantity: savedItem.quantity });
            }
        });
    } catch (error) {
        console.warn("The saved cart could not be restored; starting with an empty cart.", error);
    }
}

function saveCart() {
    try {
        localStorage.setItem(cartStorageKey, JSON.stringify(
            Array.from(cart.values(), ({ product, quantity }) => ({ id: product.id, quantity }))
        ));
    } catch (error) {
        console.warn("The cart could not be saved in this browser.", error);
    }
}

function addImageFallbacks(container) {
    container.querySelectorAll("img[data-fallback]").forEach((image) => {
        image.addEventListener("error", () => {
            image.src = "assets/food-placeholder.svg";
            image.removeAttribute("data-fallback");
        }, { once: true });
    });
}

function formatPrice(amount) {
    return `₱${amount.toFixed(2)}`;
}

function renderProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const visibleProducts = products.filter((product) => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = `${product.name} ${product.category} ${product.description}`
            .toLowerCase()
            .includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    if (sortSelect.value === "price-low") {
        visibleProducts.sort((first, second) => first.price - second.price);
    } else if (sortSelect.value === "price-high") {
        visibleProducts.sort((first, second) => second.price - first.price);
    } else if (sortSelect.value === "name") {
        visibleProducts.sort((first, second) => first.name.localeCompare(second.name));
    }

    productGrid.innerHTML = visibleProducts.map((product) => `
        <article class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" data-fallback>
                ${["pancakes", "burger", "iced-coffee"].includes(product.id) ? '<span class="product-ribbon">SPUD favorite</span>' : ""}
            </div>
            <div class="product-info">
                <div class="product-title-row"><h3>${product.name}</h3><span class="product-rating" aria-label="Customer favorite">★</span></div>
                <p class="category">${product.category}</p>
                <p class="description">${product.description}</p>
                <div class="product-buy-row"><p class="price">${formatPrice(product.price)}</p>
                <button class="btn btn-secondary add-to-cart" type="button" data-product-id="${product.id}">
                    <span aria-hidden="true">＋</span> Add to cart
                </button></div>
            </div>
        </article>
    `).join("");

    addImageFallbacks(productGrid);
    resultMessage.textContent = visibleProducts.length
        ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "delicious pick" : "delicious picks"} to explore`
        : "No menu items match your search. Try another word or category.";
}

function updateMenuNavigation() {
    const menuIsCurrent = ["#menu", "#products-grid"].includes(window.location.hash);
    const homeLink = document.querySelector('.nav-menu a[href="index.html"]');
    const menuLink = document.querySelector('.nav-menu a[href="#menu"]');

    homeLink.classList.toggle("active", !menuIsCurrent);
    homeLink.toggleAttribute("aria-current", !menuIsCurrent);
    menuLink.classList.toggle("active", menuIsCurrent);
    menuLink.toggleAttribute("aria-current", menuIsCurrent);
    if (!menuIsCurrent) homeLink.setAttribute("aria-current", "page");
    if (menuIsCurrent) menuLink.setAttribute("aria-current", "location");
}

function openCart() {
    cartPanel.classList.add("is-open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartPanel.inert = false;
    cartBackdrop.hidden = false;
    cartToggle.setAttribute("aria-expanded", "true");
    closeCartButton.focus();
}

function closeCart() {
    cartPanel.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartPanel.inert = true;
    cartBackdrop.hidden = true;
    cartToggle.setAttribute("aria-expanded", "false");
    cartToggle.focus();
}

function renderCart() {
    const items = Array.from(cart.values());
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    cartCount.textContent = itemCount;
    cartToggle.setAttribute("aria-label", `Open shopping cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
    cartSubtotal.textContent = formatPrice(subtotal);
    cartEmpty.hidden = items.length > 0;
    clearCartButton.disabled = items.length === 0;
    cartItems.innerHTML = items.map(({ product, quantity }) => `
        <article class="cart-item">
            <img src="${product.image}" alt="" data-fallback>
            <div class="cart-item-info">
                <h3>${product.name}</h3>
                <p>${formatPrice(product.price)} each</p>
                <div class="quantity-controls" aria-label="Quantity for ${product.name}">
                    <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
                    <span>${quantity}</span>
                    <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
                    <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}">Remove</button>
                </div>
            </div>
            <strong class="cart-line-total">${formatPrice(product.price * quantity)}</strong>
        </article>
    `).join("");
    addImageFallbacks(cartItems);
    saveCart();
}

function showAddedFeedback(product, button) {
    cartToastMessage.textContent = `${product.name} added to your cart`;
    cartToast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => cartToast.classList.remove("is-visible"), 3500);

    button.textContent = "Added to Cart ✓";
    button.classList.add("is-added");
    window.clearTimeout(button.feedbackTimeout);
    button.feedbackTimeout = window.setTimeout(() => {
        if (button.isConnected) {
            button.textContent = "Add to Cart";
            button.classList.remove("is-added");
        }
    }, 1400);

    cartCount.classList.remove("is-bumping");
    void cartCount.offsetWidth;
    cartCount.classList.add("is-bumping");
}

productGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart[data-product-id]");
    if (!button) return;

    const product = products.find((item) => item.id === button.dataset.productId);
    if (!product) return;

    const existingItem = cart.get(product.id);
    cart.set(product.id, { product, quantity: (existingItem?.quantity ?? 0) + 1 });
    renderCart();
    showAddedFeedback(product, button);
});

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const item = cart.get(button.dataset.productId);
    if (!item) return;

    if (button.dataset.cartAction === "remove" || (button.dataset.cartAction === "decrease" && item.quantity === 1)) {
        cart.delete(button.dataset.productId);
    } else if (button.dataset.cartAction === "increase") {
        item.quantity += 1;
    } else if (button.dataset.cartAction === "decrease") {
        item.quantity -= 1;
    }

    renderCart();
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });
        renderProducts();
    });
});

cartToggle.addEventListener("click", openCart);
cartToastViewButton.addEventListener("click", () => {
    window.clearTimeout(toastTimeout);
    cartToast.classList.remove("is-visible");
    openCart();
});
closeCartButton.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
clearCartButton.addEventListener("click", () => {
    cart.clear();
    renderCart();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartPanel.classList.contains("is-open")) {
        closeCart();
        return;
    }

    if (event.key === "Tab" && cartPanel.classList.contains("is-open")) {
        const focusableButtons = Array.from(cartPanel.querySelectorAll("button:not(:disabled)"));
        const firstButton = focusableButtons[0];
        const lastButton = focusableButtons[focusableButtons.length - 1];

        if (event.shiftKey && document.activeElement === firstButton) {
            event.preventDefault();
            lastButton.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
            event.preventDefault();
            firstButton.focus();
        }
    }
});

window.addEventListener("hashchange", updateMenuNavigation);
updateMenuNavigation();
restoreCart();
addImageFallbacks(document.querySelector(".hero-visual"));
renderProducts();
renderCart();
