/* ==========================================
   SPEAKWISE - HOME PAGE JAVASCRIPT
========================================== */

(() => {

    "use strict";


    // Get HTML element using its ID
    const $ = (id) => document.getElementById(id);


    // Four activities in SpeakWise
    const activities = [
        "tongue",
        "reading",
        "conversation",
        "story"
    ];


    // Read saved progress from browser storage
    function readState(activity) {

        try {

            const savedData = localStorage.getItem(
                "speakwise_" + activity
            );

            return JSON.parse(savedData) || {
                completed: [],
                xp: 0
            };

        } catch (error) {

            return {
                completed: [],
                xp: 0
            };

        }

    }



    // Update activity progress on the Home page
    function renderProgress() {

        let totalXP = 0;

        let completedLevels = 0;


        activities.forEach((activity) => {

            const state = readState(activity);


            // Count completed levels
            const completedCount = Array.isArray(state.completed)
                ? state.completed.length
                : 0;


            // Add activity XP
            totalXP += Number(state.xp) || 0;


            // Add completed levels
            completedLevels += completedCount;


            // Get the corresponding HTML elements
            const countElement = $(activity + "Count");

            const progressBar = $(activity + "Bar");


            // Update completed level text
            if (countElement) {

                countElement.textContent =
                    Math.min(completedCount, 20) + " / 20";

            }


            // Update progress bar
            if (progressBar) {

                const percentage =
                    Math.min(completedCount, 20) / 20 * 100;

                progressBar.style.width = percentage + "%";

            }

        });



        // Display total XP
        if ($("totalXp")) {

            $("totalXp").textContent = totalXP;

        }


        // Display completed levels
        if ($("completedLevels")) {

            $("completedLevels").textContent =
                completedLevels;

        }


        // Display XP in navigation bar
        if ($("navXp")) {

            $("navXp").textContent = totalXP + " XP";

        }

    }



    // ======================================
    // MOBILE NAVIGATION
    // ======================================

    const menuToggle = $("menuToggle");

    const navLinks = $("navLinks");


    if (menuToggle && navLinks) {


        // Open or close the mobile menu
        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("open");


            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        });



        // Close menu when a navigation link is selected
        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });



        // Close menu when clicking outside it
        document.addEventListener("click", (event) => {

            const clickedInsideNavigation =
                navLinks.contains(event.target);

            const clickedMenuButton =
                menuToggle.contains(event.target);


            if (
                !clickedInsideNavigation &&
                !clickedMenuButton
            ) {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }



    // ======================================
    // CURRENT YEAR
    // ======================================

    const currentYear = $("currentYear");


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }



    // ======================================
    // INITIALIZE HOME PAGE
    // ======================================

    renderProgress();


})();