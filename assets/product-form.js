if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');

        if (document.querySelector("cart-drawer"))
          this.submitButton.setAttribute("aria-haspopup", "dialog");

        this.hideErrors = this.dataset.hideErrors === "true";
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();
        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");
        this.querySelector(".loading-overlay__spinner").classList.remove(
          "hidden"
        );

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);

        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(routes.cart_add_url, config)
          .then((res) => res.json())
          .then((response) => {
            if (response.status) {
              this.handleErrorMessage(response.description);
              this.error = true;
              return;
            }
            this.error = false;
            if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            // RENDER & TRIGGER CART UPDATE for the progress bar & gift logic
            this.cart.renderContents(response);
            if (typeof publish === "function") {
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: "product-form",
                cartData: response,
              });
            }
            
          })
          .catch(console.error)
          .finally(() => {
            this.submitButton.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty")) {
              this.cart.classList.remove("is-empty");
            }
            if (!this.error) {
              this.submitButton.removeAttribute("aria-disabled");
            }
            this.querySelector(".loading-overlay__spinner").classList.add(
              "hidden"
            );
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
