// Version 3.0.1
// Josh Shirley 8-14-2025

let bundle = {
    modal: null,
    initiate: function (jsonBundle) {
        this.data.bundled = jsonBundle;
        this.modal = this.view.modal();        
        document.body.append(this.modal);
        this.control.modalButtons();

        this.data.productElements = document.querySelectorAll(".sqs-block-product");

        this.api.setURL();

        this.control.addProductClick();
    },
    data: {
        productElements: null,
        bundled: null,
    },
    view: {
        body: "",
        activeUnorderedList: "",
        modal: function () {
            return bundle.general.builder(bundle.general.modalJSON);
        },
        openMessage: function (obj) {
            bundle.view.body = bundle.modal.querySelector(".modal-body");
            // clear out the elements
            bundle.view.body.innerHTML = "";

            // add a list header
            var json = { tag: "p", innerText: obj.name };
            var p = bundle.general.builder(json);
            bundle.view.body.append(p);

            // add a new ul 
            var ulJson = { tag: "ul", id: "product-list", };
            var ul = bundle.general.builder(ulJson);
            bundle.view.activeUnorderedList = ul;
            bundle.view.body.append(ul);

            // freeze the close buttons
            var buttons = bundle.modal.querySelectorAll(".btn-close");
            buttons.forEach(btn => {
                btn.disabled = true;
            });
        },
        addMessage: function (newlyAdded) {
            var liJson = {
                tag: "li",
                innerText: newlyAdded.title
            };
            var lineItem = bundle.general.builder(liJson);
            bundle.view.body.append(lineItem);
        },

        closeMessage: function () {
            var json = { tag: "p", innerText: "Operation Complete" };
            var p = bundle.general.builder(json);
            bundle.view.body.append(p);

            // unfreeze the close buttons
            var buttons = bundle.modal.querySelectorAll(".btn-close");
            buttons.forEach(btn => {
                btn.disabled = false;
            });
        }
    },
    control: {
        modalButtons: function () {
            var buttons = bundle.modal.querySelectorAll(".btn-close");
            buttons.forEach(btn => {
                btn.addEventListener("click", function () { bundle.control.close(); });
            });
        },
        open: function () {
            bundle.modal.style.display = "block";
        },
        close: function () {
            bundle.modal.style.display = "none";
        },
        addProductClick: function () {
            // this adds an event to each of the "Add to Cart" page buttons.
            bundle.data.productElements.forEach(element => {
                // find the product json attributes
                //var rawData = element.querySelectorAll("div")[1].getAttribute("data-current-context");
                var rawData = element.getAttribute("data-product");                
                if (rawData) {
                    var json = JSON.parse(rawData);                    
                    var button = element.querySelector(".sqs-add-to-cart-button");
                    button.addEventListener("click", function (e) { bundle.control.addBundle(json.id, e.target) });
                }
            });
        },
        addBundle: function (itemId, element) {
            element.parentElement.setAttribute("data-original-label", "Scheduled");
            element.innerText = "Scheduled";
            element.style.backgroundColor = "green";

            var parent = bundle.data.bundled.find(p => p.parentId == itemId);
            if (parent) {
                this.open();
                bundle.view.openMessage(parent);
                bundle.api.addToCart(parent.products); 
            }
        }
    },
    general: {
        modalJSON: {
            tag: "div",
            id: "popup",
            class: ["modal"],
            children: [
                {
                    tag: "div",
                    class: "modal-dialog",
                    children: [ 
                        {
                            tag: "div",
                            class: "modal-content",
                            children: [
                                {
                                    tag: "div",
                                    class: "modal-header", 
                                    children: [
                                        {
                                            tag: "h5",
                                            class: "modal-title",
                                            innerText: "Products",
                                        },
                                        {
                                            tag: "button",
                                            class: "btn-close",
                                            attributes: [
                                                { key: "type", value: "button" },
                                                { key: "aria-label", value: "Close"},
                                            ],
                                            innerText: "X",
                                        }
                                    ]
                                },
                                {
                                    tag: "div",
                                    class: "modal-body",
                                    children: [
                                        {
                                            tag: "p",
                                            innerText: "Adding Products...",
                                        },
                                        {
                                            tag: "ul",
                                            id: "product-list",
                                        },
                                    ],
                                },
                                {
                                    tag: "div",
                                    class: "modal-footer",
                                    children: [
                                        {
                                            tag: "button",
                                            class: ["btn", "btn-close"],
                                            innerText: "Close",
                                        }
                                    ]
                                }
                            ],
                        }
                    ],
                }
            ],
        },
        builder: function (obj) {
            if (obj == undefined) {
                console.error("obj is undefined");
                return;
            }
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

            if (obj.hasOwnProperty("attributes")) {
                obj["attributes"].forEach(attr => {
                    block.setAttribute(attr.key, attr.value);
                });
            }

            if (obj.hasOwnProperty("innerText")) {
                block.innerText = obj["innerText"];
            }
            if (obj.hasOwnProperty("innerHTML")) {
                if (typeof obj["innerHTML"] === "object") {
                    block.appendChild(bundle.general.builder(obj["innerHTML"]));
                }
                else {
                    block.innerHTML = obj["innerHTML"];
                }
            }
            if (obj.hasOwnProperty("children")) {
                if (Array.isArray(obj["children"])) {
                    obj["children"].forEach(child => {
                        block.append(bundle.general.builder(child));
                    });
                }
                else if (typeof obj["children"] === "object") {
                    block.append(bundle.general.builder(obj["children"]));
                }
            }
            return block;
        }
    },
    api: {
        cookie: "",
        url: "",
        base: "https://www.parkcityssbs.com/api/commerce/shopping-cart/entries?crumb=",
        //queue: [],
        addToCart: async function (bundleIds) {
            if (bundleIds) {
                //this.queue = bundleIds;
                
                for (const id of bundleIds) {
                    try {
                        var data = { itemId: id, sku: null, additionalFields: "null" };
                        const responseJSON = await bundle.api.post(data);
                        bundle.view.addMessage(responseJSON.newlyAdded);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                bundle.view.closeMessage();

                //let index = 0;
                //async function iterate() {
                //    if (index >= bundleIds.length) {
                //        //bundle.view.closeMessage();
                //        return;
                //    }
                //    await bundle.api.call(bundleIds[index]);
                //    index++;
                //    setTimeout(iterate, 500);
                //}
                //await iterate();
            }
        },

        call: async function (productId) {
            var data = { itemId: productId, sku: null, additionalFields: "null" };
            this.post(data)
                .then(d => {
                    bundle.view.addMessage(data.newlyAdded);
                    return d.newlyAdded;
                })
                .catch(error => {
                    console.log("Error", error);
                    return false;
                });
        },
        post: async function (data) {
            const response = await fetch(this.url, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data), });
            return response.json();
        },
        getCookie: function (name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(";");
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
        },
        setURL: function () {
            this.cookie = this.getCookie("crumb");
            this.url = this.base += this.cookie;
        },
    }
}

