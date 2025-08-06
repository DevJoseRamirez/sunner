const GIFT_HANDLE = "sunner-mystery-tee";
function getCartSectionsToRender() {
  return [
    {
      id: "main-cart-items",
      section: document.getElementById("main-cart-items")?.dataset.id,
      selector: ".js-contents",
    },
    {
      id: "cart-icon-bubble",
      section: "cart-icon-bubble",
      selector: ".shopify-section",
    },
    {
      id: "cart-live-region-text",
      section: "cart-live-region-text",
      selector: ".shopify-section",
    },
    {
      id: "main-cart-footer",
      section: document.getElementById("main-cart-footer")?.dataset.id,
      selector: ".js-contents",
    },
  ];
}

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems =
        this.closest("cart-items") || this.closest("cart-drawer-items");
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status") ||
      document.getElementById("CartDrawer-LineItemStatus");

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "cart-items") {
          return;
        }
        this.onCartUpdate();
      }
    );
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  //
  // onChange(event) {
  // this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'), event.target.dataset.quantityVariantId);
  // }

  onChange(event) {
    const target = event.target;
    const lineIndex = parseInt(target.dataset.index, 10);
    const value = target.value;

    // If this is the free-gift size selector, swap the gift
    if (
      target.tagName === "SELECT" &&
      target.classList.contains("mystery-tee-selector")
    ) {
      const newVariantId = parseInt(target.value, 10);
      console.log("[FreeGift] mystery-tee-selector changed →", newVariantId);
      this.freeGiftSelectChange(lineIndex, newVariantId);
      console.log(lineIndex, newVariantId);
      return;
    } else if (target.type === "number") {
      // Standard quantity change
      this.updateQuantity(
        lineIndex,
        value,
        document.activeElement.getAttribute("name"),
        target.dataset.quantityVariantId
      );
    }
  }

  onCartUpdate() {
    if (this.tagName === "CART-DRAWER-ITEMS") {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const selectors = ["cart-drawer-items", ".cart-drawer__footer"];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const sourceQty = html.querySelector("cart-items");
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents",
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) ||
          document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll(".cart-item");

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute("value");
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle("is-empty", parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector("cart-drawer");
        const cartFooter = document.getElementById("main-cart-footer");

        if (cartFooter)
          cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
        if (cartDrawerWrapper)
          cartDrawerWrapper.classList.toggle(
            "is-empty",
            parsedState.item_count === 0
          );

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document
              .getElementById(section.id)
              .querySelector(section.selector) ||
            document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1]
          ? parsedState.items[line - 1].quantity
          : undefined;
        let message = "";
        if (
          items.length === parsedState.items.length &&
          updatedValue !== parseInt(quantityElement.value)
        ) {
          if (typeof updatedValue === "undefined") {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace(
              "[quantity]",
              updatedValue
            );
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) ||
          document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(
                cartDrawerWrapper,
                lineItem.querySelector(`[name="${name}"]`)
              )
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper.querySelector(".drawer__inner-empty"),
            cartDrawerWrapper.querySelector("a")
          );
        } else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper,
            document.querySelector(".cart-item__name")
          );
        }

        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: "cart-items",
          cartData: parsedState,
          variantId: variantId,
        });
      })
      .catch(() => {
        this.querySelectorAll(".loading-overlay").forEach((overlay) =>
          overlay.classList.add("hidden")
        );
        const errors =
          document.getElementById("cart-errors") ||
          document.getElementById("CartDrawer-CartErrors");
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) ||
      document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError)
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.add("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading-overlay`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading-overlay`
    );

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
      overlay.classList.remove("hidden")
    );

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.remove("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading-overlay`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading-overlay`
    );

    cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
    cartDrawerItemElements.forEach((overlay) =>
      overlay.classList.add("hidden")
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // FREE GIFT SELECT CHAGNE
  // ─────────────────────────────────────────────────────────────────
  async freeGiftSelectChange(lineIndex, newVariantId) {
    if (!newVariantId || isNaN(newVariantId)) {
      console.warn("Invalid variant ID for mystery tee");
      return;
    }

    // Show loading overlay on that line
    this.enableLoading(lineIndex);

    try {
      // 1) Find the actual gift line in the cart by product handle
      const cart = await fetch("/cart.js", { credentials: "same-origin" }).then(
        (r) => r.json()
      );
      const giftIdx = cart.items.findIndex(
        (i) => i.handle === "sunner-mystery-tee"
      );
      if (giftIdx !== -1) {
        // 2) Remove that gift line
        const removeBody = JSON.stringify({
          line: giftIdx + 1,
          quantity: 0,
          sections: this.getSectionsToRender().map((s) => s.section),
          sections_url: window.location.pathname,
        });
        await fetch(routes.cart_change_url, {
          ...fetchConfig(),
          body: removeBody,
        });
      }

      // 3) Now add the newly selected size
      const addBody = JSON.stringify({
        id: newVariantId,
        quantity: 1,
        sections: this.getSectionsToRender().map((s) => s.section),
        sections_url: window.location.pathname,
      });
      const addRes = await fetch(routes.cart_add_url, {
        ...fetchConfig(),
        body: addBody,
      });
      const parsed = await addRes.json();

      // new “one-and-done” full-drawer render
      const drawer =
        document.querySelector("cart-drawer") ||
        document.querySelector("cart-notification");
      if (drawer && typeof drawer.renderContents === "function") {
        drawer.renderContents(parsed);
      } else {
        // fallback to your existing manual sections if needed
        this.classList.toggle("is-empty", parsed.item_count === 0);
        this.getSectionsToRender().forEach(({ id, selector }) => {
          const target =
            document.getElementById(id).querySelector(selector) ||
            document.getElementById(id);
          target.innerHTML = new DOMParser()
            .parseFromString(parsed.sections[id], "text/html")
            .querySelector(selector).innerHTML;
        });
      }

      publish(PUB_SUB_EVENTS.cartUpdate, {
        source: "mystery-tee-update",
        cartData: parsed,
        variantId: newVariantId,
      });
    } catch (err) {
      console.error("updateFreegift error:", err);
    } finally {
      this.disableLoading(lineIndex);
    }
  }

  // ─────────────────────────────────────────────────────────────────
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          "change",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, {
              ...fetchConfig(),
              ...{ body },
            });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

// ─────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────
(function () {
  const SELECTOR = ".cart-progress";
  const el = document.querySelector(SELECTOR);
  const THRESHOLD = el ? parseInt(el.dataset.threshold, 10) : 5000; // default $50

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function updateProgress(cart) {
    const total = cart.total_price || 0;
    const remaining = Math.max(0, THRESHOLD - total);
    const pct = Math.min(100, Math.round((total / THRESHOLD) * 100));

    const wrap = document.querySelector(SELECTOR);
    if (!wrap) return;

    wrap.querySelector(".cart-progress__remaining").textContent =
      formatMoney(remaining);
    wrap.querySelector(".cart-progress__fill").style.width = pct + "%";
    wrap
      .querySelector(".cart-progress__bar")
      .setAttribute("aria-valuenow", pct);

    const label = wrap.querySelector(".cart-progress__label");
    if (remaining === 0) {
      label.textContent = "🎉 You’ve unlocked your free gift!";
    } else {
      label.innerHTML = `You are <span class="cart-progress__remaining">${formatMoney(
        remaining
      )}</span> away from your free gift!`;
    }
  }

  function fetchCartProgress() {
    fetch("/cart.js", { credentials: "same-origin" })
      .then((r) => r.json())
      .then(updateProgress)
      .catch(() => {});
  }

  document.addEventListener("DOMContentLoaded", fetchCartProgress);
  document.addEventListener("cart-drawer:open", fetchCartProgress);
  try {
    subscribe(PUB_SUB_EVENTS.cartUpdate, fetchCartProgress);
  } catch (e) {}
})();

// ─────────────────────────────────────────────────────────────────
// FREE GIFT AUTO-ADD/REMOVE
// ─────────────────────────────────────────────────────────────────
(function () {
  // 1) Your gift’s variant ID (replace with the actual ID from Shopify).
  const GIFT_HANDLE = "sunner-mystery-tee";
  const DEFAULT_VARIANT = 44986453819588;

  // 2) Read the $50 threshold (in cents) from your progress bar’s data-attribute.
  const wrap = document.querySelector(".cart-progress");
  const THRESHOLD = wrap ? parseInt(wrap.dataset.threshold, 10) : 5000;

  // Right alongside your addGift/removeGift/handleFreeGift…
  async function fetchCartAndHandle() {
    console.log("fetchCartAndHandle");
    try {
      const r = await fetch("/cart.js", { credentials: "same-origin" });
      const cart = await r.json();
      return handleFreeGift(cart);
    } catch {}
  }

  async function addGift() {
    console.log("run addition");
    const payload = {
      id: DEFAULT_VARIANT,
      quantity: 1,
    };
    console.log("[FreeGift] ▶️ addGift payload:", payload);
    const cfg = fetchConfig("javascript");
    cfg.headers["X-Requested-With"] = "XMLHttpRequest";
    cfg.headers["Content-Type"] = "application/json";
    cfg.body = JSON.stringify(payload);
    const res = await fetch(routes.cart_add_url, cfg);
    console.log("[FreeGift] addGift status:", res.status);
    const json = await res.json();
    console.log("[FreeGift] 📦 addGift JSON:", json);
    return json;
  }

  // 4) Helper to remove the gift variant.
  async function removeGift() {
    console.log("run removal");
    // 1) Grab the real cart
    const cart = await fetch("/cart.js", { credentials: "same-origin" }).then(
      (r) => r.json()
    );
    console.log("[FreeGift] items before removal:", cart.items);

    // 2) Build updates: zero out every gift variant
    const updates = cart.items
      .filter((i) => i.handle === GIFT_HANDLE)
      .reduce((m, i) => ((m[i.variant_id] = 0), m), {});

    if (!Object.keys(updates).length) {
      console.log("[FreeGift] no gift to remove");
      return cart;
    }

    console.log(
      "[FreeGift] all item handles:",
      cart.items.map((i) => i.handle)
    );
    console.log(
      "[FreeGift] all variant_ids:",
      cart.items.map((i) => i.variant_id)
    );

    const payload = {
      updates,
      sections: this.getCartSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    };

    console.log("[FreeGift] ▶️ removeGift payload:", payload);
    //  - we dong get this payload log

    const cfg = fetchConfig("javascript");
    cfg.headers["X-Requested-With"] = "XMLHttpRequest";
    cfg.headers["Content-Type"] = "application/json";
    cfg.body = JSON.stringify(payload);

    const res = await fetch(routes.cart_update_url, cfg);
    console.log("[FreeGift] removeGift status:", res.status);
    const json = await res.json();
    console.log("[FreeGift] 📦 removeGift JSON:", json);
    return json;
  }

  // 5) Core logic: if cart ≥ threshold & gift missing → add,
  //                  if cart < threshold & gift present → remove.
  function handleFreeGift(cart) {
    console.log("handleFreeGift");

    // 🚨 DEBUG LOGS
    console.log("[FreeGift] 🔍 cart JSON:", cart);
    console.log("[FreeGift] 🔢 total_price (¢):", cart.total_price);
    console.log(
      "[FreeGift] 📦 items:",
      cart.items.map((i) => ({
        id: i.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        title: i.title,
      }))
    );
    console.log("[FreeGift] 🎯 threshold (¢):", THRESHOLD);

    const total = cart.total_price || 0;
    const giftItems = cart.items.filter((i) => i.handle === GIFT_HANDLE);
    const hasGift = giftItems.length > 0;

    console.log(
      "[FreeGift] ➡️ hasGift?",
      hasGift,
      "total >= threshold?",
      total >= THRESHOLD
    );

    if (total >= THRESHOLD && !hasGift) {
      console.log("[FreeGift] 🛒 Adding gift now");
      addGift().then((newCart) =>
        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: "free-gift-add",
          cartData: newCart,
        })
      );
    } else if (total < THRESHOLD && hasGift) {
      console.log("[FreeGift] 🚫 Removing gift now");
      removeGift().then((newCart) =>
        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: "free-gift-remove",
          cartData: newCart,
        })
      );
    } else {
      console.log("[FreeGift] ⚖️ No action needed");
    }
  }

  document.addEventListener("DOMContentLoaded", fetchCartAndHandle);
  document.addEventListener("cart-drawer:open", fetchCartAndHandle);

  try {
    subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      // Only skip our own gift‐add/remove loops…
      if (
        event.source === "free-gift-add" ||
        event.source === "free-gift-remove"
      ) {
        return;
      }
      console.log("fetchCartAndHandle running ");
      fetchCartAndHandle();
    });
  } catch (e) {
    console.warn("FreeGift: subscription failed", e);
  }
  window.handleFreeGift = handleFreeGift;
})();
