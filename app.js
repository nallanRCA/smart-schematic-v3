// Smart Schematic V3 — Clean Viewer Only

let panZoomInstance = null;

window.addEventListener("load", () => {

    const obj = document.getElementById("schematicObj");

    // Wait until the SVG inside <object> fully loads
    obj.addEventListener("load", () => {

        console.log("SVG loaded inside object");

        const svgDoc = obj.contentDocument;
        const svg = svgDoc.querySelector("svg");

        if (!svg) {
            console.error("SVG not found inside object");
            return;
        }

        // Give svg an id for the viewer
        svg.setAttribute("id", "schematicSVG");

        // Initialize svg-pan-zoom
        panZoomInstance = svgPanZoom(svg, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            panEnabled: true,
            mouseWheelZoomEnabled: true,
            dblClickZoomEnabled: true,
            preventMouseEventsDefault: true
        });

        // Desktop-friendly starting zoom
        setTimeout(() => {
            panZoomInstance.zoomBy(2.5);
        }, 500);

        console.log("Pan & Zoom READY ");
    });

});
