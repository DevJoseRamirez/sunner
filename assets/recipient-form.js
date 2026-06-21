if (!customElements.get('recipient-form')) {
  customElements.define(
    'recipient-form',
    class RecipientForm extends HTMLElement {
      constructor() {
        super();
<<<<<<< HEAD
        this.recipientFieldsLiveRegion = this.querySelector(`#Recipient-fields-live-region-${this.dataset.sectionId}`);
        this.checkboxInput = this.querySelector(`#Recipient-checkbox-${this.dataset.sectionId}`);
        this.checkboxInput.disabled = false;
        this.hiddenControlField = this.querySelector(`#Recipient-control-${this.dataset.sectionId}`);
        this.hiddenControlField.disabled = true;
        this.emailInput = this.querySelector(`#Recipient-email-${this.dataset.sectionId}`);
        this.nameInput = this.querySelector(`#Recipient-name-${this.dataset.sectionId}`);
        this.messageInput = this.querySelector(`#Recipient-message-${this.dataset.sectionId}`);
        this.sendonInput = this.querySelector(`#Recipient-send-on-${this.dataset.sectionId}`);
        this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${this.dataset.sectionId}`);
        if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset().toString();

        this.errorMessageWrapper = this.querySelector('.product-form__recipient-error-message-wrapper');
        this.errorMessageList = this.errorMessageWrapper?.querySelector('ul');
        this.errorMessage = this.errorMessageWrapper?.querySelector('.error-message');
        this.defaultErrorHeader = this.errorMessage?.innerText;
        this.currentProductVariantId = this.dataset.productVariantId;
=======
        this.recipientFieldsLiveRegion = this.querySelector(`#Recipient-fields-live-region-${this.sectionId}-${this.productId}`);
        this.checkboxInput = this.querySelector(`#Recipient-checkbox-${this.sectionId}-${this.productId}`);
        this.checkboxInput.disabled = false;
        this.hiddenControlField = this.querySelector(`#Recipient-control-${this.sectionId}-${this.productId}`);
        this.hiddenControlField.disabled = true;
        this.fieldsContainer = this.querySelector(`#Recipient-fields-${this.sectionId}-${this.productId}`);
        this.emailInput = this.querySelector(`#Recipient-email-${this.sectionId}-${this.productId}`);
        this.nameInput = this.querySelector(`#Recipient-name-${this.sectionId}-${this.productId}`);
        this.messageInput = this.querySelector(`#Recipient-message-${this.sectionId}-${this.productId}`);
        this.sendonInput = this.querySelector(`#Recipient-send-on-${this.sectionId}-${this.productId}`);
        this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${this.sectionId}-${this.productId}`);
        if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset().toString();

        this.errorMessage = this.querySelector('.product-form__recipient-error-message');
        this.errorMessageList = this.errorMessage?.querySelector('ul');
        this.currentProductVariantId = this.getAttribute('data-product-variant-id');
>>>>>>> bdc1b2b (theme save push)
        this.addEventListener('change', this.onChange.bind(this));
        this.onChange();
      }

<<<<<<< HEAD
=======
      get sectionId() {
        return this.getAttribute('data-section-id');
      }

      get productId() {
        return this.getAttribute('data-product-id');
      }

>>>>>>> bdc1b2b (theme save push)
      cartUpdateUnsubscriber = undefined;
      variantChangeUnsubscriber = undefined;
      cartErrorUnsubscriber = undefined;

      connectedCallback() {
<<<<<<< HEAD
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
=======
        this.cartUpdateUnsubscriber = theme.pubsub.subscribe(theme.pubsub.PUB_SUB_EVENTS.cartUpdate, (event) => {
>>>>>>> bdc1b2b (theme save push)
          if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
            this.resetRecipientForm();
          }
        });

<<<<<<< HEAD
        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (event.data.sectionId === this.dataset.sectionId) {
=======
        this.variantChangeUnsubscriber = theme.pubsub.subscribe(theme.pubsub.PUB_SUB_EVENTS.variantChange, (event) => {
          if (event.data.sectionId === this.sectionId) {
>>>>>>> bdc1b2b (theme save push)
            this.currentProductVariantId = event.data.variant.id.toString();
          }
        });

<<<<<<< HEAD
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartError, (event) => {
=======
        this.cartUpdateUnsubscriber = theme.pubsub.subscribe(theme.pubsub.PUB_SUB_EVENTS.cartError, (event) => {
>>>>>>> bdc1b2b (theme save push)
          if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
            this.displayErrorMessage(event.message, event.errors);
          }
        });
      }

      disconnectedCallback() {
        if (this.cartUpdateUnsubscriber) {
          this.cartUpdateUnsubscriber();
        }

        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }

        if (this.cartErrorUnsubscriber) {
          this.cartErrorUnsubscriber();
        }
      }

      onChange() {
        if (this.checkboxInput.checked) {
          this.enableInputFields();
<<<<<<< HEAD
          this.recipientFieldsLiveRegion.innerText = window.accessibilityStrings.recipientFormExpanded;
=======
          this.recipientFieldsLiveRegion.innerText = theme.recipientFormStrings.expanded;
>>>>>>> bdc1b2b (theme save push)
        } else {
          this.clearInputFields();
          this.disableInputFields();
          this.clearErrorMessage();
<<<<<<< HEAD
          this.recipientFieldsLiveRegion.innerText = window.accessibilityStrings.recipientFormCollapsed;
        }
=======
          this.recipientFieldsLiveRegion.innerText = theme.recipientFormStrings.collapsed;
        }

        this.fieldsContainer.classList.toggle('hidden', !this.checkboxInput.checked);
>>>>>>> bdc1b2b (theme save push)
      }

      inputFields() {
        return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput];
      }

      disableableFields() {
        return [...this.inputFields(), this.offsetProperty];
      }

      clearInputFields() {
        this.inputFields().forEach((field) => (field.value = ''));
      }

      enableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = false));
      }

      disableInputFields() {
        this.disableableFields().forEach((field) => (field.disabled = true));
      }

      displayErrorMessage(title, body) {
        this.clearErrorMessage();
<<<<<<< HEAD
        this.errorMessageWrapper.hidden = false;
        if (typeof body === 'object') {
          this.errorMessage.innerText = this.defaultErrorHeader;
          return Object.entries(body).forEach(([key, value]) => {
            const errorMessageId = `RecipientForm-${key}-error-${this.dataset.sectionId}`;
            const fieldSelector = `#Recipient-${key}-${this.dataset.sectionId}`;
            const message = `${value.join(', ')}`;
            const errorMessageElement = this.querySelector(`#${errorMessageId}`);
            const errorTextElement = errorMessageElement?.querySelector('.error-message');
            if (!errorTextElement) return;

            if (this.errorMessageList) {
              this.errorMessageList.appendChild(this.createErrorListItem(fieldSelector, message));
            }

            errorTextElement.innerText = `${message}.`;
            errorMessageElement.classList.remove('hidden');

            const inputElement = this[`${key}Input`];
            if (!inputElement) return;

            inputElement.setAttribute('aria-invalid', true);
            inputElement.setAttribute('aria-describedby', errorMessageId);
          });
        }

        this.errorMessage.innerText = body;
      }

      createErrorListItem(target, message) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', target);
        a.innerText = message;
        li.appendChild(a);
        li.className = 'error-message';
=======
        this.errorMessage.hidden = false;

        if (typeof body === 'object') {
          Object.entries(body).forEach(([key, value]) => {
            const message = `${value.join(', ')}`;

            if (this.errorMessageList) {
              this.errorMessageList.appendChild(this.createErrorListItem(message));
            }

            const inputElement = this[`${key}Input`];
            if (!inputElement) return;

            inputElement.classList.add('invalid');
          });
        }
      }

      createErrorListItem(message) {
        const li = document.createElement('li');
        li.innerText = message;
>>>>>>> bdc1b2b (theme save push)
        return li;
      }

      clearErrorMessage() {
<<<<<<< HEAD
        this.errorMessageWrapper.hidden = true;

        if (this.errorMessageList) this.errorMessageList.innerHTML = '';

        this.querySelectorAll('.recipient-fields .form__message').forEach((field) => {
          field.classList.add('hidden');
          const textField = field.querySelector('.error-message');
          if (textField) textField.innerText = '';
        });

        [this.emailInput, this.messageInput, this.nameInput, this.sendonInput].forEach((inputElement) => {
          inputElement.setAttribute('aria-invalid', false);
          inputElement.removeAttribute('aria-describedby');
=======
        this.errorMessage.hidden = true;
        if (this.errorMessageList) this.errorMessageList.innerHTML = '';

        [this.emailInput, this.messageInput, this.nameInput, this.sendonInput].forEach((inputElement) => {
          inputElement.classList.remove('invalid');
>>>>>>> bdc1b2b (theme save push)
        });
      }

      resetRecipientForm() {
        if (this.checkboxInput.checked) {
          this.checkboxInput.checked = false;
          this.clearInputFields();
          this.clearErrorMessage();
<<<<<<< HEAD
=======
          this.fieldsContainer.classList.add('hidden');
>>>>>>> bdc1b2b (theme save push)
        }
      }
    }
  );
}
