let panZoomInstance = null;

window.addEventListener("load", () => {

    const obj = document.getElementById("schematicObj");

    obj.addEventListener("load", () => {

        const svgDoc = obj.contentDocument;

        // 🔥 KiCad exports nested SVGs — grab the REAL one
        let svg = svgDoc.querySelector("svg svg") || svgDoc.querySelector("svg");

        if (!svg) {
            console.error("SVG not found");
            return;
        }

        console.log("Real SVG detected");

        // ⭐ Ensure SVG has viewBox (REQUIRED for svg-pan-zoom)
        if (!svg.getAttribute("viewBox")) {
            const bbox = svg.getBBox();
            svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`);
        }

        // Give id for library
        svg.setAttribute("id", "schematicSVG");

        // ⭐ Wait for layout inside flex container
        setTimeout(() => {

            panZoomInstance = svgPanZoom("#schematicSVG", {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
                panEnabled: true,
                mouseWheelZoomEnabled: true,
                dblClickZoomEnabled: true,
                preventMouseEventsDefault: false,
                minZoom: 0.2,
                maxZoom: 50
            });

            panZoomInstance.resize();
            panZoomInstance.fit();
            panZoomInstance.center();

            console.log("ZOOM ENGINE READY");

        }, 400);

    });

});
