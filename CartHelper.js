(() => { 
    if(window.location.href.endsWith("/cart")) 
    { 
        
    let cartHelper = {
        products: [],
        container: document.querySelector(".cart-container"),
        elements: document.querySelectorAll(".cart-container .cart-row"),
        
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

        updateView: function () {
            this.products.forEach(product => {
                this.container.removeChild(product.element);
                this.container.append(product.element);
            });
        },

        sort: function () {
            this.container = document.querySelector(".cart-container");
            this.elements = this.container.querySelectorAll(".cart-row");
            this.products.splice(0,this.products.length);
            this.fillProducts();
            this.sortAscending();
            this.updateView();
            this.getDistinctMonths();
            return this.products;
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

            var option = document.createElement("option");
            option.innerText = "All Months";
            option.value = "all";
            monthFilter.appendChild(option);

            this.getDistinctMonths().forEach(month => {
                var option = document.createElement("option");
                option.value = month;
                option.innerText = (new Date(2024, month, 1)).toLocaleString("en-US", { month: "long" });
                monthFilter.append(option);
            });

            monthFilter.addEventListener("change", function () {
                cartHelper.filterTheCart(this.value);
            });

            return monthFilter;
        },

        returnLink: function () {
            var link = document.createElement("a");
            link.href = document.referrer;
            link.innerText = "Return to Calendar";
            return link;
        },

        cartLinks: function () {

            // link holder element
            var linkHolder = document.createElement("div");
            linkHolder.classList.add("cartLinks");
            this.container.parentElement.insertBefore(linkHolder, this.container);

            // Add the filter options
            linkHolder.append(this.filterMonth());

            // Add the return link
            linkHolder.append(this.returnLink());
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
                    cartHelper.reSort(cartHelper.products.length);
                });
            });
        }
    }

    function waitForLoad(selector, callback) {
        let element = document.querySelector(selector);
        if(element) {
            callback(element);
        }
        else {
            setTimeout(() => { waitForLoad(selector, callback); }, 500);
        }
    } 
    
    var cartProducts = null;
    waitForLoad(".cart-container", (element) => {            
        cartProducts = cartHelper.sort();       
        cartHelper.cartLinks();
    });               
    
    } 
})();
