if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        if (!this.hasAttribute('available')) return;

        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
<<<<<<< HEAD
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        let rootUrl = this.dataset.rootUrl;
=======
        this.fetchAvailability(this.getAttribute('data-variant-id'));
      }

      fetchAvailability(variantId) {
        let rootUrl = this.getAttribute('data-root-url');
>>>>>>> bdc1b2b (theme save push)
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        fetch(variantSectionUrl)
          .then((response) => response.text())
<<<<<<< HEAD
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
=======
          .then((responseText) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(responseText, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch(() => {
>>>>>>> bdc1b2b (theme save push)
            const button = this.querySelector('button');
            if (button) button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

<<<<<<< HEAD
      onClickRefreshList(evt) {
        this.fetchAvailability(this.dataset.variantId);
=======
      onClickRefreshList() {
        this.fetchAvailability(this.getAttribute('data-variant-id'));
      }

      update(variant) {
        if (variant?.available) {
          this.fetchAvailability(variant.id);
        }
        else {
          this.innerHTML = '';
          this.removeAttribute('available');
          this.setAttribute('hidden', '');
        }
>>>>>>> bdc1b2b (theme save push)
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
<<<<<<< HEAD
        const drawer = document.querySelector('pickup-availability-drawer');
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
        this.setAttribute('available', '');

        document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));

        const button = this.querySelector('button');
        if (button)
          button.addEventListener('click', (evt) => {
            document.querySelector('pickup-availability-drawer').show(evt.target);
          });
      }
    }
  );
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define(
    'pickup-availability-drawer',
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();

        this.onBodyClick = this.handleBodyClick.bind(this);

        this.querySelector('button').addEventListener('click', () => {
          this.hide();
        });

        this.addEventListener('keyup', (event) => {
          if (event.code.toUpperCase() === 'ESCAPE') this.hide();
        });
      }

      handleBodyClick(evt) {
        const target = evt.target;
        if (
          target != this &&
          !target.closest('pickup-availability-drawer') &&
          target.id != 'ShowPickupAvailabilityDrawer'
        ) {
          this.hide();
        }
      }

      hide() {
        this.removeAttribute('open');
        document.body.removeEventListener('click', this.onBodyClick);
        document.body.classList.remove('overflow-hidden');
        removeTrapFocus(this.focusElement);
      }

      show(focusElement) {
        this.focusElement = focusElement;
        this.setAttribute('open', '');
        document.body.addEventListener('click', this.onBodyClick);
        document.body.classList.add('overflow-hidden');
        trapFocus(this);
=======
        const drawer = document.querySelector('.pickup-availability-drawer');
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector('.pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          this.setAttribute('hidden', '');
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector('.pickup-availability-preview').outerHTML;
        this.removeAttribute('hidden');
        this.setAttribute('available', '');

        document.body.appendChild(sectionInnerHTML.querySelector('.pickup-availability-drawer'));
>>>>>>> bdc1b2b (theme save push)
      }
    }
  );
}
