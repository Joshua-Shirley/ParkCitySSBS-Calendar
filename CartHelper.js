(() => { 
    if(window.location.href.endsWith("/cart")) 
    { 
        
       
        let cartHelper = {
            products: [],
            container: "",
            elements: [],
            nodes : {
                container: "",
                return : "",
                filterMonth : "",
            },
            initiated: false,
            linksLoaded: false,
            init: function() {
                // call it once
                if(this.initiated == false){
                    // locate the contain element
                    this.container = document.querySelector(".cart-container");
                    // get all the elements
                    this.elements = cartHelper.container.querySelectorAll(".cart-row"); 
    
                    // fetches all the cart rows and converts the elements in a Product class list
                    this.fillProducts();
    
                    // links & filters
                    this.nodes.return = this.returnLink();
                    this.nodes.filterMonth = this.filterMonth();
                    // Add the links for sorting and filtering
                    this.cartLinks();
    
                    // Make sure each button has a click event
                    this.clickRemove();
    
                    this.initiated = true;
                }
            },
    
            /* sort is called everytime the row count changes */
            sort: function () {            
                this.init();
                
                // reset the products array
                //this.products = [];
                
                // fetches all the cart rows and converts the elements in a Product class list
                //this.fillProducts();
    
                // sort the current list
                this.sortAscending();
    
                // changes the location of each row within the DOM
                this.updateView();
                
                // UPDATE THE FILTERS
                this.filterMonthOptions();      
                
                return this.products;
            },
            
            fillProducts: function () {
                class Product {
                    constructor(element, date) {
                        this.element = element;
                        this.date = new Date(date);
                    }
                }
    
                var list = [];
                this.elements.forEach(row => {
                    var descriptionDiv = row.querySelector(".cart-row-desc a");
                    var description = descriptionDiv.innerText;
                    var match = description.match(/\d{1,2}\/\d{1,2}([\/\d{4}]*)/);
                    var date = new Date(match[0]);
                    if (date.getFullYear() == 2001) {
                        var year = (new Date()).getFullYear();
                        if (date.getMonth() < 7) {
                            year += 1;
                        }
                        date.setFullYear(year);
                    }
                    list.push(new Product(row, date));
                });
                this.products.push(...list);
                return list;
            },
    
            sortAscending: function () {
                this.products.sort((a, b) => a.date - b.date);
            },
    
            nodeExists: function() {
                // check to see that each node exists
                // use a for loop to make changes - an enumeration will break with removals
                for(var i = 0; i < cartHelper.products.length; i++ ) {
                    if(!document.body.contains(cartHelper.products[i].element)){
                        cartHelper.products.splice(i, 1);
                    }
                }
            },
    
            updateView: function () {
                this.nodeExists();
                this.products.forEach(product => {                
                        this.container.removeChild(product.element);
                        this.container.append(product.element);                                        
                });
            },
    
            returnLink: function () {
                var link = document.createElement("a");
                link.href = document.referrer;
                link.innerText = "Return to Calendar";
                return link;
            },
    
            getDistinctMonths: function (products) {
                this.sortAscending();
                return this.products.reduce((distinctMonths, product) => {
                    const month = new Date(product.date).getMonth();
                    return distinctMonths.includes(month) ? distinctMonths : [...distinctMonths, month];
                }, []);
            },
    
            filterMonth: function () {
                var monthFilter = document.createElement("select");
                monthFilter.id = "filterMonth";
                monthFilter.name = "filterMonth";
                
                monthFilter.addEventListener("change", function () {
                    cartHelper.filterTheCart(this.value);
                });       
                
                return monthFilter;
            },
    
            filterMonthOptions: function() {
                var node = this.nodes.filterMonth;
    
                // clear out and remove existing options
                node.innerHTML = "";
                
                // add in the basic null option
                var option = document.createElement("option");
                option.innerText = "All Months";
                option.value = "all";
                node.appendChild(option);
    
                // create a select option for each month
                this.getDistinctMonths().forEach(month => {
                    var option = document.createElement("option");
                    option.value = month;
                    option.innerText = (new Date(2024, month, 1)).toLocaleString("en-US", { month: "long" });
                    node.append(option);
                });            
            },
    
            cartLinks: function () {
    
                // link holder element
                var linkHolder = document.createElement("div");
                linkHolder.classList.add("cartLinks");
                this.container.parentElement.insertBefore(linkHolder, this.container);
    
                // Add the filter options
                linkHolder.append(this.nodes.filterMonth);
    
                // Add the return link
                linkHolder.append(this.nodes.return);
            },
    
            filterTheCart: function (value) {
                if (value == "all") {
                    // hide all the elements
                    this.products.forEach(product => {
                        product.element.style.display = "flex";
                    });
                } else {           
                    var list = this.products.filter(product => product.date.getMonth() == value);
                
                    // hide all the elements
                    this.products.forEach(product => {
                        product.element.style.display = "none";
                    });
    
                    // display all the selected elements
                    list.forEach(product => {
                        product.element.style.display = "flex";
                    });
                }
            },
    
            reSort: function(originalSize) {
                var testSize = document.querySelectorAll(".cart-container .cart-row").length;
                if( testSize != originalSize ) {
                    cartHelper.sort();
                } 
                else 
                {
                    setTimeout( () => {reSort(originalSize)} , 100); 
                }
            },
    
            clickRemove: function() {
                var buttons = document.querySelectorAll(".cart-row-remove");
                buttons.forEach(button => {
                    button.addEventListener("click", function() {
                        cartHelper.waitForReload(cartHelper.products.length);
                    });
                });
            },
    
            waitForReload: function(startCount){
                if(document.querySelectorAll(".cart-container .cart-row").length != startCount) {
                    console.log("sort the rows");
                    cartHelper.sort();                              
                }
                else {
                    setTimeout(() => { cartHelper.waitForReload(startCount); }, 250);
                }
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
    
        cartHelper.sort();

    } 
})();