let bundled = {
  cookie : "",
  popupBlock : "",
  url : "https://www.parkcityssbs.com/api/commerce/shopping-cart/entries?crumb=",
  addToCart: function(productIds) {
    this.cookie = this.getCookie("crumb");
    this.url += this.cookie;    
    this.popupBlock = document.querySelector("#popup");
    if(productIds){
      productIds.forEach(item => {
        setTimeout(() => { this.apiCall( this.url , item); }, 1000);
      });
    }
  },
  apiCall: function (url, id) {
    var input = {itemId: id, sku: null, additionalFields: "null"}; 
    this.postData(url, input)
      .then(data => view.addMessage(data.newlyAdded.title))
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
  popup: function(data) {
     var span = documeent.createElement("span");
     span.innerText = data;
     this.popup.querySelector("div").append(span);
  }
}

let view = {
  modal: null,
  content: null,
  init : function() {
    if(this.modal == null) {
      this.modalBox();          
    }
    if(this.content == null) {
      this.contentBox();
    }
  },
  addMessage: function(message) {
    this.init();
    const p = document.createElement("p");
    p.innerText = message;
    this.content.append(p);
    this.show();
  },
  show: function() {
    this.modal.style.display = "initial";
    setTimeout(() => { view.close(); }, 10000 );
  },
  close: function() {
    this.modal.style.display = "none";
  },
  modalBox: function() {
    this.modal = document.createElement("div");
    this.modal.id = "popup";
    this.modal.classList.add("modal");    
    document.body.append(this.modal); 
  },
  contentBox: function() {
    this.content = document.createElement("div");
    this.content.classList.add("modal-content");
    this.modal.append(this.content);
    this.headerBox();
    this.closeButton();
  },
  headerBox: function() {
    var h2 = document.createElement("h2");
    h2.innerText = "Products Added";
    this.content.append(h2);
  },
  closeButton: function() {
    var button = document.createElement("button");
    button.classList.add("btn-caption");
    button.innerText = "X";
    button.addEventListener("click", view.close());
    this.content.append(button);
  }
}


var productElements = document.querySelectorAll(".sqs-block-product");
productElements.forEach(element => {
  var rawData = element.querySelectorAll("div")[1].getAttribute("data-current-context");
  var jsonData = JSON.parse(rawData);
  var button = element.querySelector(".sqs-add-to-cart-button");
  button.addEventListener("click" , function() { addProducts(jsonData.id); });
});

function addProducts(itemId) {
  var program = programs.find(p => p.parentId == itemId);
  bundled.addToCart(program.products);
  stopPropagation();
}

function stopPropagation() {
  var elements = document.querySelectorAll(".sqs-block-product");
  elements.forEach(element => {
     element.style.display = "none";
  });
}
