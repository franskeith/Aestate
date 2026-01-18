// Event Configuration for Valentine
// This file registers the event to the global AESTATE_EVENTS registry.

(function () {
    // Ensure global registry exists
    window.AESTATE_EVENTS = window.AESTATE_EVENTS || [];

    // Add Valentine Event
    window.AESTATE_EVENTS.push({
        id: "valentine", // MATCHES the 'events' string in Spreadsheet (e.g. "valentine, new")

        // --- DISPLAY CONFIG ---
        title: "Romantic<br>Date Night",
        tag: "Feb 14",
        desc: "Soft pinks, elegant reds, and delicate jewelry for the perfect evening.",

        // --- THEME ---
        theme: "valentine", // Maps to CSS class .event-card.valentine (pink border)
        tagColor: "pink",   // Maps to CSS class .t-pink

        // --- BUTTON ---
        btnText: "Shop Valentine →",
        btnLink: "#", // Can be overriding link, or dynamic
        btnClass: "pink-hover" // Extra CSS class for button hover
    });

    console.log("Event Loaded: Valentine");
})();
