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
// 🔥 START COMPONENT CLICK SYSTEM
enableComponentClick(svg);
               

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

// =======================================
// FINAL PRECISE COMPONENT CLICK DETECTOR
// =======================================
// =======================================
// REAL KiCad component click detector
// =======================================

// =======================================
// BUILD LIST OF ALL COMPONENT REFERENCES
// =======================================


// =======================================
// FINAL ACCURATE KiCad CLICK DETECTOR
// =======================================

function enableComponentClick(svg) {

    svg.addEventListener("click", function(event) {

        let el = event.target;

        // Walk up DOM until we find a group that contains <desc>
        while (el && el !== svg) {

            if (el.tagName === "g") {

                const desc = el.querySelector("desc");

                if (desc) {
                    const ref = desc.textContent.trim();

                    // Only real components (R1, C2, U3...)
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


    console.log("Found components:", componentRefs.length);

    // Listen for clicks anywhere on schematic
    svg.addEventListener("click", function(event) {

       // ⭐ Convert mouse position using svg-pan-zoom transform
const point = panZoomInstance.getSVG().createSVGPoint();
point.x = event.clientX;
point.y = event.clientY;

const svgPoint = point.matrixTransform(
    panZoomInstance.getSVG().getScreenCTM().inverse()
);


        // Find nearest reference text
        let closest = null;
        let minDist = Infinity;

        componentRefs.forEach(c => {
            const dx = c.x - svgPoint.x;
            const dy = c.y - svgPoint.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < minDist) {
                minDist = dist;
                closest = c.ref;
            }
        });

        // If click is near a component (threshold)
        if (minDist < 50) {
            showComponent(closest);
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
