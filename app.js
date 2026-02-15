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

// =======================================
// SMART COMPONENT CLICK DETECTOR
// =======================================

// =======================================
// ADVANCED COMPONENT CLICK DETECTOR
// Works for symbol + text
// =======================================

function enableComponentClick(svg) {

    svg.addEventListener("click", function(event) {

        let el = event.target;

        // Walk upward to nearest <g>
        while (el && el !== svg) {

            if (el.tagName === "g") {

                // Look for desc in THIS group
                let desc = el.querySelector(":scope > desc");

                // If not found, search inside group (text group)
                if (!desc) {
                    desc = el.querySelector("desc");
                }

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
// UPDATE RIGHT PANEL
// =======================================

function showComponent(ref) {

    document.getElementById("componentDetails").innerHTML = `
        <h2>${ref}</h2>
        <p>Component detected from schematic</p>
    `;

}
