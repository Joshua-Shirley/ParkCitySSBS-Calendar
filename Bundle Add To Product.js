function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
}

async function postData(url = '', data = {}) {    
    const response = await fetch(url, {
      method: 'POST', 
      mode: 'cors', 
      cache: 'no-cache', 
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json'  
      },
      redirect: 'follow', 
      referrerPolicy: 'no-referrer', 
      body: JSON.stringify(data) 
    });
    return response.json();
}

var baseurl = "https://parkcityssbs.com";
var path = "/api/commerce/shopping-cart/entries";
var crumb = getCookie("crumb");

function buildUrl(baseurl, path, parameter){
    return baseurl + path + "?" + "crumb=" + parameter;
}

function addToCart(url, itemId) {
  postData(url, {itemId: itemId, sku: null, additionalFields: "null"})
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

var bundledItems =["669ff9aca4ab3e7470696eab", "669fed275c2bb33e1246d5cb","669ff972ed1eb6407a9d4107","669ff9d7a4ab3e7470696ed4","669ff9f0ed1eb6407a9d415a"];
var addToCartURL = buildUrl(baseurl, path, crumb);
bundledItems.forEach(item => {
    addToCart( addToCartURL , item)
});



/*
crumb=BVRMMz6QGT4lZWYzNmRmMjA2MzdjNTJmNDQ4ZTRhNGY2ZjFkMjFk; 
hasCart=true; 
ss_cvr=1cfb0bdc-9177-4017-be68-ea620c7dac41|1717610058141|1721760538736|1721764511821|80; 
ss_cvt=1721764511821;
*/


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