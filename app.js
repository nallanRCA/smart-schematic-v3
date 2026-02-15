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
function showComponent(ref) {

    const part = partsData[ref];

    if (!part) {
        document.getElementById("componentDetails").innerHTML =
            "<h2>" + ref + "</h2><p>No BOM data found</p>";
        return;
    }

    document.getElementById("componentDetails").innerHTML =
        "<h2>" + ref + "</h2>" +
        "<p><b>Value:</b> " + part.value + "</p>" +
        "<p><b>Part Number:</b> " + part.partNumber + "</p>" +
        "<p><b>Description:</b> " + part.description + "</p>" +
        "<img src='" + part.image + "' width='150'><br><br>" +
        "<button onclick=\"window.open('" + part.datasheet + "')\">Open Datasheet</button>";
}



// UPDATE RIGHT PANEL
function showComponent(ref) {
    document.getElementById("componentDetails").innerHTML =
        "<h2>" + ref + "</h2><p>Component detected from schematic</p>";
}
