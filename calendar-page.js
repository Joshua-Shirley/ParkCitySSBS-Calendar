/*
    Change the settings properties to get the 
    enter dates using the MM/DD/YYYY format IE: "11/25/2024" inside a new Date() function like - new Date("11/25/2024")

    STEP 1: - CALENDAR GROUP TYPE
    group: "fulltime", "parttime32", "parttime18"  - choose one

    STEP 2: - CALENDAR START & FINISH
    Open and close dates to start and end the calendar

    STEP 3: - HOLIDAYS
    Update the holidays required
    
    STEP 4: - REQUIREMENTS
    enter data using an integer (no decimals) followed by a comma
    - peak days : 6, 32, 40,
    - required days : 18, 32, 80
    // FULLTIME STAFF
    - daysAfterStart
    - holiday 

    STEP 5: - Button Text
    Text should be simple and short (less than 10 characters).
    Surronded by quotations.  "WORKING", "WORK", "TWERK", etc.

    STEP 6: - SUMMARY TABLE TEXT

*/
const calendar = {
    settings : {
        /* Group should be set as one of the following: fulltime, parttime32, parttime18 */
        group : "fulltime",
        dates : {
            /* open and close determines what month the calendar starts and ends */
            open : new Date("11/01/2024"),
            close : new Date("04/21/2025"),
            holiday: [new Date("12/25/2024"), new Date("01/01/2025")],
            fullTimeStart: new Date("12/15/2024"),
            peak : [], /* new Date("YEAR-MO-DT") , new Date("2024-12-01") */                        
        },
        requirements : {
            peakDays: 40,
            requiredDays: 80,
            daysAfterDec15: 80,
            holiday: 1,
        },
        button : {
            on : "On",
            off: "Off",
            full: "Full",
        },
        summary: {
            scheduledDays : "Scheduled Days",
            peakDays : "Peak Days",
            officalStart : "Days After Offical Start",
            holiday: "Holiday Requirement", 
            column1Header : "Your Total",
            column2Header : "Required",
        }
    },   
    stats : {
        total: 0,
        required: 0,
        // Used with full time only
        daysAfterDec15: 0,
        holiday: false,
        update: function() {
            this.total = calendar.data.products.filter(product => product.scheduled == true).length;
            this.required = calendar.data.products.filter(product => product.scheduled == true && product.peak == true ).length;
            if(calendar.settings.group.toLowerCase() == "fulltime")
                {
                this.daysAfterDec15 = calendar.data.products.filter(product => product.scheduled == true && product.date > calendar.settings.dates.fullTimeStart ).length;
                var holidayCount = calendar.data.products.filter(product => product.scheduled == true && 
                    ( 
                        product.date.compareDate(calendar.settings.dates.holiday[0]) 
                        || 
                        product.date.compareDate(calendar.settings.dates.holiday[1])                 
                    )
                ).length;
                if( holidayCount > 0 ){
                    this.holiday = true;
                } else {
                    this.holiday = false;
                }
            }
        }
    },
    initiate : function() {     
        this.data.collectAll();  
        // set the target placeholder
        this.view.containerHolder = this.data.products[0].element.parentElement;
        this.view.statistics();
        this.view.calendar(this.settings, this.data.products);
        this.view.peakDates(this.data.products);
        this.view.outofStockDates(this.data.products, this.settings.button.full);
        this.view.addClickEvent();
        // execute after short delay to allow cart to load
        setTimeout( function() { 
            calendar.view.scheduledDates(); 
            calendar.control.updateSummary();
        }, 500);        
    },
    data : {
        products : [],
        scheduled : [],
        collectAll : function() {
            this.products = this.collectProducts();            
            this.scheduled = this.fetchSchedule();
            this.peakDates();            
        },
        collectProducts : function() {
            const elements = document.querySelectorAll(".sqs-block-product");
                // STEP 1
            // get all the products displayed
            const products = [];
            const containerHolder = elements[0].parentElement;
        
            elements.forEach(function (element) {
                var date = parseDate(element);
                var product = new Product(date, element);
                product.peak = false;
                product.scheduled = false;
                products.push(product);
            });
        
            // STEP 2
            // sort the products by date ascending
            products.sort((a, b) => a.date - b.date);
        
            // STEP 3
            // Update each product's HTML 
            products.forEach(function (product) {
                product.inStock = isInStock(product.element);                
                if(calendar.settings.group.toLowerCase() == "parttime32"){
                    product.peak = true;
                } else {
                product.peak = false;
                }
                product.itemId = getProductId(product.element);        
            });

            if(calendar.settings.group.toLowerCase() == "fulltime") {
                products.forEach(product => {
                    product.peak = isPeakDate(product.element);
                });
            }
        
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
                if(productMark){
                      return false;
                }
                return true;      
            }
        
            function isPeakDate(element) {
                // use built in "Peak" list 
                var excerpt = element.querySelector(".product-title");
                if(excerpt) {
                    return excerpt.innerText.toLowerCase().includes("peak");
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

            if(calendar.settings.group.toLowerCase() == "parttime18") {
                products.forEach(product => product.peak = false);
                products.filter(product => calendar.settings.dates.peak.some( peakDate => peakDate.compareDate(product.date))).forEach(
                    product => {
                        product.peak = true;
                    }
                )
            }
        
            return products;
        },
        fetchSchedule : async function() {        
            const inCart = new Set();
            fetchData('https://www.parkcityssbs.com/api/commerce/shopping-cart')
                .then(data => {
                    if (data != null) {
                        data.entries.forEach(entry => inCart.add(entry.itemId));
                        if (inCart.size > 0) {                      
                            var update = this.products.filter(product => inCart.has(product.itemId.id));
                            update.forEach(product => {
                                product.scheduled = true;
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error processing data:', error);
                });
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
            return inCart;       
        },
        peakDates : function() {
            var peakDates = [];                       
            calendar.settings.dates.peak.forEach( dt => { peakDates.push(new Date(dt));});
            var peak = this.products.filter(product => peakDates.some(peakDate => peakDate.compareDate(product.date)));
            if( peak != undefined) {
                peak.forEach(day => { day.peak = true; });
            }
        }
    },
    view : {
        // this property directs placement of new elements
        containerHolder : null,
        calendar : function(settings, products) {    
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
                tooltip(product);       
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
                
                if( filteredProducts.length > 0) {
                    filteredProducts.sort((a, b) => b.date - a.date);
                    var startDate = filteredProducts[0].date;
                }
                else {
                    var year = settings.dates.open.getFullYear();
                    if(month < 10) {
                        year++;
                    }
                    var startDate = new Date(year,month, 1);
                }             
                  
                calendar.view.containerHolder.appendChild(calendar.view.monthBlock(startDate, filteredProducts));
            });
        
            // FUNCTIONS 
            function getOpenMonths(openDate, closeDate){
                var set = new Set();
                var cycleDate = openDate;
                while( cycleDate < closeDate) {
                    set.add(cycleDate.getMonth());
                    cycleDate = new Date( cycleDate.getFullYear(), cycleDate.getMonth() + 1, 1);
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

            function tooltip(product) {
                var span = document.createElement("span");
                span.classList.add("tooltip");
                span.innerText = product.date.toDateString();
                if(product.peak) {                    
                    span.innerHTML = product.date.toDateString() + "<br>" + "Peak";
                }
                if(!product.inStock){
                    span.innerHTML += "<br>" + "No Availability";
                }
                product.element.appendChild(span);
            }

            return products;
        },
        monthBlock : function(startDate, filteredList) {
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
        
            // Add in blank days for calendar to look like a calendar
            blankDays(container, dayFirst, blankDayBlock());
        
            // Build a full month of days   
                // create a holding set
            const set = new Set();       
        
            var queue = filteredList.filter(obj => obj.date.getMonth() == month);
            var nextDate = queue.pop();
        
            for(var day = 1; day <= daysInMonth; day++) {
                if(nextDate === undefined ){
                    var date = new Date(year, month, day);
                    var filler = fillerDateBlock(date);
                    var product = new Product(date, filler);
                    set.add(product);
                }
                else if( nextDate.date.getDate() == day) {
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
                block.classList.add(...["sqs-block","product-block","sqs-block-product","grid-item","grid-date","filler-date"]);
                const sqsBlock = document.createElement("div");
                sqsBlock.classList.add("sqs-block-content");
                block.append(sqsBlock);
                const productBlock = document.createElement("div");
                productBlock.classList.add(...["product-block","clear"]);
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
        peakDates : function(products) {            
            //products.forEach(product => product.element.classList.remove("peak"));

            // match the peak products and then add .peak to the class list
            products.filter(product => product.peak == true).forEach(product => {    
                product.element.classList.add("peak");        
            });
        },
        scheduledDates : function() {            
            // because the schedule list changes often 
            // clear all the .scheduled first
            calendar.data.products.forEach(product => {
                // only in stock products
                if(product.inStock) {
                    product.element.classList.remove("scheduled");
                    var button = product.element.querySelector(".sqs-add-to-cart-button-inner");                                   
                    if (button != null) {
                        button.innerText = calendar.settings.button.off;
                    }
                }
            });
            // find the current scheduled items and update
            calendar.data.products.filter(product => product.scheduled == true).forEach(product => 
            { 
                product.element.classList.add("scheduled"); 
                var button = product.element.querySelector(".sqs-add-to-cart-button-inner");
                if (button != null) {
                    button.innerText = calendar.settings.button.on;
                }
            });
        },
        outofStockDates : function(products, buttonText) {
            products.filter(product => product.inStock == false).forEach(product => {
                product.element.classList.add("outOfStock");
                var button = product.element.querySelector(".sqs-add-to-cart-button-inner");
                if(button != null) {
                    button.innerText = buttonText;
                    button.parentElement.setAttribute("data-original-label", buttonText);
                }        
            });
        },
        addClickEvent : function() {
            calendar.data.products.forEach(product => {
                var button = product.element.querySelector(".sqs-add-to-cart-button");
                button.addEventListener("click", function() { calendar.control.addToSchedule(this) });
            });
        },
        statistics : function() {            
            var summary = htmlElement("div",["grid-container","grid-summary"], "grid-container-Summary"); 
            summary.appendChild(title());
           
            var container = htmlElement("div","stats-container");
            summary.appendChild(container);

            var table = table("table","summary");
            
            // header row
            var row0 = row();
            row0.appendChild(cell("", "data-head"));
            row0.appendChild(cell(calendar.settings.summary.column1Header, "data-head"));
            row0.appendChild(cell(calendar.settings.summary.column2Header, "data-head"));
            table.appendChild(row0);

            var row1 = row();
            row1.appendChild(cell(calendar.settings.summary.scheduledDays, "data-key"));
            row1.appendChild(cell("0", "data-value", "scheduledTotal"));
            row1.appendChild(cell( calendar.settings.requirements.requiredDays, "data-key-requirement"));
            table.appendChild(row1);

            var row2 = row();
            row2.appendChild(cell(calendar.settings.summary.peakDays, "data-key"));
            row2.appendChild(cell("0", "data-value", "scheduledTotalPeak"));
            row2.appendChild(cell( calendar.settings.requirements.peakDays, "data-key-requirement"));
            table.appendChild(row2);

            if(calendar.settings.group.toLowerCase() == "fulltime"){
                // Days after start
                var row3 = row();
                row3.appendChild(cell(calendar.settings.summary.officalStart,"data-key"));
                row3.appendChild(cell("0", "data-value", "daysAfterStart"));
                row3.appendChild(cell(calendar.settings.requirements.daysAfterDec15, "data-key-requirement"));
                table.appendChild(row3);

                // Holiday requirement
                var row4 = row();
                row4.appendChild(cell(calendar.settings.summary.holiday, "data-key"));
                row4.appendChild(cell("0", "data-value", "holidayRequirement"));
                row4.appendChild(cell(calendar.settings.requirements.holiday , "data-key-requirement"));
                table.appendChild(row4);
            }

            container.appendChild(table);
                        
            function title() {
                var head = htmlElement("div", ["grid-title","summary-title"]);
                var title = htmlElement("h2");
                title.innerText = "Summary";
                head.append(title);
                return head;
            }

            function table(cls, id) {
                var element = htmlElement("table",cls,id);                
                return element;
            }

            function row(cls) {
                var element = htmlElement("tr",cls);                
                return element;
            }

            function cell(text, cls, id) {
                var element = htmlElement("td",cls,id);
                element.innerText = text;
                return element;
            }

            function htmlElement(type, cls, id){
                var element = document.createElement(type);
                if(id != null) {
                    element.id = id;
                }
                if(cls != null) {
                    if( typeof cls == "string"){
                        element.classList.add(cls);
                    }
                    if( cls instanceof Array){
                        element.classList.add(...cls);
                    }
                }                
                return element;
            }
            this.containerHolder.appendChild(summary);           
        }
    },
    control : {
        addToSchedule : function(element) {
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
        updateSummary: function() {
            calendar.stats.update();
            document.getElementById("scheduledTotal").innerText = calendar.stats.total;
            document.getElementById("scheduledTotalPeak").innerText = calendar.stats.required;
            document.getElementById("daysAfterStart").innerText = calendar.stats.daysAfterDec15;
            document.getElementById("holidayRequirement").innerText = calendar.stats.holiday;
        }
    }
};

class Product {
    constructor(date, element) {
        this.date = new Date(date);
        this.element = element;
    }    
    itemId = 0;
    inStock = true;
    peak = false;
    scheduled = false;
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

calendar.initiate();
