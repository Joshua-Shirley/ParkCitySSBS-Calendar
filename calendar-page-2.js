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
            // Trainer
            training: 0,
            // Paid Training
            paidTraining: 0,
        },
        button: {
            on: "On",
            off: "Off",
            full: "Full",
        },
        summary: {
            display: true,
            title: "Summary",

            // Table Header Row
            column0Header: "",
            column1Header: "Your Total",
            column2Header: "Required",
            column3Header: "",

            scheduledDays: "Scheduled Days",
            peakDays: "Peak Days (Red)",
            coreText: "Days in Core Season",
            holiday: "Holiday Requirement",
            thanksgiving: "Thanksgiving Week",
            paidTraining: "Paid Training",

            // Part Time 18 Requirement Labels
            month1: "December",
            month2: "February",
            month3: "March",

            // Trainer 
            trainerDays: "Training Days",

            checkmark: '<svg xmlns="http://www.w3.org/2000/svg" height="18px" width="18px" id="checkMark" viewBox="0 0 17.837 17.837"><g><path style="fill:green;" d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27   c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0   L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"></path></g></svg >',
        },
        tooltip: {
            peak: "Peak",
            trainer: "Trainer",
            scheduled: "Scheduled",
            outOfStock: "No Availability",
            paidTraining: "Paid Training",
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
        // Training
        training: 0,
        // Paid Training
        paidTraining: 0,
        update: function () {
            
            const scheduledList = calendar.data.products.filter(product => product.scheduled == true && product.paidTraining == false);
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
                this.month1 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(calendar.settings.summary.month1) ).length;
                this.month2 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(calendar.settings.summary.month2) ).length;
                this.month3 = scheduledList.filter(product => product.date.getMonth() == monthNames.indexOf(calendar.settings.summary.month3) ).length;
            }
            if (group == "trainer") {
                this.training = scheduledList.filter(product => product.trainer == true && product.title.includes("Trainer")).length;
            }
            this.paidTraining = calendar.data.products.filter(product => product.paidTraining == true).length;
        },
    },
    initiate: function () {
        this.data.collectAll();
        // set the target placeholder
        this.view.containerHolder = this.data.products[0].element.parentElement;
        // builds the summary block
        this.view.statistics2();

        this.view.calendar(this.settings, this.data.products);
        this.view.peakDates(this.data.products);
        this.view.trainerDates(this.data.products);
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
        trainerDates: [],
        paidTraining: [],
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
                var date = parseDate2(element);
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

            products.forEach(product => {
                product.trainer = isTrainerDate(product.element);
            });

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

            function parseDate2(element) {
                var linkElement = element.querySelector("a.product-title");
                var innerText = linkElement.innerText;
                var match = innerText.match(/\d{1,2}\/\d{1,2}([\/\d{4}]*)/);
                if (match != null) {
                    var date = new Date(match[0]);
                    return date;
                }
                return null;
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
                    // go to the product title A link and extract the keyword PEAK
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

            function isTrainerDate(element) {
                try {
                    var excerpt = element.querySelector(".product-title").innerText.toLowerCase();
                    if (excerpt.includes("trainer")) {
                        return true;
                    }
                }
                catch {
                    console.log("Trainer Error: Product Title missing.", element.id);
                }
                return false;
            }

            function isPaidTraining(element) {

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
                                // check for the program name and save it to the data.localProgram property
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

                        // Check the cart for training products
                        if (calendar.data.trainerDates.length == 0) {
                            data.entries.forEach(entry => {
                                if (entry.chosenVariant.sku.includes("-TR")
                                    || entry.chosenVariant.sku.includes("-NH-")
                                    || entry.chosenVariant.sku.includes("-NHB")
                                    || entry.chosenVariant.sku.includes("-NHRe")
                                ) {
                                    var item = new cartItem(entry.id, entry.itemId, entry.chosenVariant.sku);
                                    calendar.data.trainerDates.push(item);
                                }
                            });
                        }

                        calendar.data.trainerDates.forEach(item => {
                            try {
                                var product = calendar.data.products.find(product => product.date.compareDate(item.date));
                                product.trainer = true;
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
                                    localProduct.program = false;
                                    localProduct.scheduled = true;
                                    localProduct.trainer = true;
                                    localProduct.element = fillerDateBlock(item);
                                    calendar.data.products.push(localProduct);
                                }
                            }
                        });

                        // Check for paid training dates
                        if (calendar.data.trainerDates.length == 0) {
                            data.entries.forEach(entry => {
                                if (entry.chosenVariant.sku.includes("-PDT")) {
                                    var item = new cartItem(entry.id, entry.itemId, entry.chosenVariant.sku);
                                    calendar.data.paidTraining.push(item);
                                }
                            })
                        }

                        calendar.data.paidTraining.forEach(item => {
                            try {
                                var product = calendar.data.products.find(product => product.date.compareDate(item.date));
                                product.paidTraining = true;
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
                                    localProduct.program = false;
                                    localProduct.scheduled = true;
                                    localProduct.trainer = false;
                                    localProduct.paidTraining = true;
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
        summaryTable: null,
        summaryTableIds: [],
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
                span.innerHTML += "<br>" + calendar.settings.tooltip.peak;
            }
            if (product.program) {
                span.innerHTML += "<br>" + calendar.data.localProgram;
            }
            if (product.trainer) {
                span.innerHTML += "<br>" + calendar.settings.tooltip.trainer;
            }
            if (product.scheduled) {
                span.innerHTML += "<br>" + calendar.settings.tooltip.scheduled;
            }
            if (!product.inStock) {
                span.innerHTML += "<br>" + calendar.settings.tooltip.outOfStock;
            }
            if (product.paidTraining) {
                span.innerHTML += "<br>" + "Paid Training";
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
        trainerDates: function (products) {
            // filter for all the trainer products
            products.filter(product => product.trainer == true).forEach(product => {
                product.element.classList.add("trainer");
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
        statistics2: function () {
            const group = calendar.settings.group.toLowerCase();
            const summary = calendar.settings.summary;
            const requirements = calendar.settings.requirements;
            let stats = [];
                        
            if (group == "fulltime" || group == "parttime4") {
                stats = [
                    new SummaryTableRow(summary.scheduledDays, "" , "total"),
                    new SummaryTableRow(summary.peakDays, requirements.peakDays, "required"),
                    new SummaryTableRow(summary.coreText, requirements.coreDays, "coreRequirement"),
                    new SummaryTableRow(summary.holiday, requirements.holiday, "holiday"),
                    new SummaryTableRow(summary.thanksgiving, requirements.thanksgiving, "thanks"),
                    // Add paid training to the summary
                    // new SummaryTableRow(summary.paidTraining, requirements.paidTraining, "paidTraining")
                ];
            }
            if (group == "parttime32") {
                stats = [
                    new SummaryTableRow(summary.scheduledDays, requirements.requiredDays, "total"),
                ];
            }
            if (group == "parttime18") {
                stats = [
                    new SummaryTableRow(summary.scheduledDays, requirements.requiredDays, "total"),
                    new SummaryTableRow(summary.peakDays, requirements.peakDays, "required"),
                    new SummaryTableRow(summary.month1, requirements.month1, "month1"),
                    new SummaryTableRow(summary.month2, requirements.month2, "month2"),
                    new SummaryTableRow(summary.month3, requirements.month3, "month3"),
                ];
            }
            if (group == "trainer") {
                stats = [
                    new SummaryTableRow(summary.trainerDays, requirements.training , "training"),
                ];
            }

            this.summaryTableIds = stats;

            // Builder() takes a JSON object and creates a new html object
            function builder(obj) {
                if (!obj.hasOwnProperty("tag")) { return null; }
                var block = document.createElement(obj["tag"]);
                if (obj.hasOwnProperty("class")) {
                    if (Array.isArray(obj["class"])) {
                        block.classList.add(...obj["class"]);
                    } else {
                        block.classList.add(obj["class"]);
                    }
                }
                if (obj.hasOwnProperty("id")) {
                    block.id = obj["id"];
                }
                if (obj.hasOwnProperty("innerText")) {
                    block.innerText = obj["innerText"];
                }
                if (obj.hasOwnProperty("innerHTML")) {
                    if (typeof obj["innerHTML"] === "object") {
                        block.appendChild(builder(obj["innerHTML"]));
                    }
                    else {
                        block.innerHTML = obj["innerHTML"];
                    }
                }
                if (obj.hasOwnProperty("children")) {
                    if (Array.isArray(obj["children"])) {
                        obj["children"].forEach(child => {
                            block.append(builder(child));
                        });
                    }
                    else if (typeof obj["children"] === "object") {
                        block.append(builder(obj["children"]));
                    }
                }
                return block;
            }
            // objectToTable() creates the JSON object needed for builder() to create a stats table
            function objectToTable(obj) {
                var table = { "tag": "table", "id": "summary", "class": "table", "children": [], };
                table.children.push({ "tag": "thead", "children": [] });
                var headerRow = {
                    "tag": "tr", "children": [
                        { "tag": "th", "innerText": calendar.settings.summary.column0Header },
                        { "tag": "th", "innerText": calendar.settings.summary.column1Header },
                        { "tag": "th", "innerText": calendar.settings.summary.column2Header },
                        { "tag": "th", "innerText": calendar.settings.summary.column3Header }
                    ]
                };
                table.children[0].children.push(headerRow);
                table.children.push({ "tag": "tbody", "children": [], });
                obj.forEach(row => {
                    var row = {
                        "tag": "tr", "children": [
                            { "tag": "td", "class": "data-key", "innerText": row.name },
                            { "tag": "td", "class": "data-value", "id": "data-value-" + row.id, "innerText": row.current },
                            { "tag": "td", "class": "data-required", "id": "data-required-" + row.id, "innerText": row.required },
                            { "tag": "td", "class": "data-icon", "innerHTML": "" },
                        ]
                    };
                    table.children[1].children.push(row);
                });
                return table;
            }
            // register an id for each td data-value cell.

            var block = {
                "tag": "div",
                "id": "grid-container-Summary",
                "class": ["grid-container", "grid-summary"],
                "children":
                    [
                        {
                            "tag": "div",
                            "class": ["grid-title", "summary-title"],
                            "children": [
                                {
                                    "tag": "h2",
                                    "innerText": calendar.settings.summary.title,
                                }
                            ],
                        },
                        {
                            "tag": "div",
                            "class": "stats-container",
                            "children": [
                                objectToTable(stats),
                            ]
                        }
                    ]
            }; 

            this.summaryTable = builder(block);

            // register each of the summary stats ids into a table for lookup for the stats update function
            this.summaryTableIds.forEach(row => {
                row.domReference = this.summaryTable.querySelector("#data-value-" + row.id);
            });

            if (calendar.settings.summary.display) {
                this.containerHolder.appendChild(this.summaryTable);
            }
        },
         
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

            // Update the stats in summaryTable
            calendar.view.summaryTableIds.forEach(row => {
                row.domReference.innerText = calendar.stats[row.reference];
                row.domReference.nextSibling.nextSibling.innerHTML = (calendar.stats[row.reference] >= row.required) ? calendar.settings.summary.checkmark : "";
            });
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
    trainer = false;
    paidTraining = false;
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
class SummaryTableRow {
    constructor(name, required, reference ) {
        this.name = name;
        this.current = 0;
        this.required = required;
        this.test = false;
        this.id = (Math.floor(Math.random() * 100000000) + 10000000);

        this.reference = reference;
    }
    domReference = null;
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