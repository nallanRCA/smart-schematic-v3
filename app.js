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

fetch("parts.json")
    .then(res => res.json())
    .then(data => {
        partsData = data;
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
const imagePath = window.location.origin + "/" + part.image;


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



