import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initBooking: function () {
    const thisApp = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWrapper);
  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    
    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click',  function (event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    for (let page of thisApp.pages) {

      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function () {
    const thisApp = this;

    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch (url)
      .then (function (rawResponse) {
        return rawResponse.json();
      })
      .then (function (parsedResponse) {

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initCarousel() {
    let slideIndex = 0;

    showSlides();

    function showSlides() {
      let i;
      const slides = document.getElementsByClassName(classNames.carousel.card);
      const dots = document.getElementsByClassName(classNames.carousel.dot);
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
      }
      slideIndex++;
      if (slideIndex > slides.length) {
        slideIndex = 1;
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(classNames.carousel.activeDot, '');
      }
      slides[slideIndex - 1].style.display = 'inherit';
      dots[slideIndex - 1].className += classNames.carousel.activeDot;
      setTimeout(showSlides, 3000);
    }
  },

  init: function () {
    const thisApp = this;

    thisApp.initPages();

    thisApp.initData ();

    thisApp.initCart ();

    thisApp.initBooking ();

    thisApp.initCarousel();
  },
};

app.init();