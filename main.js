/**
 * HELPERS
 */
function _select(selecor, all = false) {
  return all
    ? [].slice.call(document.querySelectorAll(selecor))
    : document.querySelector(selecor);
}
function _create(tag) {
  return document.createElement(tag);
}
function _button(btnClass, content = "") {
  let button = _create("button");
  button.className = `btn btn-${btnClass}`;
  button.textContent = content;
  return button;
}

/* LocalStorage Actions */
function getLocal(key = "products") {
  return JSON.parse(localStorage.getItem(key));
}
function saveLocal(key = "products", data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function clearLocal(key = "products") {
  localStorage.setItem(key, "[]");
}

/**
 * The @function renderProduct creates a card component (styled by bootstrap)
 * icluding two buttons , attache the events and pass the id product's id (one for editing, one for deleting)
 *
 * @param {HTMLElement} container
 * @param {object} param1
 */
/* RENDERING UI ELEMENTS */
function renderProduct(container, { title, productId }) {
  let card = _create("div");
  card.className = "card border rounded mx-auto w-75 p-2 mb-2";

  let cardBody = _create("div");
  cardBody.className = "card-body";
  let cardText = _create("p");
  cardText.textContent = title;
  cardBody.append(cardText);

  let cardFooter = _create("div");
  cardFooter.className = "card-footer";

  let deleteButton = _button("danger", "delete");
  deleteButton.onclick = () => deleteEvent(productId);
  let editButton = _button("info ml-2", "edit");
  editButton.onclick = function () {
    editEvent(this, this.parentElement.parentElement.children[0], productId);
  };

  cardFooter.append(deleteButton);
  cardFooter.append(editButton);

  card.append(cardBody);
  card.append(cardFooter);

  container.append(card);
}

/**
 * @function renderProducts takes a localStorage key as a parameter
 * to define wich list (array) of products to render
 * @param {string} target
 */
function renderProducts(target = "products") {
  let container = _select(".product-list"); // Products Container
  let productList = getLocal(target); // fetch All products from

  for (let product of productList) {
    renderProduct(container, product); // render each element
  }
}

/**
 * @function clearProducts Removes the products from the DOM
 */
function clearProducts() {
  let children = [].slice.call(_select(".product-list").children);
  for (let child of children) {
    _select(".product-list").removeChild(child);
  }
}

function rerenderProducts(target = "products", data) {
  saveLocal(target, data);
  clearProducts();
  renderProducts(target);
}

// Program Initialize
if (!getLocal()) {
  saveLocal("products", []);
}

let products = getLocal();

if (products.length) {
  renderProducts(); // Render only if at least one product exists
} else {
  disableSearchInput(true);
}

function disableSearchInput(cond) {
  if (cond) {
    _select("#searchInput").disabled = true;
  } else {
    _select("#searchInput").disabled = false;
  }
}

// Attach Event Listeners
_select(".btn-danger").onclick = function () {
  clearProducts();
  clearLocal();
  disableSearchInput(true);
};

_select("#addProduct").onsubmit = function (ev) {
  ev.preventDefault();

  let product = {
    title: this.title.value,
    productId: Math.floor(Math.random() * 10000),
  };
  this.title.value = "";
  let products = getLocal();
  disableSearchInput(false);
  rerenderProducts("products", [...products, product]);
};

function deleteEvent(id) {
  let products = getLocal();

  let filteredProducts = products.filter(({ productId }) => productId != id);
  if (!filteredProducts.length) disableSearchInput(true);
  rerenderProducts("products", filteredProducts);
}
/**
 *
 * @param {} id
 * @param {*} button
 * @param {*} cardBody
 */
function editEvent(button, cardBody, id) {
  let content = cardBody.textContent;
  let input = _create("input");
  input.className = "form-control";
  input.value = content;

  let validateButton = _button("success ml-2", "Valid");

  cardBody.parentElement.replaceChild(input, cardBody);
  let editButton = button.parentElement.replaceChild(validateButton, button);

  validateButton.onclick = function () {
    validateEvent(this, editButton, cardBody, input, id);
  };
}
/**
 * @function validateEvent takes 5 arguments :)
 * the first two are the validate button and the edit button
 * in order to switch between them to edit the title
 * the third parameter is the cardBody of the post and th forth is the input
 * on the edit mode the function replace the input (after retrieving the value) with the cardBody,
 * and the validate button with the edit button.
 * the last argument is the id of the product that needs to be updated.
 * @param {HTMLButtonElement} mainButton
 * @param {HTMLButtonElement} editButton
 * @param {HTMLDivElement} div
 * @param {HTMLInputElement} input
 * @param {number} id
 */
function validateEvent(mainButton, editButton, div, input, id) {
  div.textContent = input.value;
  input.parentElement.replaceChild(div, input);
  mainButton.parentElement.replaceChild(editButton, mainButton);

  let products = getLocal();
  let editedProducts = products.map((product) => {
    if (product.productId == id) {
      product.title = input.value;
      return product; // Edited!
    } else {
      return product;
    }
  });

  rerenderProducts("products", editedProducts);
}

/* fliter the products and save it on search LocalStorage */
_select("#searchInput").onkeyup = function (ev) {
  if (!localStorage.getItem("search")) {
    localStorage.setItem("search", "[]");
  }

  if (!this.value) {
    clearProducts();
    renderProducts();
  } else {
    let products = getLocal();
    let searchResult = products.filter(({ title }) =>
      title.includes(this.value)
    );

    rerenderProducts("search", searchResult);
  }
};
