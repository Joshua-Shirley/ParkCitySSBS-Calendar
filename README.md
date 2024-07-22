Park City Schedule Checkout System

const calendar = {
    settings : {
        /* Group should be set as one of the following: fulltime, parttime32, parttime18 */
        group : "fulltime",
        dates : {
            /* open and close determines what month the calendar starts and ends */
            open : new Date("2024-11-02"),
            close : new Date("2025-04-31"),
            peak : [],
            fullTimeStart: new Date("2024-12-15"),
            holiday: [],
        },
        button : {
            on : "On",
            off: "Off",
            full: "Full",
        },
        requirements : {
            peakDays: 40,
            requiredDays: 80,
            daysAfterDec15: 80,
            holiday: 1,
        },
