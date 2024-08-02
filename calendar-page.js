/*
READ ME - Instructions found at:
https://github.com/Joshua-Shirley/ParkCitySSBS-Calendar/
*/
const calendar = {
    settings: {
        /* Group should be set as one of the following: fulltime, parttime32, parttime18 */
        group: "PartTime4",
        peakDayIndicator: "PT4",
        dates: {
            /* open and close determines what month the calendar starts and ends */
            open: new Date("11/01/2024"), 
            close: new Date("04/21/2025"),
            /* holiday */
            holiday: [new Date(new Date().getFullYear(), 11, 25), new Date(new Date().getFullYear() +1, 0, 1)],

            /* Full Time & Part Time 4 start and finish dates*/
            coreStart: new Date("12/15/2024"),
            coreEnd: new Date("04/05/2025"),

            thanksStart: new Date("11/24/2024"),
            thanksEnd: new Date("11/30/2024"),
            peak: [],
        },
        requirements: {
            peakDays: 0,
            requiredDays: "", // might be able to drop //
            // Core Season Requirement
            coreDays: 80,
            holiday: 1,
            thanksgiving: 5,
            // Part Time 18 requirement
            month1: 0,
            month2: 0,
            month3: 0,
        },
        button: {
            on: "On",
            off: "Off",
            full: "Full",
        },
        summary: {
            // Table Header Row
            column0Header: "",
            column1Header: "Your Total",
            column2Header: "Required",

            scheduledDays: "Scheduled Days",
            peakDays: "Peak Days (Red)",
            coreText: "Days in Core Season",
            holiday: "Holiday Requirement",
            thanksgiving: "Thanksgiving Week",

            // Part Time 18 Requirement Labels
            month1: "December",
            month2: "February",
            month3: "March",
        }
    },
    stats: {
        total: 0,
        required: 0,
        // Used with full time only
        coreRequirement: 0,
        holiday: false,
        thanks: 0,
        // part time stats
        month1: 0,
        month2: 0,
        month3: 0,
        update: function () {
            
            const scheduledList = calendar.data.products.filter(product => product.scheduled == true);
            this.total = scheduledList.length;
            this.required = scheduledList.filter(product => product.peak == true).length;

            const group = calendar.settings.group.toLowerCase();
            if (group == "fulltime" || group == "parttime4") {

                // dates between core start and core finish
                this.coreRequirement = scheduledList.filter(product =>
                    product.date > calendar.settings.dates.coreStart
                    &&
                    product.date < calendar.settings.dates.coreEnd
                ).length;

                // Update the holiday total
                var holidayCount = calendar.data.products.filter(product => product.scheduled == true &&
                    (
                        product.date.compareDate(calendar.settings.dates.holiday[0])
                        ||
                        product.date.compareDate(calendar.settings.dates.holiday[1])
                    )
                ).length;
                if (holidayCount > 0) {
                    this.holiday = true;
                } else {
                    this.holiday = false;
                }

                // Update the thanksgiving total
                this.thanks = scheduledList.filter(product =>
                    product.date >= calendar.settings.dates.thanksStart
                    &&
                    product.date <= calendar.settings.dates.thanksEnd
                ).length;
            }
            if (group == "parttime32") {

            }
            if (group == "parttime18") {

                const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
                this.month1 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(this.settings.summary.month1) ).length;
                this.month2 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(this.settings.summary.month2) ).length;
                this.month3 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(this.settings.summary.month3) ).length;
            }
        }
    },
    initiate: function () {
        this.data.collectAll();
        // set the target placeholder
        this.view.containerHolder = this.data.products[0].element.parentElement;
        // builds the summary block
        this.view.statistics();

        this.view.calendar(this.settings, this.data.products);
        this.view.peakDates(this.data.products);
        this.view.outofStockDates(this.data.products, this.settings.button.full);
        this.view.addClickEvent();
        // execute after short delay to allow cart to load
        setTimeout(function () {
            calendar.view.scheduledDates();
            calendar.control.updateSummary();
        }, 1000);

        // Referrer document link
        const d = new Date();
        d.setTime(d.getTime() + (60 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = "calendar" + "=" + window.location.pathname + ";" + expires + ";path=/;";
    },
    rebuild: function () {

        var months = calendar.view.containerHolder.querySelectorAll(".grid-container:not(.grid-summary");
        months.forEach(m => m.classList.add("destroy"));

        this.view.calendar(this.settings, this.data.products);

        months.forEach(m => m.remove());
    },
    data: {
        products: [],
        scheduled: [],
        localProgram: null,
        programDates: [],
        collectAll: function () {
            this.products = this.collectProducts();
            this.scheduled = this.fetchSchedule();
        },
        collectProducts: function () {
            const elements = document.querySelectorAll(".sqs-block-product");
            // STEP 1
            // get all the products displayed
            const products = [];
            const containerHolder = elements[0].parentElement;

            elements.forEach(function (element) {
                var date = parseDate(element);
                var product = new Product(date, element);
                product.title = productTitle(element);
                product.peak = false;
                product.scheduled = false;
                product.program = false;
                products.push(product);
            });

            // STEP 2
            // sort the products by date ascending
            products.sort((a, b) => a.date - b.date);

            // STEP 3
            // Update each product's HTML 
            products.forEach(function (product) {
                product.inStock = isInStock(product.element);
                product.itemId = getProductId(product.element);
                
            });

            //if (calendar.settings.group.toLowerCase() == "fulltime") {
            products.forEach(product => {
                product.peak = isPeakDate(product.element);
            });
            //}

            function parseDate(element, year) {
                var linkElement = element.querySelector("a");
                var href = linkElement.href;
                var rawDate = href.substring(href.search(/\d{2}-\d{2}/), href.length);
                var dateArray = rawDate.split('-');
                var month = parseInt(dateArray[0]) - 1;
                var day = parseInt(dateArray[1]);
                var year = new Date().getFullYear();
                if (month < 7) {
                    year++;
                }
                var date = new Date(year, month, day);
                return date;
            }

            function isInStock(element) {
                var productMark = element.querySelector(".sold-out");
                if (productMark) {
                    return false;
                }
                return true;
            }

            function productTitle(element) {
                var block = element.querySelector(".product-title");
                if (block) {
                    return block.innerText;
                }
                return null;
            }

            function isPeakDate(element) {
                // Peak dates are found in product titles with the following format = PEAK (FT, PT4, PT18)
                try {
                    var excerpt = element.querySelector(".product-title").innerText.toLowerCase();
                    if (excerpt.includes("peak")) {
                        if (excerpt.includes(calendar.settings.peakDayIndicator.toLowerCase())) {
                            return true;
                        }
                    }
                }
                catch {
                    console.log("PEAK DATE ERROR: Product Title missing.  Display title for all products.", element.id);
                }
                return false;
            }

            function getProductId(element) {
                var productBlock = element.querySelector(".product-block");
                if (productBlock != null) {
                    var attribute = productBlock.getAttribute("data-current-context");
                    return (JSON.parse(attribute));
                }
            }

            return products;
        },
        fetchSchedule: async function () {
            const inCart = new Set();
            
            fetchData(shoppingCartUrl())
                .then(data => {
                    if (data != null) {
                        /* Check retail items for already scheduled */
                        data.entries.forEach(entry => inCart.add(entry.itemId));
                        if (inCart.size > 0) {
                            var update = this.products.filter(product => inCart.has(product.itemId.id));
                            update.forEach(product => {
                                product.scheduled = true;
                            });
                        }
                        /* Check the cart for program products */
                        // get all entries and sort for program products
                        if (calendar.data.programDates.length == 0) {
                            data.entries.forEach(entry => {
                                if (entry.chosenVariant.sku.includes("-PG-")) {
                                    var item = new cartItem(entry.id, entry.itemId, entry.chosenVariant.sku);
                                    calendar.data.programDates.push(item);
                                }
                                if (entry.chosenVariant.sku.toLowerCase().startsWith("program")) {
                                    calendar.data.localProgram = entry.chosenVariant.sku.replace("PROGRAM-", "").replaceAll("-", " ");
                                }
                            });
                        }

                        // ADD ON FOR PROGRAM DATES
                        // find the products that are program products
                        calendar.data.programDates.forEach(item => {
                            try {
                                var product = calendar.data.products.find(product => product.date.compareDate(item.date));
                                product.program = true;
                                product.scheduled = true;

                                // disable the duplicate date from click
                                var button = product.element.querySelector(".sqs-add-to-cart-button");
                                button.removeAttribute("data-item-id");
                                button.removeAttribute("data-collection-id");
                                button.removeAttribute("data-product-type");
                            }
                            catch {
                                if (item.date) {
                                    var localProduct = new Product(item.date, null);
                                    localProduct.inStock = true;
                                    localProduct.itemId = item.itemId;
                                    localProduct.peak = false;
                                    localProduct.program = true;
                                    localProduct.scheduled = true;
                                    localProduct.title = calendar.data.localProgram;
                                    localProduct.element = fillerDateBlock(item);
                                    calendar.data.products.push(localProduct);
                                }
                            }
                        });

                        calendar.rebuild();
                    }
                })
                .catch(error => {
                    console.error("Error processing data:", error);
                });
            function fillerDateBlock(item) {
                var block = calendar.data.products[0].element.cloneNode(true);

                // top level
                block.removeAttribute("id");
                block.setAttribute("datetime", item.date.toISOString());

                // block level
                var productBlock = block.querySelector("div.product-block");
                productBlock.removeAttribute("data-current-context");

                // product title
                var productTitle = block.querySelector(".product-title");
                productTitle.innerText = calendar.data.localProgram + " " + item.date.toLocaleDateString();

                // excerpt (date day)
                var excerpt = block.querySelector("div.product-excerpt");
                excerpt.innerText = item.date.getDate();

                // button
                var button = block.querySelector("div.sqs-add-to-cart-button");
                button.removeAttribute("data-collection-id");
                button.setAttribute("data-item-id", item.itemId);
                button.removeAttribute("id");

                // tooltip
                var tooltip = block.querySelector("span.tooltip");
                tooltip.innerHTML = item.date.toDateString();

                return block;
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
            function shoppingCartUrl() {
                const url = "https://www.parkcityssbs.com/api/commerce/shopping-cart?crumb={crumb}&mock=false&timecode={timecode}&calculateSubtotal=true";
                const crumb = getCookie("crumb");
                const now = new Date();
                return url.replace("{crumb}", crumb).replace("{timecode}", now.valueOf());
            }
            function getCookie(name) {
                const nameEQ = name + "=";
                const ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
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
            return inCart;
        },
    },
    view: {
        // this property directs placement of new elements
        containerHolder: null,
        calendar: function (settings, products) {
            // STEP 1
            // set the container target
            //this.containerHolder = products[0].element.parentElement;
            //const containerHolder = products[0].element.parentElement;

            // STEP 2
            // sort the products by date ascending
            products.sort((a, b) => a.date - b.date);

            // STEP 3
            // Update each product's HTML nodes
            products.forEach(function (product) {
                rewriteProduct(product);
                calendar.view.tooltip(product);
            });

            // STEP 4
            // Find all the months
            //const months = getDistinctMonths(products);
            const months = getOpenMonths(settings.dates.open, settings.dates.close);

            // STEP 5
            // Build a grid container for each month
            // this list should be sorted to make sense for the winter ski seasn 10, 11, 0, 1, 2, 3, 4
            months.forEach(function (month) {
                var filteredProducts = products.filter(function (product) { return product.date.getMonth() == month });

                if (filteredProducts.length > 0) {
                    filteredProducts.sort((a, b) => b.date - a.date);
                    var startDate = filteredProducts[0].date;
                }
                else {
                    var year = settings.dates.open.getFullYear();
                    if (month < 10) {
                        year++;
                    }
                    var startDate = new Date(year, month, 1);
                }

                calendar.view.containerHolder.appendChild(calendar.view.monthBlock(startDate, filteredProducts));
            });

            // FUNCTIONS 
            function getOpenMonths(openDate, closeDate) {
                var set = new Set();
                var cycleDate = openDate;
                while (cycleDate < closeDate) {
                    set.add(cycleDate.getMonth());
                    cycleDate = new Date(cycleDate.getFullYear(), cycleDate.getMonth() + 1, 1);
                }
                return set;
            }

            function rewriteProduct(product) {
                var element = product.element;
                var date = product.date;
                element.querySelector("a").innerText = date.toDateString();
                element.querySelector(".product-excerpt").innerText = date.getDate();
                element.setAttribute("datetime", date.toISOString());
                var clsList = ["grid-item", "grid-date"];
                element.classList.add(...clsList);
                var button = element.querySelector(".sqs-add-to-cart-button-inner");
                button.innerText = settings.button.off;
                button.parentElement.setAttribute("data-original-label", settings.button.on);
            }
            return products;
        },
        tooltip: function (product) {
            var span = document.createElement("span");
            span.classList.add("tooltip");
            span.innerText = product.date.toDateString();
            if (product.peak) {
                span.innerHTML += "<br>" + "Peak";
            }
            if (product.program) {
                span.innerHTML += "<br>" + calendar.data.localProgram;
            }
            if (product.scheduled) {
                span.innerHTML += "<br>" + "Scheduled";
            }
            if (!product.inStock) {
                span.innerHTML += "<br>" + "No Availability";
            }
            product.element.appendChild(span);
        },
        monthBlock: function (startDate, filteredList) {
            const month = startDate.getMonth();
            const year = startDate.getFullYear();
            const dayFirst = new Date(year, month, 1);
            const dayLast = new Date(year, month + 1, 0);
            const daysInMonth = dayLast.getDate();

            // Month Container Div
            const container = buildGrid(dayFirst);
            // Add in the Title
            container.appendChild(monthTitle(dayFirst));
            // Add in the week day headers
            placeHeaderBlock(container, weekDayHeaderBlock());

            // Add in blank empty blocks for calendar to look like a calendar
            // If the first day of the month is Thursday then 4 empty blocks will be added.
            blankDays(container, dayFirst, blankDayBlock());

            // Build a full month of days   
            // create a holding set
            const set = new Set();
            // The filtered list is a list of products in sorted order for the given month.
            var queue = filteredList.filter(obj => obj.date.getMonth() == month);
            var nextDate = queue.pop();

            // This is the core monthly calendar builder
            // it iterates through the month and determines if a product should be inserted
            for (var day = 1; day <= daysInMonth; day++) {
                // 
                if (nextDate === undefined) {
                    var date = new Date(year, month, day);
                    var filler = fillerDateBlock(date);
                    var product = new Product(date, filler);
                    set.add(product);
                }
                else if (nextDate.date.getDate() == day) {
                    set.add(nextDate);
                    nextDate = queue.pop();
                }
                else {
                    var date = new Date(year, month, day);
                    var filler = fillerDateBlock(date);
                    var product = new Product(date, filler);
                    set.add(product);
                }
            }

            // move the set into the container / calendar
            set.forEach(s => {
                container.appendChild(s.element);
            });

            function fillerDateBlock(date) {
                const block = document.createElement("div");
                block.Id = "block-yui-" + date.toISOString;
                block.classList.add(...["sqs-block", "product-block", "sqs-block-product", "grid-item", "grid-date", "filler-date"]);
                const sqsBlock = document.createElement("div");
                sqsBlock.classList.add("sqs-block-content");
                block.append(sqsBlock);
                const productBlock = document.createElement("div");
                productBlock.classList.add(...["product-block", "clear"]);
                sqsBlock.append(productBlock);
                const productDetails = document.createElement("div");
                productDetails.classList.add("productDetails");
                productBlock.append(productDetails);
                const link = document.createElement("a");
                link.href = "";
                link.classList.add("product-title");
                link.innerText = date.toDateString();
                productDetails.append(link);
                const productExcerpt = document.createElement("div");
                productExcerpt.classList.add("product-excerpt");
                productExcerpt.innerText = date.getDate();
                productDetails.append(productExcerpt);
                return block;
            }

            function buildGrid(date) {
                var grid = document.createElement("div");
                grid.id = "grid-container" + "-" + date.toLocaleDateString('default', { month: 'long' });
                grid.classList.add("grid-container");
                return grid;
            }

            function monthTitle(date) {
                var head = document.createElement("div");
                var clsList = ["month-title", "grid-item", "grid-title"];
                head.classList.add(...clsList);
                var title = document.createElement("h2");
                title.innerText = date.toLocaleDateString('default', { month: 'long' }) + ' ' + date.getFullYear();
                head.append(title);
                return head;
            }

            function weekDayHeaderBlock() {
                var block = document.createElement("div");
                var clsList = ["sqs-block", "product-block", "sqs-block-product", "grid-item", "grid-header"];
                block.classList.add(...clsList);
                var spanAbbreviation = document.createElement("span");
                spanAbbreviation.classList.add("abbreviated");
                var spanFull = document.createElement("span");
                spanFull.classList.add("full");
                block.append(spanAbbreviation);
                block.append(spanFull);
                return block;
            }

            function placeHeaderBlock(targetElement, block) {
                const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                for (var i = 0; i < weekdays.length; i++) {
                    var weekday = weekdays[i].toUpperCase();
                    block.querySelector("span.abbreviated").innerText = weekday.substring(0, 3);
                    block.querySelector("span.full").innerText = weekday.substring(3, weekday.length);
                    targetElement.appendChild(block.cloneNode(true));
                }
            }

            function blankDayBlock() {
                var block = document.createElement("div");
                var clsList = ["sqs-block", "product-block", "sqs-block-product", "grid-item", "blank-day"];
                block.classList.add(...clsList);
                return block;
            }

            function blankDays(targetElement, date, block) {
                if (date.getDay() > 0) {
                    for (var i = 0; i < date.getDay(); i++) {
                        block.setAttribute("datetime", date.toISOString());
                        var clone = block.cloneNode(true);
                        targetElement.appendChild(clone);
                    }
                }
            }
            return container;
        },
        peakDates: function (products) {         
            // match the peak products and then add .peak to the class list
            products.filter(product => product.peak == true).forEach(product => {
                product.element.classList.add("peak");
            });
        },
        scheduledDates: function () {
            // because the schedule list changes often 
            // clear all the .scheduled first
            calendar.data.products.forEach(product => {
                // only in stock products
                if (product.element) {
                    if (product.inStock) {
                        product.element.classList.remove("scheduled");
                        var button = product.element.querySelector(".sqs-add-to-cart-button-inner");
                        if (button != null) {
                            button.innerText = calendar.settings.button.off;
                        }
                    }
                }
            });
            // find the current scheduled items and update
            calendar.data.products.filter(product => product.scheduled == true).forEach(product => {
                if (product.element) {
                    product.element.classList.add("scheduled");

                    // update the button text
                    var button = product.element.querySelector(".sqs-add-to-cart-button-inner");
                    if (button != null) {
                        button.innerText = calendar.settings.button.on;
                    }

                    // update the tooltip text so that it includes the program name
                    if (product.program) {
                        var tooltipElement = product.element.querySelector("span.tooltip");
                        if (tooltipElement) {
                            if (!tooltipElement.innerHTML.includes(calendar.data.localProgram)) {
                                tooltipElement.innerHTML += "<br>" + calendar.data.localProgram;
                            }
                        }
                    }
                }
            });
        },
        outofStockDates: function (products, buttonText) {
            products.filter(product => product.inStock == false).forEach(product => {
                product.element.classList.add("outOfStock");
                var button = product.element.querySelector(".sqs-add-to-cart-button-inner");
                if (button != null) {
                    button.innerText = buttonText;
                    button.parentElement.setAttribute("data-original-label", buttonText);
                }
            });
        },
        programDates: function () {
            products.filter(product => product.program == true).forEach(product => {
                product.element.classList.add("local-program");
            });
        },

        addClickEvent: function () {
            calendar.data.products.forEach(product => {
                var button = product.element.querySelector(".sqs-add-to-cart-button");
                button.addEventListener("click", function () { calendar.control.addToSchedule(this) });
            });
        },
        statistics: function () {
            const group = calendar.settings.group.toLowerCase();
            var summary = htmlElement("div", ["grid-container", "grid-summary"], "grid-container-Summary");
            summary.appendChild(title());

            var container = htmlElement("div", "stats-container");
            summary.appendChild(container);

            var table = table("table", "summary");

            // header row
            var row0 = row();
            row0.appendChild(cell(calendar.settings.summary.column0Header, "data-head"));
            row0.appendChild(cell(calendar.settings.summary.column1Header, "data-head"));
            row0.appendChild(cell(calendar.settings.summary.column2Header, "data-head"));
            table.appendChild(row0);

            // Scheduled Days
            var row1 = row();
            row1.appendChild(cell(calendar.settings.summary.scheduledDays, "data-key"));
            row1.appendChild(cell("0", "data-value", "scheduledTotal"));
            row1.appendChild(cell(calendar.settings.requirements.requiredDays, "data-key-requirement"));
            table.appendChild(row1);

            // Peak Days
            if (group != "parttime32") {
                var row2 = row();
                row2.appendChild(cell(calendar.settings.summary.peakDays, "data-key"));
                row2.appendChild(cell("0", "data-value", "scheduledTotalPeak"));
                row2.appendChild(cell(calendar.settings.requirements.peakDays, "data-key-requirement"));
                table.appendChild(row2);
            }
            

            if (group == "fulltime" || group == "parttime4") {
                // Days in core season
                var row3 = row();
                row3.appendChild(cell(calendar.settings.summary.coreText, "data-key"));
                row3.appendChild(cell("0", "data-value", "coreRequirement"));
                row3.appendChild(cell(calendar.settings.requirements.coreDays, "data-key-requirement"));
                table.appendChild(row3);

                // Holiday requirement
                var row4 = row();
                row4.appendChild(cell(calendar.settings.summary.holiday, "data-key"));
                row4.appendChild(cell("0", "data-value", "holidayRequirement"));
                row4.appendChild(cell(calendar.settings.requirements.holiday, "data-key-requirement"));
                table.appendChild(row4);

                // Thanksgiving Week
                var row9 = row();
                row9.appendChild(cell(calendar.settings.summary.thanksgiving, "data-key"));
                row9.appendChild(cell("0", "data-value", "thanksRequirement"));
                row9.appendChild(cell(calendar.settings.requirements.thanksgiving, "data-key-requirement"));
                table.appendChild(row9);
            }

            if (group == "parttime18") {
                // Month 1
                var row5 = row();
                row5.appendChild(cell(calendar.settings.summary.month1, "data-key"));
                row5.appendChild(cell("0", "data-value", "month1"));
                row5.appendChild(cell(calendar.settings.requirements.month1, "data-key-requirement"));
                table.appendChild(row5);
                // Month 2
                var row6 = row();
                row6.appendChild(cell(calendar.settings.summary.month2, "data-key"));
                row6.appendChild(cell("0", "data-value", "month2"));
                row6.appendChild(cell(calendar.settings.requirements.month2, "data-key-requirement"));
                table.appendChild(row6);
                // Month 3
                var row7 = row();
                row7.appendChild(cell(calendar.settings.summary.month3, "data-key"));
                row7.appendChild(cell("0", "data-value", "month3"));
                row7.appendChild(cell(calendar.settings.requirements.month3, "data-key-requirement"));
                table.appendChild(row7);
            }

            container.appendChild(table);

            function title() {
                var head = htmlElement("div", ["grid-title", "summary-title"]);
                var title = htmlElement("h2");
                title.innerText = "Summary";
                head.append(title);
                return head;
            }

            function table(cls, id) {
                var element = htmlElement("table", cls, id);
                return element;
            }

            function row(cls) {
                var element = htmlElement("tr", cls);
                return element;
            }

            function cell(text, cls, id) {
                var element = htmlElement("td", cls, id);
                element.innerText = text;
                return element;
            }

            function htmlElement(type, cls, id) {
                var element = document.createElement(type);
                if (id != null) {
                    element.id = id;
                }
                if (cls != null) {
                    if (typeof cls == "string") {
                        element.classList.add(cls);
                    }
                    if (cls instanceof Array) {
                        element.classList.add(...cls);
                    }
                }
                return element;
            }
            this.containerHolder.appendChild(summary);
        }
    },
    control: {
        addToSchedule: function (element) {
            // update the product object schedule 
            var code = element.getAttribute("data-item-id").trim();
            var match = calendar.data.products.filter(product => product.itemId.id == code);
            match.forEach(m => {
                m.scheduled = true;
            });

            // run the view to add the class object and button text
            calendar.view.scheduledDates();

            // update the stats
            calendar.stats.update();

            // update the stats view
            calendar.control.updateSummary();
        },
        updateSummary: function () {
            const group = calendar.settings.group.toLowerCase();
            calendar.stats.update();
            document.getElementById("scheduledTotal").innerText = calendar.stats.total;
            if (group != "parttime32") {
                document.getElementById("scheduledTotalPeak").innerText = calendar.stats.required;
            }
            if (group == "fulltime" || group == "parttime4") {
                document.getElementById("coreRequirement").innerText = calendar.stats.coreRequirement;
                document.getElementById("holidayRequirement").innerText = calendar.stats.holiday ? "Yes" : "No";
                document.getElementById("thanksRequirement").innerText = calendar.stats.thanks;
            }
            if (group == "parttime18") {
                document.getElementById("month1").innerText = calendar.stats.month1;
                document.getElementById("month2").innerText = calendar.stats.month2;
                document.getElementById("month3").innerText = calendar.stats.month3;
            }
        }
    }
};

class Product {
    constructor(date, element) {
        this.date = new Date(date);
        this.element = element;
    }
    itemId = 0;
    title = null;
    inStock = true;
    peak = false;
    scheduled = false;
    program = false;
}
/*
cartItem used for collecting cart entries
*/
class cartItem {
    constructor(cartRowId, itemId, sku) {
        this.cartRowId = cartRowId;
        this.itemId = itemId;
        this.sku = sku;

        var match = sku.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) { this.date = new Date(match[0]).addDays(1); }
        else { this.date = null; }
    }
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