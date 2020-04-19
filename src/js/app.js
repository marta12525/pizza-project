import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
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
    
    //console.log(pageMatchingHash);
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click',  function (event) {
        const clickedElement = this;
        event.preventDefault();

        //get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');

        //run thisApp.activatePage with that id
        thisApp.activatePage(id);

        //change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    //add class acive to matching pages, remove from non-matching
    for (let page of thisApp.pages) {
      // if (page.id == pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      // OR

      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    //add class acive to matching links, remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      ); //I divide it for better visibility

    }

  },

  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);
    //const testProduct = new Product();
    //console.log('test Product:', testProduct);
    for(let productData in thisApp.data.products) {
      //new Product(productData, thisApp.data.products[productData]);
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
        //console.log('parsedResponse',  parsedResponse);

        //save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        //execute initManu method
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));
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

  initBooking: function () {
    const thisApp = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWrapper);
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
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData ();
    //thisApp.initMenu ();
    thisApp.initCart ();

    thisApp.initBooking ();

    thisApp.initCarousel();
  },
};

app.init();