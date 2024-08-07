(() => {
    if (window.location.href.endsWith("/cart")) {

        let cartHelper = {
            products: [],
            container: "",
            elements: [],
            nodes: {
                container: "",
                return: "",
                filterMonth: "",
                reset: "",
            },
            referrer: null,
            initiated: false,
            linksLoaded: false,
            init: function () {
                // call it once
                if (this.initiated == false) {
                    // locate the contain element
                    this.container = document.querySelector(".cart-container");
                    // get all the elements
                    this.elements = cartHelper.container.querySelectorAll(".cart-row");

                    // fetches all the cart rows and converts the elements in a Product class list
                    this.fillProducts();

                    // links & filters
                    this.nodes.return = this.returnLink();
                    this.nodes.filterMonth = this.filterMonth();
                    this.nodes.reset = this.resetOption();
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
                    if (match != null) {
                        var date = new Date(match[0]);
                        if (date.getFullYear() == 2001) {
                            var year = (new Date()).getFullYear();
                            if (date.getMonth() < 7) {
                                year += 1;
                            }
                            date.setFullYear(year);
                        }
                        list.push(new Product(row, date));
                    } else {
                        list.push(new Product(row, new Date(2024, 10, 1)));
                    }
                });
                this.products.push(...list);
                return list;
            },

            sortAscending: function () {
                this.products.sort((a, b) => a.date - b.date);
            },

            nodeExists: function () {
                // check to see that each node exists
                // use a for loop to make changes - an enumeration will break with removals
                for (var i = 0; i < cartHelper.products.length; i++) {
                    if (!document.body.contains(cartHelper.products[i].element)) {
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

            referrerLink: function () {

                if (this.referrer != null) {
                    return this.referrer;
                }
                else if (getCookie("calendar") != null) {
                    this.referrer = getCookie("calendar");
                }
                else {
                    const url = new URL(document.referrer);
                    setCookie("calendar", url.pathname, 60);
                    this.referrer = url.pathname;
                }
                return this.referrer;

                function getCookie(cname) {
                    let name = cname + "=";
                    let decodedCookie = decodeURIComponent(document.cookie);
                    let ca = decodedCookie.split(';');
                    for (let i = 0; i < ca.length; i++) {
                        let c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) == 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return null;
                }
                function setCookie(cname, cvalue, exdays) {
                    const d = new Date();
                    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                    let expires = "expires=" + d.toUTCString();
                    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
                }
            },

            returnLink: function () {
                var link = document.createElement("a");
                link.href = this.referrerLink();
                link.innerText = "Return to Calendar";
                return link;
            },

            resetOption: function () {
                var button = document.createElement("a");
                button.href = "/cart";
                button.innerText = "Reset Cart";
                button.addEventListener("click", cartHelper.resetCart);
                return button;
            },

            resetCart: function (event) {
                event.preventDefault();
                if (window.confirm("Do you want to erase this schedule and start fresh?")) {
                    if (window.confirm("Remove all your dates?")) {
                        const d = new Date(1970, 0, 1);
                        let expires = "expires=" + d.toUTCString();
                        document.cookie = "CART" + "=" + "_" + ";" + expires + ";path=/";
                        location.reload();
                        return true;
                    }
                }
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

            filterMonthOptions: function () {
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

                // Reset button
                //linkHolder.append(this.nodes.reset);
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

            clickRemove: function () {
                var buttons = document.querySelectorAll(".cart-row-remove");
                buttons.forEach(button => {
                    button.addEventListener("click", function () {
                        cartHelper.waitForReload(cartHelper.products.length);
                    });
                });
            },

            waitForReload: function (startCount) {
                if (document.querySelectorAll(".cart-container .cart-row").length != startCount) {
                    console.log("sort the rows");
                    cartHelper.sort();
                }
                else {
                    setTimeout(() => { cartHelper.waitForReload(startCount); }, 250);
                }
            },
        }

        Date.prototype.compareDate = function (dateB) {
            if (this.getFullYear() == dateB.getFullYear()) {
                if (this.getMonth() == dateB.getMonth()) {
                    if (this.getDate() == dateB.getDate()) {
                        return true;
                    }
                }
            }
            return false;
        };

        /* WORK AROUNDS 
        
        the script needs to execute after the page completes loading.
        this keeps checking for the container every 1/2 second before executing
        */
        function waitForPageLoad(selector, callback) {
            let element = document.querySelector(selector);
            if (element) {
                callback(element);
            }
            else {
                setTimeout(() => { waitForPageLoad(selector, callback); }, 500);
            }
        }

        waitForPageLoad(".cart-container", (element) => {
            cartHelper.sort();
        });

    }
})();