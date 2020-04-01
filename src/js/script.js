/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor (id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      //console.log('new Product:', thisProduct);

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget();
      
      thisProduct.processOrder();
    }

    renderInMenu () {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion () {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(clickableTrigger);
  
      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();
  
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
  
        /* find all active products */
        const activeProducts = document.querySelectorAll('.active');
  
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
          }

        /* END LOOP: for each active product */
        }

      /* END: click event listener to trigger */
      });

    }

    initOrderForm () {
      const thisProduct = this;
      //console.log(thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder () {
      const  thisProduct = this;
      //console.log(thisProduct);

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      thisProduct.params = {};
      //domyślna cena produktu wzięta z thisProduct.data.price zapisana w price
      let price = thisProduct.data.price;
      //console.log(price);

      const paramsOfProduct = thisProduct.data.params;

      //START LOOP: for each paramId in thisProduct.data.params
      for (let paramId in paramsOfProduct) {

        //save the element in thisProduct.data.params with key paramId as const param
        const param = paramsOfProduct[paramId];

        //START LOOP: for each optionId in param.options
        for (let optionId in param.options) {

          const option = param.options[optionId];

          //save the element in param.options with key optionId as const option
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          // START IF: if option is selected and option is not default
          if (optionSelected && !option.default) {
            //add price of option to variable price */
            price += option.price;
          //END IF: if option is selected and option is not default */
          } else if (!optionSelected && option.default) {
          //START ELSE IF: if option is not selected and option is default */
          
            //deduct price of option from price */
            price -= option.price;
          //END ELSE IF: if option is not selected and option is default */
          }

          const activeImages = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);

          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            for (let image of activeImages) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {
            for (let image of activeImages) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        //END LOOK: for each optionId in param.options
        }

      //END LOOP: for each paramId in thisProduct.data.params
      }

      //multiply price by amount
      //price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      //thisProduct.priceElem(price);
      //thisProduct.priceElem.innerHTML = price;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price; 
      console.log(thisProduct.params);
    }

    initAmountWidget () {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart () {
      const thisProduct = this;
      
      thisProduct.name = thisProduct.data.name;

      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);

    }
  }

  class AmountWidget {
    constructor (element) {
      const thisWidget = this;

      //console.log('AmountWidget:', AmountWidget);

      thisWidget.getElements(element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.setValue(thisWidget.input.value); //wywołanie metody setValue

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      //TODO: add validation - która będzie sprawdzać czy wartość tej stałej jest poprawna i mieści się w dopuszczalnym zakresie – tylko w takim przypadku zostanie ona zapisana jako właściwość thisWidget.value

      if (newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue; //wartość przekazanego argumentu, po przekonwertowaniu go na liczbę.
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value; //nowa wartść inputa, Dzięki temu nowa wartość wyświetli się na stronie
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      }),

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault;
        thisWidget.setValue(thisWidget.value - 1);
      }),

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault;
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      //const testProduct = new Product();
      //console.log('test Product:', testProduct);
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData ();
      thisApp.initMenu ();
      thisApp.initCart ();
    },
  };

  class Cart {
    constructor (element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements (element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions () {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add (menuProduct) {
      const thisCart = this;

      //generate HTML based on template
      const generatedHTML = templates.cartProduct(menuProduct);

      //create element DOM i savi it in const generatedDOM
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      //add DOM elments to thisCart.dom.productList
      thisCart.dom.productList.appendChild(generatedDOM);

      //define thisCart.dom.productList in get Elements method



      console.log('adding product', menuProduct);
    }
  }

  app.init();

}