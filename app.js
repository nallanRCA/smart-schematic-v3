let panZoomInstance = null;

window.addEventListener("load", () => {

    // 🔥 Load SVG as text (works on GitHub Pages)
    fetch("data/schematic.svg")
        .then(res => res.text())
        .then(svgText => {

            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svg = svgDoc.querySelector("svg");

            if (!svg) {
                console.error("SVG not found");
                return;
            }

           document.getElementById("schematicViewer").appendChild(svg);

svg.setAttribute("id", "schematicSVG");

/* 🔥 REMOVE KiCad fixed size (THIS IS THE LAST BUG) */
svg.removeAttribute("width");
svg.removeAttribute("height");

svg.style.width = "100%";
svg.style.height = "100%";


            // Give SVG a viewBox if missing
            if (!svg.getAttribute("viewBox")) {
                const bbox = svg.getBBox();
                svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`);
            }

            // Start zoom engine
            setTimeout(() => {

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
// 🔥 Enable component clicking
enableComponentClick(svg);

                // Force correct fit AFTER layout is ready
setTimeout(() => {
    panZoomInstance.resize();
    panZoomInstance.fit();
    panZoomInstance.center();
}, 300);


                console.log("Zoom READY");

            }, 200);

        });

});
// =======================================
// FIND COMPONENTS FROM KiCad SVG
// =======================================

function enableComponentClick(svg) {

    const groups = svg.querySelectorAll("g");

    groups.forEach(group => {

        const desc = group.querySelector("desc");
        if (!desc) return;

        const ref = desc.textContent.trim();

        // Make mouse cursor pointer
        group.style.cursor = "pointer";

        // Click event
        group.addEventListener("click", (e) => {
            e.stopPropagation();
            showComponent(ref);
        });

    });

}

// =======================================
// UPDATE RIGHT PANEL
// =======================================

function showComponent(ref) {

    document.getElementById("componentDetails").innerHTML = `
        <h2>${ref}</h2>
        <p>Component detected from schematic</p>
    `;

}
