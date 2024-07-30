let bundled = {
  cookie : "",
  url : "https://www.parkcityssbs.com/api/commerce/shopping-cart/entries?crumb=",
  addToCart: function(productIds) {
    this.cookie = this.getCookie("crumb");
    this.url += this.cookie;    
    if(productIds){
      productIds.forEach(item => {
        this.apiCall( this.url , item)
      });
    }
  },
  apiCall: function (url, id) {
    var data = {itemId: id, sku: null, additionalFields: "null"};    
    this.postData(url, data)
      .then(data => console.log(data))
      .catch(error => console.log('Error:', error));
  },
  postData: async function(url , data ) {    
    const response = await fetch(url, {
      method: "POST",       
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify(data),           
    });
    return response.json();
  },
  getCookie: function(name) {
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
  },
}

var productElements = document.querySelectorAll(".sqs-block-product");


productElements.forEach(element => {
  var rawData = productElements[0].querySelectorAll("div")[1].getAttribute("data-current-context");
  var data = JSON.parse(rawData);
  
});
