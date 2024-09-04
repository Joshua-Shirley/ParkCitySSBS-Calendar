# Square Space 7.0 - Product Bundle How To



A code block needs to be added to the shopping page.


`
<!-- Style Sheet Reference -->
<link rel="stylesheet" type="text/css" href="https://joshuashirley.azurewebsites.net/css/bundled-products-v2.css">
<!-- JavaScript Reference -->
<script type="text/javascript" src="https://joshuashirley.azurewebsites.net/js/parkcity/bundled-products-v2.js"></script>
<!-- Code Implementation -->
<script>
const programs = [
    { 
        "name" : "Parent Product Name", 
        "parentId" : "66cd069772bfc51f5abc1812",   
        "products": ["66cd0697048dc7065860cc76", "66cd0697e12c893dbd371924"],                
    },    
]
/* Initiate the Script */
bundle.initiate(programs);
</script>
`