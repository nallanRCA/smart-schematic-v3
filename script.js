// ================================
// SMART SCHEMATIC - CLEAN STABLE VERSION
// ================================

document.addEventListener("DOMContentLoaded", function () {

    let panZoomInstance = null;
    let bomData = [];

    const svgObject = document.getElementById("schematicImage");

    // ================= LOAD BOM =================
    fetch("data/bom.csv")
        .then(r => r.text())
        .then(csv => {

            const rows = csv.split(/\r?\n/).filter(r => r.trim());
            const headers = rows[0].split(",");

            for (let i = 1; i < rows.length; i++) {

                const values = rows[i].split(",");
                const obj = {};

                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index]
                        ? values[index].trim()
                        : "";
                });

                bomData.push(obj);
            }

            console.log("BOM Loaded:", bomData.length);
        });

    // ================= SVG LOAD =================
    svgObject.addEventListener("load", function () {

        const svgDoc = svgObject.contentDocument;
        const svg = svgDoc.querySelector("svg");

        if (!svg) {
            console.log("SVG not found");
            return;
        }

        // 🔥 FIX KiCad SVG (remove fixed size)
        svg.removeAttribute("width");
        svg.removeAttribute("height");

        // 🔥 Add viewBox if missing
        if (!svg.getAttribute("viewBox")) {
            const bbox = svg.getBBox();
            svg.setAttribute("viewBox",
                `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        }

        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.width = "100%";
        svg.style.height = "100%";

        // Initialize zoom AFTER fixing structure
        panZoomInstance = svgPanZoom(svg, {
            zoomEnabled: true,
            controlIconsEnabled: false,
            fit: true,
            center: true,
            minZoom: 0.5,
            maxZoom: 20
        });

        console.log("Zoom Initialized");

        // ================= COMPONENT CLICK =================
        const infoBox = document.getElementById("infoBox");

        svgDoc.querySelectorAll("text").forEach(t => {

            const label = t.textContent.trim();

            if (!/^[A-Z]+\d+$/i.test(label)) return;

            t.style.cursor = "pointer";
            t.style.fill = "#00bfff";

            t.addEventListener("click", () => {

                const part = bomData.find(p =>
                    p.Ref && p.Ref.trim().toUpperCase() === label.toUpperCase()
                );

                if (!part) {
                    infoBox.innerHTML = `<h3>${label}</h3><p>No BOM Data</p>`;
                    return;
                }

                const imgPath = part.Image && part.Image.trim() !== ""
    ? part.Image.trim()
    : `data/images/${label}.jpg`;

let imgHTML = "";
let dsHTML = "";

if (part.Image && part.Image.trim() !== "") {
    imgHTML = `
        <img src="${part.Image.trim()}"
             alt="${label}"
             style="max-width:100%; margin-top:10px;">
    `;
}

if (part.Datasheet && part.Datasheet.trim() !== "") {
    dsHTML = `
        <p>
            <a href="${part.Datasheet.trim()}"
               target="_blank"
               style="display:inline-block;
                      margin-top:8px;
                      padding:6px 10px;
                      background:#007acc;
                      color:white;
                      text-decoration:none;
                      border-radius:4px;">
               📄 Open Datasheet
            </a>
        </p>
    `;
}

infoBox.innerHTML = `
    <h3>${label}</h3>
    <p><b>Value:</b> ${part.Value}</p>
    <p><b>MPN:</b> ${part.MPN}</p>
    <p><b>Description:</b> ${part.Description}</p>
    ${dsHTML}
    ${imgHTML}
`;
            });
        });

    });

    // ================= ZOOM BUTTONS =================
    document.getElementById("zoomIn").onclick = () => {
        if (panZoomInstance) panZoomInstance.zoomIn();
    };

    document.getElementById("zoomOut").onclick = () => {
        if (panZoomInstance) panZoomInstance.zoomOut();
    };

    document.getElementById("zoomReset").onclick = () => {
        if (panZoomInstance) {
            panZoomInstance.resetZoom();
            panZoomInstance.center();
        }
    };

    document.getElementById("fitScreen").onclick = () => {
        if (panZoomInstance) {
            panZoomInstance.fit();
            panZoomInstance.center();
        }
    };

});