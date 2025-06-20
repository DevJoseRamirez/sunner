function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const soTrapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  soTrapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', soTrapFocusHandlers.keydown);
  };

  soTrapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', soTrapFocusHandlers.keydown);
  };

  soTrapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', soTrapFocusHandlers.focusout);
  document.addEventListener('focusin', soTrapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', soTrapFocusHandlers.focusin);
  document.removeEventListener('focusout', soTrapFocusHandlers.focusout);
  document.removeEventListener('keydown', soTrapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase()+ string.slice(1);
}

function capitalizeFirstLetterSubsequentLowercase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatMoney(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || document.getElementById('current_variant_id').getAttribute('data-shop-money-format');

  function formatWithDelimiters(number, precision, thousands, decimal) {
    thousands = thousands || ',';
    decimal = decimal || '.';

    if (isNaN(number) || number === null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    var centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

// Show Tooltip if engraving fields on PP are empty
function showTooltip(parent, message = false) {
  if (parent.querySelector('.required-input-tooltip')) {
    parent.querySelector('.required-input-tooltip').style.display = 'block';
    return
  }
  var tooltipElem = document.createElement("div"),
      inputField = parent.querySelector('input'),
      patternMessage = message ? message : inputField.getAttribute('data-pattern-message');

  tooltipElem.classList += 'required-input-tooltip';
  tooltipElem.style.position = 'absolute';
  tooltipElem.style.top = '-26px';
  tooltipElem.style.width = '100%';
  tooltipElem.style.backgroundColor = 'rgb(250, 146, 121)';
  tooltipElem.style.color = '#fff';
  tooltipElem.style.fontSize = '14px';
  tooltipElem.style.textAlign = 'center';
  tooltipElem.style.padding = '3px 0';
  tooltipElem.style.zIndex = '10';
  tooltipElem.style.display = 'block';
  tooltipElem.innerText = patternMessage;

  parent.position = 'relative';
  parent.classList += ' input-error';
  parent.insertBefore(tooltipElem, inputField);
}

class SoQuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('so-quantity-input', SoQuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class SoMenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('so-menu-drawer', SoMenuDrawer);

class SoHeaderDrawer extends SoMenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('so-header-drawer', SoHeaderDrawer);

class SoModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('so-deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    if (this.openedBy.getAttribute('id') == 'ProductPopup-button') {
      document.body.dispatchEvent(new CustomEvent('modalClosedFormSubmit'));
    }
    else
    {
      document.body.dispatchEvent(new CustomEvent('modalClosed'));
    }
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('so-modal-dialog', SoModalDialog);

class SoModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('so-modal-opener', SoModalOpener);

class SoUpsellPopupOpener extends HTMLElement {
  constructor() {
    super();

    this.form = document.getElementById(`product-form-${this.dataset.section}`);
    this.modalContent = document.querySelector(`#PopupModal-so-upsell`);
    if (this.form) {
      this.currentVariantID = this.form.querySelector('[name="id"]').value;
    }

    const button = this.querySelector('button');
    this.popupType = button.getAttribute('data-upsell-type');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (!this.validateFields()) {
        return
      }
      if(this.updateUpsellPopup()) {
        if (modal) modal.show(button);
      }
    });
  }

  // Submit form if upsell variant selected
  submitFormWithUpsellVariant(upsellVariant) {
    if(this.currentVariantID == upsellVariant.id) {
      this.form.dispatchEvent(new Event('submit'));
    }
    return this.currentVariantID != upsellVariant.id
  }

  // Check reuired engraving fields on PP
  validateFields() {
    const requiredInputs = document.querySelectorAll('.engraving-field');
    let isAnyRequiredInputEmpty = false;

    if(requiredInputs.length) {
      for (var i = 0; i < requiredInputs.length; i++) {
        let input = requiredInputs[i].querySelector('.field__input');
        if (!input.value && input.hasAttribute('required')) {
          isAnyRequiredInputEmpty = true;
          this.showTooltip(input.parentNode)
        }
      }
    }

    return !isAnyRequiredInputEmpty
  }

  // Show Tooltip if engraving fields on PP are empty
  showTooltip(parent) {
    if (parent.querySelector('.required-input-tooltip')) {
      parent.querySelector('.required-input-tooltip').style.display = 'block';
      return
    }
    var tooltipElem = document.createElement("div"),
        inputField = parent.querySelector('input'),
        patternMessage = inputField.getAttribute('data-pattern-message');

    tooltipElem.classList += 'required-input-tooltip';
    tooltipElem.style.position = 'absolute';
    tooltipElem.style.top = '-26px';
    tooltipElem.style.width = '100%';
    tooltipElem.style.backgroundColor = 'rgb(250, 146, 121)';
    tooltipElem.style.color = '#fff';
    tooltipElem.style.fontSize = '14px';
    tooltipElem.style.textAlign = 'center';
    tooltipElem.style.padding = '3px 0';
    tooltipElem.style.zIndex = '10';
    tooltipElem.style.display = 'block';
    tooltipElem.innerText = patternMessage;

    parent.position = 'relative';
    parent.classList += ' input-error';
    parent.insertBefore(tooltipElem, inputField);
  }

  getVariant(id) {
    const productVariants = JSON.parse(document.querySelector('.so-product-variants').textContent);
    let variant = productVariants.filter((productVariant) => productVariant.id == id)[0];
    return variant
  }

  getUpsellVariant() {
    this.currentVariantID = this.form.querySelector('[name="id"]').value;
    var regularVariant = this.getVariant(this.currentVariantID);
    document.getElementById('current_variant_id').value = this.currentVariantID;

    const productVariants = JSON.parse(document.querySelector('.so-product-variants').textContent);
    if (productVariants.length > 2) {
      let currentVariantOption1 = regularVariant.option1;

      const productVariantsMetafields = Array.from(document.querySelectorAll('.so-variant-metafields'));
      let upsellVariantID = productVariantsMetafields.filter((productVariantMetafield) => {
        return productVariantMetafield.getAttribute('data-so-variant-option1') == currentVariantOption1 && productVariantMetafield.hasAttribute('data-so-upsell-type');
      })[0].getAttribute('data-so-variant-id');

      var upsellVariant = productVariants.filter((productVariant) => productVariant.id == upsellVariantID);
    }
    else {
      let upsellVariantID = document.querySelector('[data-so-upsell-varinat_id]').getAttribute('data-so-upsell-varinat_id');
      var upsellVariant = productVariants.filter((productVariant) => productVariant.id == upsellVariantID);
    }

    if (upsellVariant) {
      return upsellVariant[0]
    }
  }

  updateUpsellPopup() {
    const upsellVariant = this.getUpsellVariant();
    this.setUpsellVariantImage(upsellVariant);
    this.setUpsellVariantPrice(upsellVariant);
    if (this.popupType != 'engraving') {
      this.setUpsellVariantID(upsellVariant);
      return this.submitFormWithUpsellVariant(upsellVariant)
    }
    else {
      return true
    }
  }

  // Upsell variant ID into form [name="id"]
  setUpsellVariantID(upsellVariant) {
    const input = this.form.querySelector('input[name="id"]');
    input.value = upsellVariant.id;
  }

  // Upsell variant featured image
  setUpsellVariantImage(upsellVariant) {
    const modalContentImage = this.modalContent.querySelector('.featured-image img');
    modalContentImage.srcset = upsellVariant.featured_image.src;
  }

  // Upsell variant price
  setUpsellVariantPrice(upsellVariant) {
    const compareUpsellPrice = this.modalContent.querySelector('.compare_upsell_price');
    const upsellPrice = this.modalContent.querySelector('.upsell_price');
    const savingPercents = this.modalContent.querySelector('.saving_percents');

    const selected_variant = this.getVariant(this.currentVariantID);

    let priceDifference = upsellVariant.price - selected_variant.price;
    compareUpsellPrice.textContent = formatMoney(priceDifference * 2);
    upsellPrice.textContent = formatMoney(priceDifference);
  }
}
customElements.define('so-upsell-popup-opener', SoUpsellPopupOpener);

class SoDeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('so-deferred-media', SoDeferredMedia);

class SoVariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    window.addEventListener('load', this.setOriginalVariant.bind(this, false));
  }

  onVariantChange(e) {
    if(e.target.classList.contains('so-font-preview-input') || e.target.classList.contains('so-birthstone-input') || e.target.classList.contains('so-accessory-input')) {
      return
    }
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.removeErrorMessage();
    if(this.hasAttribute('data-live-preview')) {
      if(this.changeLivePreview(e) == true) {
        return
      }
    }

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
    } else {
      this.setSelectedVariant();
      this.getEngravingVariant();
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      if(e.target.type == 'radio') {
        document.body.dispatchEvent(new CustomEvent('variant_changed'));
      }
      if(this.hasAttribute('data-svg-metal-swatch')) {
        this.changeFlowerMetal();
      }
    }
    if(this.tagName != 'ENGRAVING-INPUT') {
      this.fontPreviewMetalColor();
      this.fontPreviewSetVariantID();
    }
    if(this.hasAttribute('data-font-preview-multiple')) {
      this.fontPreviewMultiple();
    }
  }

  setSelectedVariant() {
    const productVariants = Array.from(document.querySelectorAll('.so-variant-metafields'));
    if(productVariants.length) {
      productVariants.map(function(variant) {
        if(variant.hasAttribute('data-selected-variant')) {
          variant.removeAttribute('data-selected-variant')
        }
        if(variant.getAttribute('data-so-variant-id') == this.currentVariant.id) {
          variant.setAttribute('data-selected-variant', this.currentVariant.id);
        }
      }, this)
    }
   }

  setPreviewMedia(e) {
    if(!document.querySelector('.font-preview-inc-w-live-preview')) {
      return
    }
    if(document.querySelector('.font-preview-without-image')) {
      return
    }
    var productVariants = JSON.parse(document.querySelector('.so-product-variants').textContent);
    var engravingInput = this.querySelector('.so-engraving-input'),
        currentVariantID = engravingInput.getAttribute('data-selected-variant-id'),
        currentVariant = productVariants.filter((productVariant) => productVariant.id == currentVariantID)[0],
        containerPreviewSlider = document.querySelector('.font-preview-inc-w-live-preview'),
        preivewImgs = containerPreviewSlider.querySelectorAll('.live-preview-image');
    preivewImgs.forEach((img) => {
      img.classList.add('so-hidden');
    });
    if(engravingInput.value.length > 0) {
      containerPreviewSlider.classList.remove('so-hidden');
      var preivewImg = containerPreviewSlider.querySelector('.live-preview-image[data-variant-id="' + currentVariantID + '"]');
      preivewImg.classList.remove('so-hidden');
    }
  }

  changeChainsMetal(metal) {
    var chainImgs = document.querySelector('.font-preview-inc-w-live-preview').querySelectorAll('.font-preview-chain img');
    chainImgs.forEach(function(item) {
      item.classList.remove('so-hidden');
      if(item.getAttribute('data-metal') != metal) {
        item.classList.add('so-hidden');
      }
    });
  }

  changeFlowerMetal() {
    var flowerCode = Array.from(this.querySelectorAll('[data-option="option3"]')).filter((item) => item.checked == true)[0].getAttribute('data-flower-code'),
        previewFlower = document.querySelector('.preview-flower'),
        previewField = document.querySelector('.preview-with-flower'),
        previewInput = document.querySelector('.so-font-preview-input');
    if(flowerCode && previewFlower) {
      previewFlower.textContent = flowerCode;
      var previewText = flowerCode + previewField.getAttribute('data-placeholder');
      if(previewInput.value.length > 0) {
        previewText = flowerCode + previewInput.value;
      }
      previewField.textContent = previewText;
    }
    var metal = this.currentVariant.metafields.metal;
    if(metal) {
      var swatches = this.querySelectorAll('.so-swatch-item');
      swatches.forEach(function(swatch) {
        var flowers = swatch.querySelectorAll('.so-svg-wrap');
        flowers.forEach(function(flower) {
          if(flower.getAttribute('data-metal') != metal) {
            flower.classList.add('so-hidden');
          }
          else {
            flower.classList.remove('so-hidden');
          }
        });
      });
    }
  }

  changePreviewMetal(variant) {
    var currentVariantMetal = variant.metafields.metal;
    if(document.querySelector('.font-preview-w') && currentVariantMetal) {
      document.querySelector('.font-preview-w').setAttribute('data-metal', currentVariantMetal);
      if(this.hasAttribute('data-live-preview')) {
        this.changeChainsMetal(currentVariantMetal);
      }
    }
  }

  changeLivePreview (e) {
    var self = this;
    var engravingInput = this.querySelector('.so-font-preview-input');
    if(engravingInput.value.length > 0 && engravingInput) {
      engravingInput.setAttribute('data-selected-variant-id', this.currentVariant.id);
      self.changePreviewMetal(this.currentVariant);
      self.setPreviewMedia(e);
      document.querySelector('.font-preview-inc-w-live-preview').classList.remove('so-hidden');
      if(document.querySelectorAll('.font-preview-inc-w-live-preview').length) {
        if(!document.querySelector('.font-preview-inc-w-live-preview').classList.contains('font-preview-without-image')) {
          if(this.currentVariant.metafields.ipcs.includes('-WOOD')) {
            document.querySelector('.font-preview-inc-w-live-preview').classList.add('live-preview-on-wood');
          }
          else {
            document.querySelector('.font-preview-inc-w-live-preview').classList.remove('live-preview-on-wood');
          }
        }
      }
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      return true
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      this.currentVariantID = this.currentVariant.id;
      if(!this.classList.contains('so-font-preview-input')) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('so-product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const sourceSectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
    const destinationSectionId = this.dataset.section;

    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${sourceSectionId}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${destinationSectionId}`);
        const source = html.getElementById(`price-${sourceSectionId}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

        const bannerDestination = document.getElementById(`product-banner-${destinationSectionId}`);
        const bannerSource = html.getElementById(`product-banner-${sourceSectionId}`);
        if (bannerDestination && bannerSource) bannerDestination.innerHTML = bannerSource.innerHTML;
      });
    if(document.querySelectorAll('.font-preview-inc-w-live-preview').length) {
      if(!document.querySelector('.font-preview-inc-w-live-preview').classList.contains('font-preview-without-image')) {
        if(this.currentVariant.metafields.ipcs.includes('-WOOD')) {
          document.querySelector('.font-preview-inc-w-live-preview').classList.add('live-preview-on-wood');
        }
        else {
          document.querySelector('.font-preview-inc-w-live-preview').classList.remove('live-preview-on-wood');
        }
      }
    }
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(document.querySelector('.so-product-variants').textContent);
    return this.getVariantMetafields(this.variantData);
  }

  // Extend Variants w/ Shineon metafields obj
  getVariantMetafields(variantData) {
    this.variants = [];
    var productVariantsMetafields = document.querySelectorAll('.so-variant-metafields');
    for (var i = 0; i < variantData.length; i++) {
      var variantMetafieldsData = JSON.parse(productVariantsMetafields[i].textContent);
      var variant = variantData[i];
      variant.metafields = variantMetafieldsData;
      this.variants.push(variant);
    }
    return this.variants;
  }

  setOriginalVariant(variantData) {
    if (this.querySelector('.so-selected-variant')) {
      var selectedVariant = JSON.parse(this.querySelector('.so-selected-variant').textContent);
      this.currentVariant = selectedVariant;

      var selector = '';
      for (var i = 0; i < selectedVariant.options.length; i++) {
        var option = selectedVariant.options[i],
            index = i + 1;
        selector += '[option' + index + '="' + option + '"]';
        for (let j = 0; j < document.querySelectorAll('[data-option="option' + index +'"]').length; j++) {
          const input = document.querySelectorAll('[data-option="option' + index +'"]')[j];
          if(input.value == option) {
            input.checked = true;
          }
        }
      }

      if (document.querySelector('[engravings="0"]')) {
        document.querySelector('[engravings="0"]').checked = true;
      }
      else if (document.querySelector(selector)) {
        document.querySelector(selector).checked = true;
      }

      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  getEngravingVariant() {
    var variants = this.getVariantData();
    for (var i = 0; i < variants.length; i++) {
      var variant = variants[i]
    }
    let currentPopupImage = document.querySelector('.featured-image img');
    if (currentPopupImage) {
      let currentPopupImageSrc = currentPopupImage.src.split(),
        currentPopupImageHeight = currentPopupImage.height;
      if (variant.option1 == this.currentVariant.option1 && variant.metafields.engravings > 0)
      {
        currentPopupImage.srcset = variant.featured_image.src;
        currentPopupImage.height = currentPopupImageHeight;
        return variant
      }
    }
  }
}

customElements.define('so-variant-selects', SoVariantSelects);

class VariantRestoreDefault extends SoVariantSelects {
  constructor() {
    super();

    this.form = document.querySelector('[data-type="add-to-cart-form"]');
    if (this.form) {
      this.form.querySelector('[name="id"]').disabled = false;
      this.currentVariantID = this.currentVariant ? this.currentVariant.id : this.form.querySelector('[name="id"]').value;
    }

    this.querySelector('.product-popup-modal__close').addEventListener(
      'click',
      this.submitForm.bind(this, false)
    );
    document.body.addEventListener(
      'modalClosedFormSubmit',
      this.submitForm.bind(this, false)
    );
    if (document.getElementById('ProductPopup-button')) {
      document.getElementById('ProductPopup-button').addEventListener(
        'click',
        this.getCurrectVariantID.bind(this, false)
      );
    }
  }

  getCurrectVariantID() {
    this.currentVariantID = document.getElementById('current_variant_id').value;
  }

  submitForm() {
    var option2 = this.getAttribute('data-option2');
    if (option2 == 'engraving') {
      var engraving_inputs = this.form.querySelectorAll('.so-engraving-input');
      for (var i = 0; i < engraving_inputs.length; i++) {
        engraving_inputs[i].value = '';
      }
    }
    this.form.querySelector('[name="id"]').value = this.currentVariantID;
    this.getVariantObj();
    this.form.dispatchEvent(new Event('submit'));
  }

  getVariantObj() {
    var variants = this.getVariantData();
    for (var i = 0; i < variants.length; i++) {
      if (variants[i].id == this.currentVariantID) {
        this.currentVariant = variants[i];
      }
    }
    this.updateMedia();
    this.updateURL();
    this.updateVariantInput();
    this.renderProductInfo();
    this.updateShareUrl();
  }
}

customElements.define('so-submit-default-form', VariantRestoreDefault);

class SoVariantRadios extends SoVariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  checkProductOptionSize() {
    const productVariants = JSON.parse(this.querySelector('.so-product-variants').textContent);
    return productVariants.length
  }

  fontPreviewMetalColor() {
    var fontPreviewWrapArr = Array.from(document.querySelectorAll('.font-preview-w'));
    if (fontPreviewWrapArr.length) {
      if(this.currentVariant.metafields.metal) {
        fontPreviewWrapArr.map((item) => item.setAttribute('data-metal', this.currentVariant.metafields.metal));
        this.changePreviewMetal(this.currentVariant);
      }
    }
  }

  fontPreviewSetVariantID() {
    var fontPreviewInput = Array.from(document.querySelectorAll('.so-font-preview-input'));
    fontPreviewInput.map((item) => item.setAttribute('data-selected-variant-id', this.currentVariant.id));
  }

  fontPreviewMultiple() {
    var self = this;

    self.showMultipleInputs();
    self.hideNotification();
  }

  hideNotification() {
    var self = this;
    const fontPreviewInputsW = Array.from(document.querySelectorAll('.engraving-field'));
    fontPreviewInputsW.forEach(function(field, index){
      let pasteValidator = field.querySelector('.so-input-paste-validator'),
          inputNotification = field.querySelector('.so-input-notification');

      inputNotification.style.display = 'none';
      pasteValidator.classList.add('so-hidden');

      var fontPreviewInputTooltip = field.querySelector('.required-input-tooltip');
      let tooltipWrap = field.querySelector('.so-input-wrap')
      tooltipWrap.classList.remove('input-error');
      if(fontPreviewInputTooltip) {
        tooltipWrap.removeChild(fontPreviewInputTooltip);
      }
    });
  }

  showMultipleInputs() {
    var self = this;
    const fontPreviewInputsW = Array.from(document.querySelectorAll('.engraving-field'));
    var engraving_to_show = self.currentVariant.metafields.engravings - 1;
    fontPreviewInputsW.forEach(function(field, index){
      var fontPreviewInput = field.querySelector('.so-engraving-input');
      if(index <= engraving_to_show) {
        field.classList.remove('so-hidden');
        if(fontPreviewInput.hasAttribute('data-required')) {
          fontPreviewInput.setAttribute('required', true);
          fontPreviewInput.removeAttribute('data-required');
        }
      }
      else {
        field.classList.add('so-hidden');
        fontPreviewInput.value = '';
        var eventChange = new Event('change', {"bubbles":true, "cancelable":false});
        var eventInput = new Event('input', {"bubbles":true, "cancelable":false});
        var eventKeyUp = new Event('keyup', {"bubbles":true, "cancelable":false});
        fontPreviewInput.dispatchEvent(eventChange);
        fontPreviewInput.dispatchEvent(eventInput);
        fontPreviewInput.dispatchEvent(eventKeyUp);
        if(fontPreviewInput.hasAttribute('required')) {
          fontPreviewInput.removeAttribute('required');
          fontPreviewInput.setAttribute('data-required', 1);
        }
      }
    })
  }
}

customElements.define('so-variant-radios', SoVariantRadios);

class EngravingInput extends SoVariantSelects {
  constructor() {
    super();
    this.productVariants = JSON.parse(document.querySelector('.so-product-variants').textContent);
    this.productSwathces = document.querySelectorAll('fieldset.product-form__input [type="radio"]');
    this.engravingInput = document.querySelectorAll('.so-engraving-input');
    this.form = document.getElementById(`product-form-${this.dataset.section}`);
    for (let i = 0; i < this.engravingInput.length; i++) {
      const input = this.engravingInput[i];
      //input.addEventListener('beforeinput', this.checkEngravingBeforeInputEvent.bind(this));
    }
    this.addEventListener('keyup', this.checkEngravingVariant);
    this.addEventListener('change', this.checkEngravingVariant);
    this.addEventListener('focusout', this.checkEngravingVariant);
    if(this.classList.contains('so-font-preview-input-w')) {
      this.addEventListener('focusin', this.focusOn);
      this.addEventListener('focusout', this.focusOn);
      this.addEventListener('beforeinput', this.inputBeforeInputEvent);
      this.addEventListener('input', this.validateFontPreview);
      this.addEventListener('input', this.fontPreview);
      this.addEventListener('change', this.inputChangeEvent);
      this.form.addEventListener('submit', this.formSubmit.bind(this));
    }

    this.engravingValidateByPattern = Array.from(this.querySelectorAll('.so-engraving-validate-pattern'));
    this.engravingValidateByPattern.map(function(input) {
      if(input.hasAttribute('data-pattern')) {
        input.addEventListener('input', this.inputEventByPattern.bind(this));
        input.addEventListener('change', this.inputChangeEventByPattern.bind(this));
      }
    }, this)
  }

  inputEventByPattern(e) {
    let input = e.target;
    this.validateInputByPattern(e, input);
    this.validateMaxLength(input);
  }

  inputChangeEventByPattern(e) {
    var input = e.target;
    if (input.hasAttribute('maxlength')) {
      this.fitTextToMaxlength(input, 'by_pattern');
    }
  }

  validateInputByPattern(e, input) {
    var pattern = input.getAttribute('data-pattern'),
        engravingInputPattern = new RegExp(pattern);

    var validatedStr = '';
    for (var i = 0; i<input.value.length; i++) {
      let letter = input.value.charAt(i);
      if(engravingInputPattern.test(letter)) {
        this.removeShowTooltip(input);
        validatedStr += letter;
      }
      else {
        showTooltip(input.parentNode)
      }
    }
    input.value = validatedStr;
  }

  formSubmit(e) {
    var self = this,
        engravingInput = self.querySelector('.so-engraving-input');
    e.preventDefault();
    if(engravingInput.value.length > 0) {
      this.validateMinLength(e);
    }
  }

  validateMinLength(e) {
    var self = this,
        engravingInput = self.querySelector('.so-engraving-input'),
        minlength = engravingInput.getAttribute('minlength');

    // SUS-2127 NN + Heart at the end / SUS-2270
    if(engravingInput.hasAttribute('data-symbol-at-the-end')) {
      return
    }

    if(engravingInput.value.length < minlength) {
      e.stopImmediatePropagation();
      let showTooltipMessage = engravingInput.getAttribute('data-minlength-tooltip-message') + minlength;
      showTooltip(engravingInput.parentNode, showTooltipMessage);
    }
  }

  inputChangeEvent(e) {
    var self = this,
        engravingInput = self.querySelector('.so-engraving-input'),
        counter = self.querySelector('.so-input-counter');
    self.changePreviewText(self.fitTextToMaxlength(engravingInput, counter));

    // SUS-2127 NN + Heart at the end / SUS-2270
    var parentFieldPreview = document;
    if(this.classList.contains('so-font-preview-multiple-w')) {
      parentFieldPreview = this;
    }
    var fontPreviewMain = parentFieldPreview.querySelector('.font-preview-inc-w'),
        fontPrevieWrap = fontPreviewMain.querySelector('.font-preview-w'),
        fontPreviewField = fontPrevieWrap.querySelector('.preview');
    if(engravingInput.hasAttribute('data-symbol-at-the-end') && engravingInput.value.length != 0) {
      var symbol = engravingInput.getAttribute('data-symbol-at-the-end');
      fontPreviewField.textContent = engravingInput.value + symbol;
    }

    // SUS-2263 Flower NN
    if(engravingInput.getAttribute('data-flower-on-start') == 1 && engravingInput.value.length > 0) {
      var symbolAtStart = document.querySelector('.preview-flower');
      fontPreviewField.textContent = symbolAtStart.textContent + engravingInput.value;
    }
  }

  fitTextToMaxlength(input, counter) {
    var maxlength = input.getAttribute('maxlength');
    input.closest('.so-input-wrap').classList.remove('input-error-maxlength');
    if(counter == 'by_pattern') {
      input.closest('.so-engraving-input-w').querySelector('label').classList.remove('input-error');
    }
    if(input.value.length > maxlength && typeof counter == 'object') {
      counter.textContent = maxlength;
    }
    return input.value = input.value.substr(0, maxlength);
  }

  changePreviewText(text) {
    var fontPreview = document.querySelectorAll('.preview-w span');
    fontPreview.forEach(function(preview) {
      preview.textContent = text;
    })
  }

  validateMaxLength(input) {
    var inputMaxlength = input.getAttribute('maxlength'),
        inputLabel = input.closest('.so-engraving-input-w').querySelector('label');
    if(input.value.length > inputMaxlength) {
      if(input.classList.contains('so-engraving-validate-pattern')) {
        inputLabel.classList.add('input-error');
      }
      input.closest('.so-input-wrap').classList.add('input-error-maxlength');
    }
    else {
      input.closest('.so-input-wrap').classList.remove('input-error-maxlength');
      if(input.classList.contains('so-engraving-validate-pattern')) {
        inputLabel.classList.remove('input-error');
      }
    }
  }

  inputBeforeInputEvent(e) {
    var self = this;

    self.checkInputOnEmojiAndPaste(e);
  }

  checkInputOnEmojiAndPaste(e) {
    var checkForEmoji = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
    var notification = this.querySelector('.so-input-paste-validator');
    if(checkForEmoji.test(e.data)) {
      e.preventDefault();
      notification.classList.remove('so-hidden');
    }
    else {
      notification.classList.add('so-hidden');
    }
  }

  focusOn(e) {
    var self = this;
    var engravingInput = this.querySelector('.so-engraving-input');

    if(engravingInput.value.length > 0 && e.type == 'focusin' && document.querySelector('.font-preview-inc-w-live-preview')) {
      self.showLiveFontPreview(e);
    }
  }

  getVariantTitleByOptionValues (variant) {
    var resulted_option_name = '',
        index = 0;
    for (var j = 0; j < this.productSwathces.length; j++) {
      if(this.productSwathces[j].checked) {
        resulted_option_name += this.productSwathces[j].value;
        index++;
        if (index < variant.options.length) {
          resulted_option_name += ' / ';
        }
      }
    }

    return resulted_option_name;
  }

  getVariantByOptionValues () {
    var variants = this.getVariantData();
    for (var i = 0, len = variants.length, variant = undefined; i < len; i++) {
      var resulted_option_name = this.getVariantTitleByOptionValues(variants[i]);
      if (variants[i].title == resulted_option_name) {
        variant = variants[i];
      }
    }

    return variant;
  }

  changeLeftChainPosition(e) {
    var self = this,
        engravingInput = self.querySelector('.so-engraving-input'),
        key = engravingInput.value[0].toLowerCase(),
        lettersArr = 'f,t,a,h,b'.split(','),
        livePreviewWrap = document.querySelector('.font-preview-inc-w'),
        livePreviewWrapPreClass = 'font-preview-inc-w-live-preview-';

    lettersArr.forEach(function(letter) {
      var livePreviewWrapClass = livePreviewWrapPreClass + letter;
      if(key == letter) {
        livePreviewWrap.classList.add(livePreviewWrapClass);
      }
      else {
        livePreviewWrap.classList.remove(livePreviewWrapClass);
      }
    });
  }

  changeRightChainPosition(e) {
    var self = this,
        smallLettersArr = 'a,q,w,e,r,y,u,i,o,p,a,s,g,j,z,x,c,v,n,m'.split(','),
        engravingInput = self.querySelector('.so-engraving-input'),
        key = engravingInput.value[engravingInput.value.length - 1].toLowerCase(),
        rightChain = document.querySelector('.chain-right'),
        replaceRightChain = false;

    smallLettersArr.forEach(function(letter) {
      if(key == letter && key) {
        replaceRightChain = true;
        return false;
      }
    });
    if(replaceRightChain == true) {
      rightChain.classList.add('font-preview-small-letter');
    }
    else {
      rightChain.classList.remove('font-preview-small-letter');
    }
    if(key == '.') {
      rightChain.classList.add('font-preview-dot');
    }
    else {
      rightChain.classList.remove('font-preview-dot');
    }
  }

  fontPreview(e = 1) {
    var self = this;
    var parentFieldPreview = document;
    if(this.classList.contains('so-font-preview-multiple-w')) {
      parentFieldPreview = this;
    }
    var fontPreviewMain = parentFieldPreview.querySelector('.font-preview-inc-w'),
        fontPrevieWrap = fontPreviewMain.querySelector('.font-preview-w'),
        fontPreviewField = fontPrevieWrap.querySelector('.preview'),
        fontPreviewFieldMask = fontPrevieWrap.querySelector('.preview-mask'),
        fontPreviewFieldUpsideDown = fontPrevieWrap.querySelector('.preview-upside-down'),
        engravingInput = this.querySelector('.so-engraving-input'),
        engravingInputPattern = new RegExp(engravingInput.getAttribute('data-pattern')),
        counterWrap = this.querySelector('.so-input-counter');

    var validatedStr = '';
    for (var i = 0; i<engravingInput.value.length; i++) {
      let letter = engravingInput.value.charAt(i);
      if(engravingInputPattern.test(letter)) {
        validatedStr += letter;
      }
      else {
        this.querySelector('.so-input-paste-validator').classList.remove('so-hidden');
      }
    }
    engravingInput.value = validatedStr;
    if(!engravingInput.classList.contains('so-font-preview-extended')) {
      engravingInput.value = capitalizeFirstLetterSubsequentLowercase(engravingInput.value);
    }
    else {
      engravingInput.value = capitalizeFirstLetter(engravingInput.value);
    }
    fontPreviewField.textContent = engravingInput.value;
    if(this.classList.contains('so-font-preview-live-w')) {
      fontPreviewFieldMask.textContent = engravingInput.value;
    }
    if(fontPreviewMain.classList.contains('font-preview-without-image')) {
      fontPreviewFieldUpsideDown.textContent = engravingInput.value;
    }
    counterWrap.textContent = engravingInput.value.length;
    fontPreviewField.classList.remove('so-hidden');
    fontPreviewMain.classList.remove('so-hidden');
    if(engravingInput.value.length == 0) {
      if(engravingInput.classList.contains('live-preview-input')) {
        fontPreviewField.classList.add('so-hidden');
        fontPreviewMain.classList.add('so-hidden');
      }
      var engravingInput = this.querySelector('.so-engraving-input'),
          currentVariantID = engravingInput.getAttribute('data-selected-variant-id'),
          currentVariant = this.productVariants.filter((productVariant) => productVariant.id == currentVariantID)[0],
          engravingInputPattern = new RegExp(engravingInput.getAttribute('data-pattern'));

      var eventKey = e.key;
      if(!e.key) {
        eventKey = e.data;
      }

      if(engravingInputPattern.test(eventKey) || e.key == 'Dead') {
        self.setPreviewMedia(e);
      }

      if(!engravingInput.classList.contains('live-preview-input')) {
        var dataPlaceholderText = fontPreviewField.getAttribute('data-placeholder');
        fontPreviewField.textContent = dataPlaceholderText;
        if(engravingInput.getAttribute('data-flower-on-start') == 1) {
          var previewFlower = document.querySelector('.preview-flower').textContent;
          fontPreviewField.textContent = previewFlower + dataPlaceholderText;
        }
      }
    }

    fontPreviewField.setAttribute('data-metal', this.getVariantByOptionValues().metafields.metal);
    if(this.classList.contains('so-font-preview-live-w') && !fontPreviewMain.classList.contains('font-preview-live-vertical')) {
      fontPreviewFieldMask.setAttribute('data-metal', this.getVariantByOptionValues().metafields.metal);
      if(engravingInput.value.length == 1) {
        fontPrevieWrap.querySelector('.chain-right').style.opacity = 0;
      }
      else {
        fontPrevieWrap.querySelector('.chain-right').style.opacity = 1;
      }
    }

    if(engravingInput.value.length == 1) {
      self.changeLeftChainPosition(e);
    }

    //Hack for android/samsung which doesn't work with maxlength attr
    self.validateMaxLength(engravingInput);

    // SUS-2127 NN + Heart at the end / SUS-2270
    if(engravingInput.hasAttribute('data-symbol-at-the-end') && engravingInput.value.length > 0) {
      var symbol = engravingInput.getAttribute('data-symbol-at-the-end');
      fontPreviewField.textContent = engravingInput.value + symbol;
    }

    // SUS-2263 Flower NN
    if(engravingInput.getAttribute('data-flower-on-start') == 1 && engravingInput.value.length > 0) {
      var symbolAtStart = document.querySelector('.preview-flower');
      fontPreviewField.textContent = symbolAtStart.textContent + engravingInput.value;
    }
  }

  startLiveFontPreview(e) {
    var self = this;
    var engravingInput = this.querySelector('.so-engraving-input'),
        engravingInputPattern = new RegExp(engravingInput.getAttribute('data-pattern'));

    var eventKey = e.key;
    if(!e.key) {
      eventKey = e.data;
    }

    if(engravingInputPattern.test(eventKey) || e.key == 'Dead') {
      self.setPreviewMedia(e);
      if(window.innerWidth<768) {
        var previewSection = document.querySelectorAll('.product__media-wrapper')[0];
        previewSection.scrollIntoView();
      }
    }
  }

  showLiveFontPreview(e) {
    var self = this;
    var engravingInput = this.querySelector('.so-engraving-input');
    if(engravingInput.value.length > 0) {
      self.setPreviewMedia(e);
      document.querySelector('.font-preview-inc-w-live-preview').classList.remove('so-hidden');
    }
  }

  validateFontPreview(e) {
    if(!e.target.hasAttribute('data-pattern')) {
      return
    }
    var fontPreviewMain = document.querySelector('.font-preview-inc-w'),
        fontPreviewNotification = this.querySelector('.so-input-notification'),
        engravingInput = this.querySelector('.so-engraving-input'),
        engravingInputPattern = new RegExp(engravingInput.getAttribute('data-pattern'));

    var eventKey = e.key;
    var eventKeyCode = e.key;
    if(e.data) {
      eventKey = e.data;
      if(e.data == ' ') {
        eventKeyCode = '" "';
      }
      else {
        eventKeyCode = e.data;
      }
    }

    if(!engravingInputPattern.test(eventKey) || e.key == 'Dead') {
      e.preventDefault();
      fontPreviewNotification.style.display = 'flex';
      var e_key = e.keyCode == 32 ? '" "' : eventKeyCode
      fontPreviewNotification.textContent = e_key + ' isn\'t available';
      if(window.innerWidth<768) {
        this.scrollIntoView()
      }
    }
    else {
      fontPreviewNotification.style.display = 'none';
      document.querySelector('.so-input-paste-validator').classList.add('so-hidden');
      var checkEvent = false;
      var symbolsQuantity = 0;
      if(e.data) {
        symbolsQuantity = 1;
      }
      if(engravingInput.value.length == symbolsQuantity) {
        if(e.data) {
          checkEvent = true
        }
        if(e.code && !checkEvent) {
          if (e.code.includes('Key')) {
            checkEvent = true
          }
        }
        if (checkEvent) {
          if(document.querySelector('.font-preview-inc-w-live-preview')) {
            this.startLiveFontPreview(e);
            document.querySelector('.font-preview-inc-w-live-preview').classList.remove('so-hidden');
          }
        }
      }
      if(engravingInput.value.length > 1 && engravingInput.classList.contains('live-preview-input') && !fontPreviewMain.classList.contains('font-preview-live-vertical')) {
        this.changeRightChainPosition(e);
      }
    }
  }

  showTooltipIfMaxlength(input) {
    input.classList.add('maxlength-exceeded');
    showTooltip(input.parentNode, 'say hello');
  }

  removeTooltipIfMaxlength(input) {
    input.classList.remove('maxlength-exceeded');
    this.removeShowTooltip(input);
  }

  checkEngravingBeforeInputEvent(e) {
    var input = e.target;
    if(input.hasAttribute('maxlength')) {
      var engravingInputMaxLength = input.getAttribute('maxlength') * 1;
      if(input.value.length == engravingInputMaxLength) {
        this.showTooltipIfMaxlength(input);
      }
      else {
        this.removeTooltipIfMaxlength(input);
      }
    }
  }

  checkEngravingVariant() {
    var option2 = this.getAttribute('data-option2');
    if(!this.hasAttribute('data-upsell-type')) {
      this.passEngravingValueIntoPopupInput(this.querySelector('input'));
    }
    if(!this.querySelector('input').classList.contains('so-engraving-validate-pattern') && !this.querySelector('input').classList.contains('maxlength-exceeded')) {
      if(document.querySelector('.required-input-tooltip')) {
        this.removeShowTooltip(this.querySelector('input'));
      }
      this.querySelector('.so-input-wrap').classList.remove('input-error');
    }
    if (option2 == 'engraving') {
      var engraving_input_length = 0;
      for (var i = 0; i < this.engravingInput.length; i++) {
        var engraving_input = this.engravingInput[i];
        engraving_input_length += engraving_input.value.length;
      }

      if (engraving_input_length) {
        document.querySelector('[engravings="1"]').checked = true;
      }
      else {
        document.querySelector('[engravings="0"]').checked = true;
      }

      this.currentVariant = this.getVariantByOptionValues();
      this.currentVariantID = this.currentVariant.id;
      this.getEngravingVariant();
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.updateShareUrl();
      this.renderProductInfo();
    }
  }

  removeShowTooltip(input) {
    let engravingInputWrap = input.parentNode;
    if (engravingInputWrap.classList.contains('input-error'))
    {
      engravingInputWrap.classList.remove('input-error');
      var tooltip = engravingInputWrap.querySelector('.required-input-tooltip');
      engravingInputWrap.removeChild(tooltip);
    }
  }

  // required engraving value duplicated into popup input to pass it to Cart
  passEngravingValueIntoPopupInput(input) {
    let form = document.getElementById(`product-form-${this.dataset.section}`);
    let inputNameAttr = input.getAttribute('name'),
        popupInput = form.querySelector('[data-name="' + inputNameAttr + '"]');

    popupInput.setAttribute('name', input.getAttribute('data-name'));
    popupInput.value = input.value;
  }
}

customElements.define('engraving-input', EngravingInput);


class HyperComponent extends HTMLElement {
  constructor() {
    super();

    this.requestURL = "https://execute.shineon.com/rendering-engine/render";
    this.productMetafieldsShineon = JSON.parse(document.querySelector('.so-product-metafields').textContent);
    this.zonedFieldsCanvas = this.productMetafieldsShineon.schema_v2.zoned_fields.canvas;
    this.zonedFieldsZones = Array.from(this.productMetafieldsShineon.schema_v2.zoned_fields.zones);
    this.payloadObj = {};
    this.transformationIDAll = JSON.parse(document.querySelector('.so-product-images-transformation-ids').textContent);
    this.transformationWMediaObj = {};

    this.mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    this.mediaGallery.addEventListener('setActiveMedia', this.onSlideChanged.bind(this));
    this.mediaGalleryMedia = JSON.parse(document.querySelector('.so-product-media-ids').textContent);
    this.mediaGalleryMediaActive = this.mediaGallery.getAttribute('data-mediaid-active');

    this.buildTransformationWMediaObj();
    this.buildPayloadObj(this.transformationIDAll);
    this.setPayloadWActiveMedia(this.mediaGalleryMediaActive);
  }

  onSlideChanged() {
    var self = this;
    var activeSlide = self.mediaGallery.querySelector('.product__media-item.is-active'),
        activeSlideID = activeSlide.getAttribute('data-media-id').split(self.dataset.section + '-')[1];
        self.mediaGalleryMediaActive = self.getMediaGalleryMediaActive(activeSlideID)[0].id;
    var hyperImageW = document.querySelector('.hyper-preview-slider-w');
    hyperImageW.classList.add('so-hidden');
    self.setPayloadWActiveMedia(self.mediaGalleryMediaActive);
  }

  buildTransformationWMediaObj() {
    var self = this;
    self.transformationIDAll.map((id, index) => self.transformationWMediaObj[id] = self.mediaGalleryMedia[index]);
  }

  setPayloadWActiveMedia(activeID) {
    var self = this;
    Object.keys(self.transformationWMediaObj).forEach(function(key) {
      var transformationID = key;
      if(self.transformationWMediaObj[key].id == activeID) {
        self.transformationActiveID = transformationID;
        self.payloadObj.transformations = [transformationID];
      }
    });
  }

  getMediaGalleryMediaActive(activeID) {
    return this.mediaGalleryMedia.filter(media => media.id == activeID);
  }

  sendPayload(callback) {
    var xhr = new XMLHttpRequest();
    var url = this.requestURL;
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function(self) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        if (typeof callback === "function") {
          callback(xhr);
        }
      }
    }
    var data = JSON.stringify(this.payloadObj);
    xhr.send(data);
  }

  buildPayloadObj(transformationArr) {
    this.payloadObj.design = this.productMetafieldsShineon.artwork_url;
    this.payloadObj.transformations = transformationArr;
    this.payloadObj.zones = this.zonedFieldsCanvas;
    this.payloadObj.config = {};
    this.payloadObj.config.output = {}
    this.payloadObj.config.output.height = 1000;
    this.payloadObj.config.output.width = 1000;

    this.payloadObj.zones = [];
    this.zonedFieldsZones.map((zone) => {
      let zoneObj = {};
      zoneObj.id = zone.id;
      zoneObj.content = "";
      zoneObj.styles = zone.props.styles;
      zoneObj.transform = zone.transform;
      this.payloadObj.zones.push(zoneObj);
    });
  }

  showHyperLoader() {
    this.mediaGallery.classList.add('so-sending-payload');
  }

  showLabelNotification() {
    var input = this.input,
        parentSoHyperInput = input.closest('.so-hyper-input-w'),
        label = parentSoHyperInput.querySelector('label'),
        labelTextContent = label.querySelector('.label-textcontent'),
        labelNotification = label.querySelector('.so-updating-notification');
    labelTextContent.classList.add('so-hidden');
    labelNotification.classList.remove('so-hidden');
  }

  removeLabelNotification() {
    var label = this.querySelector('label'),
        labelTextContent = label.querySelector('.label-textcontent'),
        labelNotification = label.querySelector('.so-updating-notification');
    labelTextContent.classList.remove('so-hidden');
    labelNotification.classList.add('so-hidden');
  }

  showHyperedCarousel(xhr) {
    var responseText = JSON.parse(xhr.responseText);
    var mediaGallery = this.mediaGallery;
    var self = this;
    Object.keys(responseText.result).forEach(function(key) {
      var transformationID = key,
          mediaID = self.transformationWMediaObj[transformationID].id,
          section_id = self.dataset.section,
          selector = section_id + '-' + mediaID;
      self.changeSliderImage(responseText, selector, transformationID);
    });
    setTimeout(function() {
      mediaGallery.classList.remove('so-sending-payload');
      self.removeLabelNotification();
    }, 500);
  }

  sendTransformationActive() {
    var self = this;
    self.setPayloadWActiveMedia(self.mediaGalleryMediaActive);
    self.sendPayload(self.showHyperedCarousel.bind(self));
  }

  sendTransformationsOther() {
    var self = this;
    self.removeActiveTransformation();
    self.transformationIDNoActive.map(function(transformation) {
      self.payloadObj.transformations = transformation;
      self.sendPayload(self.showHyperedCarousel.bind(self));
      self.setPayloadWActiveMedia(self.mediaGalleryMediaActive);
    });
  }

  removeActiveTransformation() {
    var self = this;
    self.transformationIDNoActive = self.transformationIDAll.filter(id => id != self.transformationActiveID);
  }

  changeSliderImage(responseText, selector, transformationID) {
    var self = this;
    var slidesArr = Array.from(document.querySelectorAll('[data-hyper-selector="' + selector + '"]'));
    slidesArr.map(function(slide) {
      var img = slide.querySelector('img');
      if(img == null) {
        img = slide;
      }
      self.rebuildLazyLoadingImages(img, responseText.result[transformationID]);
    });
  }

  changeContent() {
    this.payloadObj.zones.map((field) => {
      let hyperInput = document.querySelector('[data-zone-id="' + field.id + '"]').querySelector('.so-hyper-field');

      field.content = hyperInput.value;
    })
  }

  rebuildLazyLoadingImages (img, src) {
    img.setAttribute('src', src);
    img.removeAttribute('srcset');
    img.removeAttribute('data-src');
  }
}

customElements.define('so-hyper-component', HyperComponent);

class HyperInput extends HyperComponent {
  constructor() {
    super();

    this.input = this.querySelector('.so-hyper-field');
    this.input.addEventListener('input', debounce(this.onInputChange.bind(this), 500));
  }

  onInputChange() {
    this.changeContent();
    this.setHiddenInput();
    this.showLabelNotification();
    this.showHyperLoader();
    this.sendTransformationActive();
    this.sendTransformationsOther();
  }

  setHiddenInput() {
    var input_selector = this.input.getAttribute('data-hyper-zone-id'),
        input_selector_value = '[name="properties[_hyper['+ input_selector + ']]"]';

    document.querySelector(input_selector_value).value = this.input.value;
  }
}
customElements.define('so-hyper-input', HyperInput);

class BirthstoneOptions extends HTMLElement {
  constructor() {
    super();
    this.birthstoneOptions = Array.from(this.querySelectorAll('.so-custom-field-birthstone-label'));
    this.isBirthstoneMultiple = this.hasAttribute('data-multiple-selection');
    this.selectedAccessoryArr = [];
    this.bsCounterW = document.querySelector('.so-counter-wrap');
    this.selectedBirthstonesW = document.querySelector('.selected-birthstone');
    this.birthstoneOptions.map(function(birthstoneLabel) {
      let birthstone = birthstoneLabel.querySelector('.so-birthstone-input');
      birthstone.addEventListener('change', this.birthstoneChange.bind(this));
      birthstone.addEventListener('click', this.birthstoneClicked.bind(this));
    }, this);
    this.productVariants = Array.from(document.querySelectorAll('.so-variant-metafields'));
    document.body.addEventListener('variant_changed', this.variantChanged.bind(this));
    this.form = document.querySelector('form[action="/cart/add"].so-product-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.getSelectedVariant();
  }

  getSelectedVariant() {
    this.selectedVariant = JSON.parse(this.productVariants.filter((productVariant) => productVariant.hasAttribute('data-selected-variant'))[0].textContent);
  }

  calculateBSamount() {
    var self = this;
    if(!self.bsCounterW) {
      return
    }
    var bsCounter = self.bsCounterW.querySelector('.so-counter-selected');
    var bsAmount = self.bsCounterW.querySelector('.so-counter-amount');
    bsCounter.textContent = self.selectedAccessoryArr.length;
    bsAmount.textContent = self.selectedVariant.engravings;
  }

  birthstoneClicked(event) {
    var self = this;
    self.getSelectedVariant();
    var birthstoneInput = event.target;
    var label = birthstoneInput.parentElement;
    if (!label.classList.contains('disabled'))
    {
      self.addSelectedAccessory(label);
      label.classList.add('so-custom-field-birthstone-selected');
    }
    self.disabelSelection(label);
    var btn = self.form.querySelector('button[type=submit]');
    btn.querySelector('.btn-text').textContent = btn.getAttribute('data-btn-text');
    self.calculateBSamount();
  }

  birthstoneChange(event) {
    var self = this;
    var birthstoneInput = event.target;
    self.birthstoneOptions.map(function(birthstoneLabel) {
      birthstoneLabel.classList.remove('so-custom-field-birthstone-selected');
      birthstoneLabel.querySelector('.so-birthstone-input').checked = false;
    }, self);
    var label = birthstoneInput.parentElement;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length != matches) {
      label.classList.add('so-custom-field-birthstone-selected');
    }
    birthstoneInput.checked = true;
    self.classList.remove('birstone-not-selected');
  }

  selectedBSClicked(event) {
    var self = this;
    var selectedBS = event.target;
    var label = selectedBS.parentElement;
    self.removeSelectedAccessory(label);

    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length < matches)
    {
      self.birthstoneOptions.map(function(birthstoneLabel) {
        birthstoneLabel.classList.remove('disabled');
      }, self);
    }
    self.calculateBSamount();
  }

  disabelSelection(label) {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length == matches)
    {
      self.birthstoneOptions.map(function(birthstoneLabel) {
        let birthstone = birthstoneLabel.querySelector('.so-birthstone-input');
        birthstoneLabel.classList.add('disabled');
        birthstoneLabel.classList.remove('so-custom-field-birthstone-selected');
        if(birthstone.hasAttribute('required')) {
          birthstone.removeAttribute('required', false);
          birthstone.setAttribute('required', false);
        }
      }, self);
    }
  }

  addSelectedAccessory(label) {
    var self = this;
    self.removeErrorHighlights();
    var inputWrapCloned = label.cloneNode(true),
        labelForAttr = inputWrapCloned.getAttribute('for'),
        labelForAttrNew = labelForAttr + '-selected-' + self.selectedAccessoryArr.length;
    document.querySelector('.selected-birthstone').classList.remove('so-hidden');
    document.querySelector('.selected-birthstone').removeAttribute('style');
    inputWrapCloned.classList.add('selected');
    inputWrapCloned.setAttribute('for', labelForAttrNew);
    var inputCloned = inputWrapCloned.querySelector('.so-birthstone-input');
    inputCloned.classList.add('so-birthstone-input-selected');
    inputCloned.classList.remove('so-birthstone-input');
    inputCloned.setAttribute('id', labelForAttrNew);
    document.querySelector('.selected-birthstone .so-custom-field-birthstone-wrap').appendChild(inputWrapCloned);
    if(label.querySelector('.so-birthstone-input').hasAttribute('data-name')) {
      inputWrapCloned.querySelector('.so-birthstone-input-selected').setAttribute('name', label.querySelector('.so-birthstone-input').getAttribute('data-name') + ' ' + (self.selectedAccessoryArr.length + 1) + ']');
    }
    else {
      inputWrapCloned.querySelector('.so-birthstone-input-selected').setAttribute('name', 'properties[birthstone-' + (self.selectedAccessoryArr.length + 1) + ']');
    }
    inputWrapCloned.querySelector('.so-birthstone-input-selected').setAttribute('value', label.querySelector('.so-birthstone-input').getAttribute('data-option-value'));

    self.selectedAccessoryArr.push(inputWrapCloned);
    self.showAccessoryEngraving(self.selectedAccessoryArr, false);
    label.querySelector('input').checked = true;
    inputCloned.addEventListener('click', self.selectedBSClicked.bind(self));
  }

  removeErrorHighlights() {
    var self = this;

    if(document.querySelector('.so-custom-field-birthstone-wrap.birstone-not-selected')) {
      document.querySelector('.so-custom-field-birthstone-wrap.birstone-not-selected').classList.remove('birstone-not-selected');
    }
    self.birthstoneOptions.map(function(birthstoneLabel) {
      birthstoneLabel.classList.remove('so-custom-field-birthstone-selected');
    }, self);
    Array.from(document.querySelectorAll('.so-input-wrap.input-error')).map(function(engravingWrap) {
      engravingWrap.classList.remove('input-error');
    }, self);
  }

  removeSelectedAccessory(label) {
    var self = this,
        labelSelected = self.selectedBirthstonesW.querySelectorAll('.so-custom-field-birthstone-label.selected'),
        itemId = label.getAttribute('for'),
        removedIndex = false;
    for (var i = 0; i < labelSelected.length; i++) {
      if(labelSelected[i].getAttribute('for') == itemId)
      {
        removedIndex = i;
        labelSelected[i].remove();
        self.removeErrorHighlights();
      }
    }

    self.selectedAccessoryArr = self.selectedAccessoryArr.filter(function(value,index) {
      return value.getAttribute('for') != label.getAttribute('for')
    });

    if(self.selectedAccessoryArr.length == 0)
    {
      self.selectedBirthstonesW.classList.add('so-hidden');
    }
    self.showAccessoryEngraving(self.selectedAccessoryArr, removedIndex);

    for (var i = 0; i < self.selectedAccessoryArr.length; i++) {
      var selected_label = self.selectedAccessoryArr[i],
          selected_label_for_without_id = selected_label.getAttribute('for').slice(0, -1),
          selected_label_new_for = selected_label_for_without_id + i;

      selected_label.setAttribute('for', selected_label_new_for);
      selected_label.querySelector('input').setAttribute('id', selected_label_new_for);
      var item_index = i + 1;
      if(selected_label.querySelector('input').hasAttribute('data-name')) {
        selected_label.querySelector('input').setAttribute('name', selected_label.querySelector('input').getAttribute('data-name') + ' ' + item_index + ']');
      }
      else {
        selected_label.querySelector('input').setAttribute('name', 'properties[birthstone-' + item_index + ']');
      }
      selected_label.querySelector('input').checked = true;
    }
  }

  showAccessoryEngraving(arr, removedIndex) {
    var self = this;
    var wrappers = document.querySelectorAll('.birthstone-engraving');
    var wrap_inputs_val = Array.from(wrappers, el => el.querySelector('.field__input').value);
    for (var i = 0; i < wrappers.length; i++) {
      var wrap = wrappers[i],
          form = self.form.querySelectorAll('.so-engraving-input-w')[i],
          input = wrap.querySelector('.field__input'),
          form_input = form.querySelector('.field__input');
      if(removedIndex !== false) {
        if(i < removedIndex) {
          input.value = wrap_inputs_val[i];
          form_input.value = wrap_inputs_val[i];
        }
        else {
          input.value = wrap_inputs_val[i + 1];
          form_input.value = wrap_inputs_val[i + 1];
        }
      }
      self.validateAccessoryEngraving(arr[i], wrap);
      self.validateAccessoryEngraving(arr[i], form);
    }
  }

  validateAccessoryEngraving(arr_item, wrap) {
    var input = wrap.querySelector('.field__input'),
    input_label_accessory = wrap.querySelector('.option-name');
    if (arr_item)
    {
      var accessory_title = arr_item.querySelector('.so-birthstone-input-selected').getAttribute('data-option-value-short');
      wrap.classList.remove('so-hidden');
      if(input.hasAttribute('required') ||input.hasAttribute('data-required')) {
        input.setAttribute('required', true);
      }
      input_label_accessory.textContent = ' ' + accessory_title;
      let engDataName = input.getAttribute('data-name');
      input.setAttribute('name', engDataName);
    }
    else
    {
      wrap.classList.add('so-hidden');
      if(input.hasAttribute('required')) {
        input.removeAttribute('required');
        wrap.querySelector('.field__input').setAttribute('data-required', 1);
      }
      input.value = '';
      input.removeAttribute('name');
    }
  }

  onSubmitHandler(e) {
    var self = this;

    if(!self.validateBS() && !self.validateBSEngraving()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    self.changeATCtext();
  }

  changeATCtext() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    var btn = self.form.querySelector('button[type=submit]');
    if (self.selectedAccessoryArr.length < matches)
    {
      btn.querySelector('.btn-text').textContent = 'Please select more birthstones';
    }
  }

  validateBS() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length == matches)
    {
      return true
    }
    document.querySelector('.so-custom-field-birthstone-wrap').classList.add('birstone-not-selected');
    return false
  }

  validateBSEngraving() {
    var self = this;
    var engravingWrappers = document.querySelectorAll('.birthstone-engraving');
    for (var i = 0; i < self.selectedAccessoryArr.length; i++) {
      var engravingWrap = engravingWrappers[i].querySelector('.so-input-wrap');
      var engravingInput = engravingWrappers[i].querySelector('.so-input-birthstone');
      if(!engravingInput.value.length && engravingInput.hasAttribute('required')) {
        engravingWrap.classList.add('input-error');
      }
      else {
        engravingWrap.classList.remove('input-error');
      }
    }
  }

  variantChanged() {
    var self = this;

    self.getSelectedVariant();
    self.accessoryOptionsState();
    self.rebuildAccessories();
    self.calculateBSamount();
  }

  accessoryOptionsState() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length < matches)
    {
      self.birthstoneOptions.map(function(accessoryLabel) {
        accessoryLabel.classList.remove('disabled');
      }, self);
    }
    else {
      self.birthstoneOptions.map(function(accessoryLabel) {
        accessoryLabel.classList.add('disabled');
      }, self);
    }
  }

  rebuildAccessories() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    self.selectedAccessoryArr.map(function(label, index) {
      if(index >= matches) {
        label.remove();
        self.removeSelectedAccessory(label);
      }
    });
  }

  destroy() {
    var self = this;
    self.selectedAccessoryArr.map(function(label) {
      label.remove();
      self.removeSelectedAccessory(label);

      self.birthstoneOptions.map(function(birthstoneLabel) {
        let birthstone = birthstoneLabel.querySelector('.so-birthstone-input');
        birthstoneLabel.classList.remove('disabled');
        birthstoneLabel.classList.remove('so-custom-field-birthstone-selected');
        if(birthstone.hasAttribute('required') || birthstone.hasAttribute('data-required')) {
          birthstone.setAttribute('required', true);
        }
      }, self);
    });

    self.selectedAccessoryArr = [];
  }
}

customElements.define('birthstone-options', BirthstoneOptions);


class AccessoryOptions extends HTMLElement {
  constructor() {
    super();
    this.accessoryOptions = Array.from(this.querySelectorAll('.so-custom-field-accessory-label'));
    this.isAccessoryMultiple = this.hasAttribute('data-multiple-selection');
    this.selectedAccessoryArr = [];
    this.bsCounterW = document.querySelector('.so-counter-wrap');
    this.selectedAccessoriesW = document.querySelector('.selected-accessory');
    this.accessoryOptions.map(function(accessoryLabel) {
      let accessory = accessoryLabel.querySelector('.so-accessory-input');
      accessory.addEventListener('change', this.accessoryChange.bind(this));
      accessory.addEventListener('click', this.accessoryClicked.bind(this));
    }, this);
    this.productVariants = Array.from(document.querySelectorAll('.so-variant-metafields'));
    document.body.addEventListener('variant_changed', this.variantChanged.bind(this));
    this.form = document.querySelector('form[action="/cart/add"].so-product-form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.getSelectedVariant();
  }

  getSelectedVariant() {
    this.selectedVariant = JSON.parse(this.productVariants.filter((productVariant) => productVariant.hasAttribute('data-selected-variant'))[0].textContent);
  }

  calculateBSamount() {
    var self = this;
    if(!self.bsCounterW) {
      return
    }
    var bsCounter = self.bsCounterW.querySelector('.so-counter-selected');
    var bsAmount = self.bsCounterW.querySelector('.so-counter-amount');
    bsCounter.textContent = self.selectedAccessoryArr.length;
    bsAmount.textContent = self.selectedVariant.engravings;
  }

  accessoryClicked(event) {
    var self = this;
    self.getSelectedVariant();
    var accessoryInput = event.target;
    var label = accessoryInput.parentElement;
    if (!label.classList.contains('disabled'))
    {
      self.addSelectedAccessory(label);
      label.classList.add('so-custom-field-accessory-selected');
    }
    self.disabelSelection(label);
    var btn = self.form.querySelector('button[type=submit]');
    btn.querySelector('.btn-text').textContent = btn.getAttribute('data-btn-text');
    self.calculateBSamount();
  }

  accessoryChange(event) {
    var self = this;
    var accessoryInput = event.target;
    self.accessoryOptions.map(function(accessoryLabel) {
      accessoryLabel.classList.remove('so-custom-field-accessory-selected');
      accessoryLabel.querySelector('.so-accessory-input').checked = false;
    }, self);
    var label = accessoryInput.parentElement;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length != matches) {
      label.classList.add('so-custom-field-accessory-selected');
    }
    accessoryInput.checked = true;
    self.classList.remove('birstone-not-selected');
  }

  selectedBSClicked(event) {
    var self = this;
    var selectedBS = event.target;
    var label = selectedBS.parentElement;
    self.removeSelectedAccessory(label);

    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length < matches)
    {
      self.accessoryOptions.map(function(accessoryLabel) {
        accessoryLabel.classList.remove('disabled');
      }, self);
    }
    self.calculateBSamount();
  }

  disabelSelection(label) {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length == matches)
    {
      self.accessoryOptions.map(function(accessoryLabel) {
        let accessory = accessoryLabel.querySelector('.so-accessory-input');
        accessoryLabel.classList.add('disabled');
        accessoryLabel.classList.remove('so-custom-field-accessory-selected');
        if(accessory.hasAttribute('required')) {
          accessory.removeAttribute('required', false);
          accessory.setAttribute('required', false);
        }
      }, self);
    }
  }

  addSelectedAccessory(label) {
    var self = this;
    self.removeErrorHighlights();
    var inputWrapCloned = label.cloneNode(true),
        labelForAttr = inputWrapCloned.getAttribute('for'),
        labelForAttrNew = labelForAttr + '-selected-' + self.selectedAccessoryArr.length;
    document.querySelector('.selected-accessory').classList.remove('so-hidden');
    document.querySelector('.selected-accessory').removeAttribute('style');
    inputWrapCloned.classList.add('selected');
    inputWrapCloned.setAttribute('for', labelForAttrNew);
    var inputCloned = inputWrapCloned.querySelector('.so-accessory-input');
    inputCloned.classList.add('so-accessory-input-selected');
    inputCloned.classList.remove('so-accessory-input');
    inputCloned.setAttribute('id', labelForAttrNew);
    document.querySelector('.selected-accessory .so-custom-field-accessory-wrap').appendChild(inputWrapCloned);
    if(label.querySelector('.so-accessory-input').hasAttribute('data-name')) {
      inputWrapCloned.querySelector('.so-accessory-input-selected').setAttribute('name', label.querySelector('.so-accessory-input').getAttribute('data-name') + ' ' + (self.selectedAccessoryArr.length + 1) + ']');
    }
    else {
      inputWrapCloned.querySelector('.so-accessory-input-selected').setAttribute('name', 'properties[accessory-' + (self.selectedAccessoryArr.length + 1) + ']');
    }
    inputWrapCloned.querySelector('.so-accessory-input-selected').setAttribute('value', label.querySelector('.so-accessory-input').getAttribute('data-option-value'));

    self.selectedAccessoryArr.push(inputWrapCloned);
    self.showAccessoryEngraving(self.selectedAccessoryArr, false);
    label.querySelector('input').checked = true;
    inputCloned.addEventListener('click', self.selectedBSClicked.bind(self));
  }

  removeErrorHighlights() {
    var self = this;

    if(document.querySelector('.so-custom-field-accessory-wrap.birstone-not-selected')) {
      document.querySelector('.so-custom-field-accessory-wrap.birstone-not-selected').classList.remove('birstone-not-selected');
    }
    self.accessoryOptions.map(function(accessoryLabel) {
      accessoryLabel.classList.remove('so-custom-field-accessory-selected');
    }, self);
    Array.from(document.querySelectorAll('.so-input-wrap.input-error')).map(function(engravingWrap) {
      engravingWrap.classList.remove('input-error');
    }, self);
  }

  removeSelectedAccessory(label) {
    var self = this,
        labelSelected = self.selectedAccessoriesW.querySelectorAll('.so-custom-field-accessory-label.selected'),
        itemId = label.getAttribute('for'),
        removedIndex = false;
    for (var i = 0; i < labelSelected.length; i++) {
      if(labelSelected[i].getAttribute('for') == itemId)
      {
        removedIndex = i;
        labelSelected[i].remove();
        self.removeErrorHighlights();
      }
    }

    self.selectedAccessoryArr = self.selectedAccessoryArr.filter(function(value,index) {
      return value.getAttribute('for') != label.getAttribute('for')
    });

    if(self.selectedAccessoryArr.length == 0)
    {
      self.selectedAccessoriesW.classList.add('so-hidden');
    }
    self.showAccessoryEngraving(self.selectedAccessoryArr, removedIndex);

    for (var i = 0; i < self.selectedAccessoryArr.length; i++) {
      var selected_label = self.selectedAccessoryArr[i],
          selected_label_for_without_id = selected_label.getAttribute('for').slice(0, -1),
          selected_label_new_for = selected_label_for_without_id + i;

      selected_label.setAttribute('for', selected_label_new_for);
      selected_label.querySelector('input').setAttribute('id', selected_label_new_for);
      var item_index = i + 1;
      if(selected_label.querySelector('input').hasAttribute('data-name')) {
        selected_label.querySelector('input').setAttribute('name', selected_label.querySelector('input').getAttribute('data-name') + ' ' + item_index + ']');
      }
      else {
        selected_label.querySelector('input').setAttribute('name', 'properties[accessory-' + item_index + ']');
      }
      selected_label.querySelector('input').checked = true;
    }
  }

  showAccessoryEngraving(arr, removedIndex) {
    var self = this;
    var wrappers = document.querySelectorAll('.birthstone-engraving');
    var wrap_inputs_val = Array.from(wrappers, el => el.querySelector('.field__input').value);
    for (var i = 0; i < wrappers.length; i++) {
      var wrap = wrappers[i],
          form = self.form.querySelectorAll('.so-engraving-input-w')[i],
          input = wrap.querySelector('.field__input'),
          form_input = form.querySelector('.field__input');
      if(removedIndex !== false) {
        if(i < removedIndex) {
          input.value = wrap_inputs_val[i];
          form_input.value = wrap_inputs_val[i];
        }
        else {
          input.value = wrap_inputs_val[i + 1];
          form_input.value = wrap_inputs_val[i + 1];
        }
      }
      self.validateAccessoryEngraving(arr[i], wrap);
      self.validateAccessoryEngraving(arr[i], form);
    }
  }

  validateAccessoryEngraving(arr_item, wrap) {
    var input = wrap.querySelector('.field__input'),
    input_label_accessory = wrap.querySelector('.option-name');
    if (arr_item)
    {
      var accessory_title = arr_item.querySelector('.so-accessory-input-selected').getAttribute('data-option-value-short');
      wrap.classList.remove('so-hidden');
      if(input.hasAttribute('required') ||input.hasAttribute('data-required')) {
        input.setAttribute('required', true);
      }
      input_label_accessory.textContent = ' ' + accessory_title;
      let engDataName = input.getAttribute('data-name');
      input.setAttribute('name', engDataName);
    }
    else
    {
      wrap.classList.add('so-hidden');
      if(input.hasAttribute('required')) {
        input.removeAttribute('required');
        wrap.querySelector('.field__input').setAttribute('data-required', 1);
      }
      input.value = '';
      input.removeAttribute('name');
    }
  }

  onSubmitHandler(e) {
    var self = this;

    if(!self.validateBS() && !self.validateBSEngraving()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    self.changeATCtext();
  }

  changeATCtext() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    var btn = self.form.querySelector('button[type=submit]');
    if (self.selectedAccessoryArr.length < matches)
    {
      btn.querySelector('.btn-text').textContent = 'Please select more accessories';
    }
  }

  validateBS() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length == matches)
    {
      return true
    }
    document.querySelector('.so-custom-field-accessory-wrap').classList.add('birstone-not-selected');
    return false
  }

  validateBSEngraving() {
    var self = this;
    var engravingWrappers = document.querySelectorAll('.accessory-engraving');
    for (var i = 0; i < self.selectedAccessoryArr.length; i++) {
      var engravingWrap = engravingWrappers[i].querySelector('.so-input-wrap');
      var engravingInput = engravingWrappers[i].querySelector('.so-input-accessory');
      if(!engravingInput.value.length && engravingInput.hasAttribute('required')) {
        engravingWrap.classList.add('input-error');
      }
      else {
        engravingWrap.classList.remove('input-error');
      }
    }
  }

  variantChanged() {
    var self = this;

    self.getSelectedVariant();
    self.changeAccessoryMetal();
    self.accessoryOptionsState();
    self.rebuildAccessories();
    self.calculateBSamount();
  }

  accessoryOptionsState() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    if (self.selectedAccessoryArr.length < matches)
    {
      self.accessoryOptions.map(function(accessoryLabel) {
        accessoryLabel.classList.remove('disabled');
      }, self);
    }
    else {
      self.accessoryOptions.map(function(accessoryLabel) {
        accessoryLabel.classList.add('disabled');
      }, self);
    }
  }

  rebuildAccessories() {
    var self = this;
    var matches = self.selectedVariant.engravings*1;
    self.selectedAccessoryArr.map(function(label, index) {
      if(index >= matches) {
        label.remove();
        self.removeSelectedAccessory(label);
      }
    });
  }

  changeAccessoryMetal() {
    var self = this;
    var accessoryImgs = Array.from(document.querySelectorAll('.so-custom-field-accessory-img'));
    accessoryImgs.map((item) => item.setAttribute('data-metal', self.selectedVariant.metal));
  }

  destroy() {
    var self = this;
    self.selectedAccessoryArr.map(function(label) {
      label.remove();
      self.removeSelectedAccessory(label);

      self.accessoryOptions.map(function(accessoryLabel) {
        let accessory = accessoryLabel.querySelector('.so-accessory-input');
        accessoryLabel.classList.remove('disabled');
        accessoryLabel.classList.remove('so-custom-field-accessory-selected');
        if(accessory.hasAttribute('required') || accessory.hasAttribute('data-required')) {
          accessory.setAttribute('required', true);
        }
      }, self);
    });

    self.selectedAccessoryArr = [];
  }
}

customElements.define('accessory-options', AccessoryOptions);

