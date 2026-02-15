// ================= GLOBAL FUNCTIONS =================

// Toggle DNP grey state
window.toggleComponent = function (ref) {
    const el = document.querySelector(`[data-ref="${ref}"]`);
    if (!el) {
        console.warn("Component not found:", ref);
        return;
    }
    el.classList.toggle("dnp-hidden");
};

// Show component popup + highlight
window.showComponent = function (ref) {
    const el = document.querySelector(`[data-ref="${ref}"]`);
    if (!el) return;

    // remove previous highlight
    document.querySelectorAll(".selected-part")
        .forEach(e => e.classList.remove("selected-part"));

    el.classList.add("selected-part");

    const part = partsData[ref];
    if (!part) return;

    document.getElementById("infoRef").textContent = part.ref;
    document.getElementById("infoValue").textContent = part.value;
    document.getElementById("infoFootprint").textContent = part.footprint;

    document.getElementById("infoDatasheet").onclick =
        () => window.open(part.datasheet, "_blank");

    document.getElementById("infoPanel").classList.add("open");
};

// =====================================================
// GLOBAL DATA
// =====================================================
let partsData = {};
let panZoomInstance = null;


// =====================================================
// PAGE LOAD
// =====================================================
window.addEventListener("load", function () {

    // LOAD BOM
    const bomURL = window.location.origin +
                   window.location.pathname.replace(/\/$/, "") +
                   "/parts.json";

    fetch(bomURL)
        .then(res => res.json())
        .then(data => {
            partsData = data;
            console.log("BOM loaded");

            buildDNPPanel();
            enableSearch();
        });

    // LOAD SVG
    fetch("data/schematic.svg")
        .then(response => response.text())
        .then(svgText => {

            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svg = svgDoc.querySelector("svg");

            document.getElementById("schematicViewer").appendChild(svg);

            svg.setAttribute("id", "schematicSVG");
           // Remove fixed KiCad sizing
svg.removeAttribute("width");
svg.removeAttribute("height");

// ⭐ Force responsive scaling
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");

// ⭐ CRITICAL: ensure viewBox exists
if (!svg.getAttribute("viewBox")) {
    const bbox = svg.getBBox();
    svg.setAttribute("viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
}


            setTimeout(function () {

                panZoomInstance = svgPanZoom("#schematicSVG", {
                    zoomEnabled: true,
                    controlIconsEnabled: true,
                    fit: true,
                    center: true,
                    panEnabled: true,
                    mouseWheelZoomEnabled: true,
                    dblClickZoomEnabled: true,
                    minZoom: 0.2,
                    maxZoom: 50
                });

  setTimeout(() => {
    panZoomInstance.resize();
    panZoomInstance.fit();
    panZoomInstance.center();
}, 500);


ZoomInstance.center();


                enableComponentClick(svg);

       
});


// =====================================================
// CLICK DETECTOR ON SVG
// =====================================================
function enableComponentClick(svg) {

    svg.style.cursor = "pointer";

    svg.addEventListener("click", function (event) {

        let el = event.target;

        while (el && el !== svg) {
            if (el.tagName === "g") {
                const desc = el.querySelector("desc");
                if (desc) {
                    const ref = desc.textContent.trim();
                    if (/^[A-Z]+[0-9]+/.test(ref)) {
                        window.showComponent(ref);   // ⭐ FIXED
                        return;
                    }
                }
            }
            el = el.parentNode;
        }
    });
}


// =====================================================
// BUILD LEFT DNP PANEL
// =====================================================
function buildDNPPanel() {

    const panel = document.getElementById("searchResults");
    panel.innerHTML = "<h3>Components</h3>";

    Object.keys(partsData).sort().forEach(ref => {

        const part = partsData[ref];
        const checked = part.dnp ? "" : "checked";

        const row = document.createElement("div");
        row.innerHTML =
            `<label>
                <input type="checkbox" ${checked}
                onchange="window.toggleComponent('${ref}')">
                ${ref}
            </label>`;

        panel.appendChild(row);

        // apply initial DNP state
        if (part.dnp) window.toggleComponent(ref);
    });
}


// =====================================================
// SEARCH (placeholder)
// =====================================================
function enableSearch() {
    // we reconnect search later
}
