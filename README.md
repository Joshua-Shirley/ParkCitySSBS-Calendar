# Park City Ski School Schedule Calendar 

---

A guide on how to implement the Javascript and Cascading Style Sheets within the SquareSpace website.



## Product Administration

### SKU Formating

Calendar products that are intended to be included in the calendar view need to maintain a specific text pattern.  
Each season the product SKU's need to be updated to reflect the current season and correct days.

    YYYY-MM-DD
    YYYY-MM-DD-CATEGORY
    YYYY-MM-DD-CATEGORY-ADDITIONAL

**Examples**  
2025-02-05-NHRe-SKI  
2024-12-01-SKI  
2024-12-01-SB  
2024-12-01-TR  
2024-12-17-PG-FARMTEAM  

**Categories**

| Syntax | Description       |
| ------ | ----------------- |
| SKI    | Retail Ski        |
| SB     | Retail Snowboard  |
| PG     | Local's Program   |
| TR     | Trainer           |
| PDT    | Paid Training Day |

**Additional**

Here is a space to add a few characters to add additional information to pass along to the calendar script.  
Mostly this is used to add the name of the local's program.  
IE:  2024-12-17-PG-**LTR**

### Titles ###

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


### Description ###

Product descriptions are not used in the calendar script.  The information entered here can help the user glean more information.  
**Bundled Products** check out the readme page for bundeled products for that specific use.

### Images ###

Images are not displayed in the calendar format.  Adding a product image is optional.  But adding an image can be useful for script degradation (ie the calendar format script fails to excute properly.)
**Important** make sure the images is checked as visible.  Square Space uses the image container to pass along Out Of Stock status to the user.  The calendar script grabs that instock/outofstock from the image before the image is hidden from the user.

### Price ###

Product prices should be set to $0.00.  
Prices are hidden from the user in all phases except the cart checkout.
**Important** make sure the price is checked as visible.


## Script Initiation ##

Change the settings properties to get the 
enter dates using the MM/DD/YYYY format IE: "11/25/2024" inside a new Date() function like - new Date("11/25/2024")

STEP 1: - CALENDAR GROUP TYPE
chose one "fulltime", "parttime4", "parttime32", "parttime18"
    calendar.settings.group: "fulltime";

STEP 2: = PEAK DAY - TITLE INDICATOR
PRODUCT TITLE: "Ski - 11/27/2024 - Peak ( FT PT4 )"
    calendar.settings.peakDayIndicator: "FT" 

STEP 3: - CALENDAR START & FINISH
Open and close dates to start and end the calendar
    calendar.settings.dates.open = new Date("11/01/2024");
    calendar.settings.dates.close = new Date("04/21/2025");


STEP 4: - REQUIREMENTS
// Total Day Requirement
    calendar.settings.requirements.requiredDays = 32;
// Peak Day Requirement
    calendar.settings.requirements.peakDays = 40;
// Official Days = after offical start
    calendar.settings.requirements.officalDays = 80;
// Holiday Requirement
    calendar.settings.requirements.holiday = 1;
// PT 18 
    calendar.settings.requirements.month1 = 3;
    calendar.settings.summary.month1 = "December";
    calendar.settings.requirements.month2 = 3;
    calendar.settings.summary.month2 = "February";
    calendar.settings.requirements.month3 = 3;
    calendar.settings.summary.month3 = "March";

STEP 5: - Button Text
IF you want to change the add to cart button text
Text should be simple and short (less than 10 characters).
Surronded by quotations.  "WORKING", "WORK", "TWERK", etc.
    calendar.settings.button.on = "Working";
    calendar.settings.button.off = "Day Off";
    calendar.settings.button.full = "Full";
