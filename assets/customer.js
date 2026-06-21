const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
<<<<<<< HEAD
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
=======
  deleteAddressButton: 'button[data-confirm-message]'
>>>>>>> bdc1b2b (theme save push)
};

const attributes = {
  expanded: 'aria-expanded',
<<<<<<< HEAD
  confirmMessage: 'data-confirm-message',
=======
  confirmMessage: 'data-confirm-message'
>>>>>>> bdc1b2b (theme save push)
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
<<<<<<< HEAD
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
          cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
          deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
          countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
        }
      : {};
=======
    return container ? {
      container,
      addressContainer: container.querySelector(selectors.addressContainer),
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
    } : {};
>>>>>>> bdc1b2b (theme save push)
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
<<<<<<< HEAD
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
=======
        hideElement: 'AddressProvinceContainerNew'
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.getAttribute('data-form-id');
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
>>>>>>> bdc1b2b (theme save push)
        });
      });
    }
  }

  _setupEventListeners() {
<<<<<<< HEAD
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
=======
>>>>>>> bdc1b2b (theme save push)
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

<<<<<<< HEAD
  _toggleExpanded(target) {
    target.setAttribute(attributes.expanded, (target.getAttribute(attributes.expanded) === 'false').toString());
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
=======
  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      theme.utils.postLink(currentTarget.getAttribute('data-target'), {
        parameters: { _method: 'delete' },
      });
    }
  }
>>>>>>> bdc1b2b (theme save push)
}
