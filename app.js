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

// =======================================
// LOAD BOM DATA
// =======================================
let partsData = {};

// ⭐ Load BOM correctly on GitHub Pages
const bomURL = window.location.origin + window.location.pathname.replace(/\/$/, "") + "/parts.json";

fetch(bomURL)
    .then(res => res.json())
    .then(data => {
        partsData = data;
		buildDNPPanel();
        enableSearch();

        console.log("BOM loaded");
    });



// =======================================
// SHOW COMPONENT INFO IN RIGHT PANEL
// =======================================
function showComponent(ref) {

    const part = partsData[ref];

    if (!part) {
        document.getElementById("componentDetails").innerHTML =
            "<h2>" + ref + "</h2><p>No BOM data found</p>";
        return;
    }

    // Fix path for GitHub Pages
   // ⭐ Works locally AND on GitHub Pages
// ⭐ Correct GitHub Pages image path
const imagePath = window.location.origin + window.location.pathname.replace(/\/$/, "") + "/" + part.image;



    let html =
        "<h2>" + ref + "</h2>" +
        "<p><b>Value:</b> " + part.value + "</p>" +
        "<p><b>Part Number:</b> " + part.partNumber + "</p>" +
        "<p><b>Description:</b> " + part.description + "</p>";

    if (part.image) {
        html += "<img src='" + imagePath + "' width='180' style='margin-top:10px'><br>";
    }

    if (part.datasheet) {
        html += "<br><a href='" + part.datasheet + "' target='_blank'>📄 Open Datasheet</a>";
    }

    document.getElementById("componentDetails").innerHTML = html;
}

// =======================================
// BUILD LEFT PANEL DNP TOGGLES
// =======================================
function buildDNPPanel() {

    const panel = document.getElementById("searchResults");
    panel.innerHTML = "<h3>Components</h3>";

    Object.keys(partsData).sort().forEach(ref => {

        const part = partsData[ref];
        const checked = part.dnp ? "" : "checked";

        const row = document.createElement("div");
        row.innerHTML =
            `<label>
                <input type="checkbox" ${checked} onchange="toggleComponent('${ref}', this.checked)">
                ${ref}
            </label>`;

       panel.appendChild(row);

// ⭐ apply initial visibility when page loads
toggleComponent(ref, !part.dnp);

    });
}
function toggleComponent(ref, visible) {

    const svg = document.getElementById("schematicSVG");
    const groups = svg.querySelectorAll("g");

    groups.forEach(g => {
        const desc = g.querySelector("desc");
        if (!desc) return;

        if (desc.textContent.trim() === ref) {

            if (visible) {
                g.style.display = "inline";
            } else {
                g.style.display = "none";
            }
        }
    });
}

// =======================================
// SEARCH COMPONENTS
// =======================================
function enableSearch() {

    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("input", function() {
        const query = this.value.toLowerCase();
        searchComponent(query);
    });
}


function searchComponent(query) {

    if (!query) return;

    // find matching part in BOM
    for (const ref in partsData) {
        const part = partsData[ref];

        const text =
            ref.toLowerCase() + " " +
            part.value.toLowerCase() + " " +
            part.description.toLowerCase();

        if (text.includes(query)) {
            zoomToComponent(ref);
            showComponent(ref);
            break;
        }
    }
}
// =======================================
// ZOOM TO COMPONENT (used by search)
// =======================================
function zoomToComponent(ref) {

    const svg = document.getElementById("schematicSVG");
    const groups = svg.querySelectorAll("g");

    groups.forEach(g => {
        const desc = g.querySelector("desc");
        if (!desc) return;

        if (desc.textContent.trim() === ref) {

            const bbox = g.getBBox();

            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            // zoom in
            panZoomInstance.zoom(4);

            // pan so component is centered
            const sizes = panZoomInstance.getSizes();
            panZoomInstance.pan({
                x: sizes.width / 2 - centerX * sizes.realZoom,
                y: sizes.height / 2 - centerY * sizes.realZoom
            });
        }
    });
}


