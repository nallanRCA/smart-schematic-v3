document.addEventListener("DOMContentLoaded", function () {

    const svgObject = document.getElementById("schematicImage");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const zoomResetBtn = document.getElementById("zoomReset");
    const infoBox = document.getElementById("infoBox");

    let panZoomInstance;
    let svgDoc;

    // GLOBAL ZOOM BUTTONS
    zoomInBtn.onclick = () => panZoomInstance?.zoomIn();
    zoomOutBtn.onclick = () => panZoomInstance?.zoomOut();
    zoomResetBtn.onclick = () => {
        if (!panZoomInstance) return;
        panZoomInstance.resetZoom();
        panZoomInstance.center();
        panZoomInstance.fit();
    };

    // SVG LOAD EVENT
    svgObject.addEventListener("load", function () {

        svgDoc = svgObject.contentDocument;
        const svg = svgDoc.querySelector("svg");

        // PAN ZOOM ENGINE
        panZoomInstance = svgPanZoom(svg, {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: true,
    center: true,
    minZoom: 0.5,
    maxZoom: 20,
    preventMouseEventsDefault: false,
    dblClickZoomEnabled: false,

    // IMPORTANT: run code AFTER panZoom finishes setup
    onUpdatedCTM: function () {

        // attach click listener ONLY ONCE
        if (svg.__clickBound) return;
        svg.__clickBound = true;

        const viewport = svg.querySelector(".svg-pan-zoom_viewport");

        let lastHighlighted = null;

        viewport.addEventListener("click", function (event) {

            let target = event.target;

// climb until we find a group that CONTAINS text (real component)
	while (target && target.tagName !== "svg") {
    if (target.querySelector && target.querySelector("tspan")) break;
    target = target.parentNode;
}

	if (!target || target.tagName === "svg") return;


            if (lastHighlighted) {
                lastHighlighted.classList.remove("highlighted-part");
            }

            target.classList.add("highlighted-part");
            lastHighlighted = target;

            const texts = target.querySelectorAll("tspan");
            if (texts.length === 0) return;

            let ref="", value="", status="";

            texts.forEach(t => {
                const txt = t.textContent.trim();
                if (/^[RCLUQJTPD]\d+/i.test(txt)) ref = txt;
                if (/DNP|DNF|NOT FITTED|NF/i.test(txt)) status = txt;
                if (!ref.includes(txt) && txt !== status && txt.length < 20) value = txt;
            });

            infoBox.innerHTML = `
                <h2>${ref || "Component"}</h2>
                <p><b>Value:</b> ${value || "-"}</p>
                <p><b>Status:</b> ${status || "Fitted"}</p>
                <hr>
                <button>Open Datasheet</button>
            `;
        });
    }
});



        console.log("PANZOOM CREATED");

        // CLICK + HIGHLIGHT ENGINE
        let lastHighlighted = null;

        viewport.addEventListener("click", function (event) {


            let target = event.target;
            while (target && target.tagName !== "g") {
                target = target.parentNode;
            }
            if (!target) return;

            if (lastHighlighted) {
                lastHighlighted.classList.remove("highlighted-part");
            }
            target.classList.add("highlighted-part");
            lastHighlighted = target;

            const texts = target.querySelectorAll("tspan");
            if (texts.length === 0) return;

            let ref = "", value = "", status = "";

            texts.forEach(t => {
                const txt = t.textContent.trim();
                if (/^[RCLUQJTPD]\d+/i.test(txt)) ref = txt;
                if (/DNP|DNF|NOT FITTED|NF/i.test(txt)) status = txt;
                if (!ref.includes(txt) && txt !== status && txt.length < 20) {
                    value = txt;
                }
            });

            infoBox.innerHTML = `
                <h2>${ref || "Component"}</h2>
                <p><b>Value:</b> ${value || "-"}</p>
                <p><b>Status:</b> ${status || "Fitted"}</p>
                <hr>
                <button>Open Datasheet</button>
            `;
        });

    });

});
