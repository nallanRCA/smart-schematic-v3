let panZoomInstance = null;

window.addEventListener("load", function () {

    fetch("data/schematic.svg")
        .then(response => response.text())
        .then(svgText => {

            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svg = svgDoc.querySelector("svg");

            if (!svg) {
                console.error("SVG not found");
                return;
            }

            // Inject SVG
            document.getElementById("schematicViewer").appendChild(svg);

            svg.setAttribute("id", "schematicSVG");

            // Remove KiCad fixed size
            svg.removeAttribute("width");
            svg.removeAttribute("height");

            svg.style.width = "100%";
            svg.style.height = "100%";

            // Start zoom engine
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

                setTimeout(function () {
                    panZoomInstance.resize();
                    panZoomInstance.fit();
                    panZoomInstance.center();
                }, 300);

                enableComponentClick(svg);

            }, 200);

        });

});


// CLICK DETECTOR
function enableComponentClick(svg) {

    // ⭐ show hand cursor over schematic
    svg.style.cursor = "pointer";

    svg.addEventListener("click", function (event) {

        let el = event.target;

        while (el && el !== svg) {

            if (el.tagName === "g") {
                const desc = el.querySelector("desc");

                if (desc) {
                    const ref = desc.textContent.trim();

                    if (/^[A-Z]+[0-9]+/.test(ref)) {
                        showComponent(ref);
                        return;
                    }
                }
            }

            el = el.parentNode;
        }

    });

}
// =====================================================
// GLOBAL DATA
// =====================================================
let partsData = {};


// =====================================================
// LOAD BOM AFTER PAGE LOAD
// =====================================================
window.addEventListener("load", function () {

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
});


// =====================================================
// BUILD LEFT PANEL TOGGLES
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
                onchange="toggleComponent('${ref}', this.checked)">
                ${ref}
            </label>`;

        panel.appendChild(row);

        // apply initial visibility
        toggleComponent(ref, !part.dnp);
    });
}

