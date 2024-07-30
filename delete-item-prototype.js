/*
DELETING ITEMS

// FETCH THE CURRENT SHOPPING CART

1. GET the cart Id

2. Get the shopping cart entry id
- each item has a cart entry id - this is not the product item Id
- the entries can be searched to find the id that matches the product itemId

3. Build the delete product url

4. DELETE it var deleteUrl = "https://www.parkcityssbs.com/api/3/commerce/cart/-Y2BfpQrtaEUmi0koxbf-gFJNCeJGTShnaDIks2O/items/66a00ea718b78d08e52733a9";

https://www.parkcityssbs.com/api/3/commerce/cart/-Y2BfpQrtaEUmi0koxbf-gFJNCeJGTShnaDIks2O/items/669fee0e74c14d5dac8b14d3

5. Update the page

*/

class CartItem {
  constructor(id, itemId, sku) {
      this.id = id;
      this.itemId = itemId;
      this.sku = sku;
      this.date = parseDate(sku);
  }
}

function parseDate(sku) {
  const match = sku.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
      return null;
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const date = new Date(year, month, day);
  return date;
}

async function fetchData(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors gracefully (e.g., display an error message to the user)
  }
}

const cart = {
  cartToken: "",
  entries : [],
}

fetchData('https://www.parkcityssbs.com/api/commerce/shopping-cart')
  .then(data => {
      cart.cartToken = data.cartToken;
      data.entries.forEach(item => {
          cart.entries.push(new CartItem(item.id, item.itemId, item.chosenVariant.sku));
      });
  })
  .catch(error => {
      console.error('Error processing data:', error);
  });


async function deleteData(url) {
  try {
      const response = await fetch(url, {
          method: 'DELETE',
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
  }
  catch (error) {
      console.error('Error:', error);

  }
}

function deleteItemUrl(sku) {
  var item = cart.entries.filter(item => item.sku == sku);
  var url = "https://www.parkcityssbs.com/api/3/commerce/cart/" + cart.cartToken + "/items/" + item[0].id;
  return url;
}

/* the delete request is another dead end.
    the url is correct and formatting
    but it gets rejected from a security protocol
*/