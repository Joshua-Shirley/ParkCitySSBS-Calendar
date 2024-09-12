# Square Space Product Administration
## Product Set Up

[SKU](#sku) | [Title](#title) | [Description](#description) | [Image](#image) | [Price](#price)

---
### <a name="sku"></a>SKU Formating

Calendar products that are intended to be included in the calendar view need to maintain a specific text pattern.  
Each season the product SKU's need to be updated to reflect the current season and correct days.

    YYYY-MM-DD
    YYYY-MM-DD-CATEGORY
    YYYY-MM-DD-CATEGORY-ADDITIONAL

**Examples**  
2024-12-01-SKI  
2024-12-01-SB  
2024-12-01-TR  
2024-12-17-PG-FARMTEAM  
2025-01-15-PDT-RECHARGE

**Categories**

| Syntax | Description       |
| ------ | ----------------- |
| SKI    | Retail Ski        |
| SB     | Retail Snowboard  |
| AST    | Retail Assistant  |
| PG     | Local's Program   |
| TR     | Trainer           |
| PDT    | Paid Training Day |

**Additional**

Here is a space to add a few characters to add additional information to pass along to the calendar script.  
Mostly this is used to add the name of the local's program.  
IE:  2024-12-17-PG-**LTR**

---  
### <a name="title"></a>Title

Product titles pass along a short descriptive information about the product.  
The title is also parsed into sections for the cart view.  
The goal is to make readable sections.

Here are some examples:  
- Junior Adventure - Sunday - 02/09/2025
- Farm Team - 01/11/2025
- Ski - 12/01/2025
- SB - 12/26/2024 - Peak (FT PT4 PT18)
- New Hire Training (2 of 4) - 12/14/2024

**Parsing Format Parts:**  
- Product Short Title
- " - " Hyphen with a space before and after
- Date - MM/DD/YYYY
- " - " Hyphen with a space before and after
- Peak Product Information

  PRODUCT NAME - MM/DD/YYYY - PEAK (FT)  
  PRODUCT NAME - MM/DD/YYYY - PEAK (FT PT18)  
  PRODUCT NAME - MM/DD/YYYY  

---  
### <a name="description"></a>Description

Product descriptions are not used in the calendar script.  The information entered here can help the user glean more information.  
**Bundled Products** check out the readme page for bundeled products for that specific use.  

---  
### <a name="image"></a>Images

Images are not displayed in the calendar format.  Adding a product image is optional.  But adding an image can be useful for script degradation (ie the calendar format script fails to excute properly.)
**Important** make sure the images is checked as visible.  Square Space uses the image container to pass along Out Of Stock status to the user.  The calendar script grabs that instock/outofstock from the image before the image is hidden from the user.

---  
### <a name="price"></a>Price

Product prices should be set to $0.00.  
Prices are hidden from the user in all phases except the cart checkout.
**Important** make sure the price is checked as visible.
