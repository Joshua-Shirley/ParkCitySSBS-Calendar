class cartItem {
    constructor( cartRowId, itemId, sku ){
        this.cartRowId = cartRowId;
        this.itemId = itemId;
        this.sku = sku;        
        
        var match = sku.match(/(\d{4})-(\d{2})-(\d{2})/);
        if(match) { this.date = new Date(match[0]).addDays(1); }
        else { this.date = null; }
    }    
}


var scheduled = [];
cart.entries.forEach(row => {
    var item = new cartItem(row.id, row.itemId, row.chosenVariant.sku);
    scheduled.push(item);
});

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
  };

function shoppingCartUrl() {
    const url = "https://www.parkcityssbs.com/api/commerce/shopping-cart?crumb={crumb}&mock=false&timecode={timecode}&calculateSubtotal=true";
    const crumb = getCookie("crumb");
    const now = new Date();
    return url.replace("{crumb}", crumb).replace("{timecode}", now.valueOf());    
}

async function getData(url) {
    try {
        const response = await fetch(url, { method: "GET" });
        if(!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    }
    catch {
        console.error("Error: ", error);
    }
}

Date.prototype.compareDate = function(dateB) {
    if( this.getFullYear() == dateB.getFullYear() ) {
        if( this.getMonth() == dateB.getMonth() ) {
            if( this.getDate() == dateB.getDate() ) {
                return true;
            }
        }
    }
    return false;
};


<script type="text/javascript" src="https://www.skiguapo.com/js/parkcity/FastUp.js"></script>