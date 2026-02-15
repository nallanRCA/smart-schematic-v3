let panZoomInstance = null;

window.addEventListener("load", () => {

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

            // Inject SVG into page
            document.getElementById("schematicViewer").appendChild(svg);

            svg.setAttribute("id", "schematicSVG");

            // Remove KiCad fixed size
            svg.removeAttribute("width");
            svg.removeAttribute("height");

            svg.style.width = "100%";
            svg.style.height = "100%";

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

                setTimeout(() => {
                    panZoomInstance.resize();
                    panZoomInstance.fit();
                    panZoomInstance.center();
                }, 300);

                // ⭐ enable component clicking
                enableComponentClick(svg);

            }, 200);

        });

});


// =======================================
// FINAL KiCad component click detector
// =======================================

function enableComponentClick(svg) {

    svg.addEventListener("click", function(event) {

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


// Update right panel
function showComponent(ref) {
    document.getElementById("componentDetails").innerHTML = `
        <h2>${ref}</h2>
        <p>Component detected from schematic</p>
    `;
}
