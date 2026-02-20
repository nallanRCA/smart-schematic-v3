// ================================
// SMART SCHEMATIC CORE ENGINE
// ================================

let panZoomInstance = null;
let svgDoc = null;
// ===============================
// LOAD BOM CSV
// ===============================
// ===============================
// LOAD BOM CSV (SAFE VERSION)
// ===============================
let bomData = [];

fetch("data/bom.csv")
    .then(response => response.text())
    .then(csv => {

        const rows = csv.split(/\r?\n/).filter(r => r.trim() !== "");
        const headers = rows[0].split(",");

        for (let i = 1; i < rows.length; i++) {

            // Handle quoted CSV properly
            const values = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

            if (!values) continue;

            const obj = {};

            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]
                    ? values[index].replace(/^"|"$/g, "").trim()
                    : "";
            });

            bomData.push(obj);
        }

        console.log("BOM loaded correctly:", bomData);
    });
const svgObject = document.getElementById("schematicImage");

svgObject.addEventListener("load", function () {

    console.log("SVG LOADED");

    // Access SVG inside <object>
    svgDoc = svgObject.contentDocument;
    const svg = svgDoc.querySelector("svg");

    // Init svg-pan-zoom
    panZoomInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 20
    });
/// ================= ZOOM FUNCTION =================
function zoomToComponent(target) {

    if (!target || !panZoomInstance) return;

    const bbox = target.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    const zoomLevel = 3;

    panZoomInstance.zoom(zoomLevel);

    panZoomInstance.pan({
        x: -cx * zoomLevel + 400,
        y: -cy * zoomLevel + 250
    });
}
	
	// ================= ZOOM TO COMPONENT =================
function zoomToComponent(target) {

    const bbox = target.getBBox();

    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    // Set fixed zoom level
    const zoomLevel = 3;

    panZoomInstance.zoom(zoomLevel);

    panZoomInstance.pan({
        x: -cx * zoomLevel + 500,
        y: -cy * zoomLevel + 300
  // ================= SEARCH FUNCTION =================
window.searchComponent = function () {

    const input = document.getElementById("searchInput");
    const ref = input.value.trim().toUpperCase();

    if (!ref) return;

    let target = null;

    svgDoc.querySelectorAll("text").forEach(t => {
        if (t.textContent.trim().toUpperCase() === ref) {
            target = t.closest("g");
        }
    });

    if (!target) {
        alert("Component not found");
        return;
    }

    zoomToComponent(target);
};  
	});
}
// =====================================
// SEARCH ON ENTER KEY
// =====================================
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keydown", function(e){
    if (e.key === "Enter") {
        searchComponent();
    }
});
    console.log("PANZOOM READY");
// ================= DEMO CLEANUP =================
// Remove duplicate colored text (teal annotations)

const allSvgTexts = svgDoc.querySelectorAll("text");

allSvgTexts.forEach(txt => {
    const fill = txt.getAttribute("fill");

    // remove colored annotation text (teal layer)
    if (fill && fill !== "#000000" && fill !== "black") {
        txt.remove();
    }
});

console.log("Demo cleanup applied");

    // ================= ZOOM BUTTONS =================
    document.getElementById("zoomIn").onclick = () => panZoomInstance.zoomIn();
    document.getElementById("zoomOut").onclick = () => panZoomInstance.zoomOut();
    document.getElementById("zoomReset").onclick = () => panZoomInstance.resetZoom();
    document.getElementById("fitScreen").onclick = () => {
        panZoomInstance.fit();
        panZoomInstance.center();
    };
// ===== DEMO DNP LIST =====
// Components that will behave as DNP in the demo
const demoDNP = ["D6", "D7", "D8", "R15", "C22"];

    // ================= DNP TOGGLE =================
  function getDNPComponents() {

    const texts = svgDoc.querySelectorAll("text");
    const parts = new Set();

    texts.forEach(t => {
        const label = t.textContent.trim();

        if (demoDNP.includes(label)) {
            const g = t.closest("g");
            if (g) parts.add(g);
        }
    });

    return Array.from(parts);
}

    let dnpVisible = true;

    document.getElementById("toggleDNP").onclick = () => {
        const dnpParts = getDNPComponents();
        dnpVisible = !dnpVisible;

        dnpParts.forEach(part => {
            part.style.opacity = dnpVisible ? "1" : "0.15";
        });
    };

    // ================= COMPONENT CLICK =================
    const infoBox = document.getElementById("infoBox");
// ================= COMPONENT IMAGE LIBRARY =================
const componentImages = {

    // exact demo parts
    "D6": "data/images/bridge.jpg",
    "D7": "data/images/bridge.jpg",
    "D8": "data/images/bridge.jpg",
    "BZ1": "data/images/bz1.jpg",

    // fallback by prefix
    "R": "data/images/Resistor.jpg",
    "C": "data/images/C1.jpg",
    "D": "data/images/D1.jpg",
    "Q": "data/images/mosfet.jpg",
    "Z": "data/images/zener.jpg",

    "default": "data/images/opto.jpg"
};

function getComponentImage(ref) {
    if (componentImages[ref]) return componentImages[ref];
    const prefix = ref.match(/^[A-Z]+/i)[0];
    return componentImages[prefix] || componentImages.default;
}

    function isReference(text) {
    // Match ANY reference designator: letters + number (R1, U3, BZ1, SW2, LED5...)
    return /^[A-Z]+\d+$/i.test(text);
}


 // ================= COMPONENT CLICK (BOM DRIVEN) =================
const infoBox = document.getElementById("infoBox");

function isReference(text) {
    return /^[A-Z]+\d+$/i.test(text);
}

svgDoc.querySelectorAll("text").forEach(t => {

    const label = t.textContent.trim();

    if (!isReference(label)) return;

    t.style.cursor = "pointer";
    t.style.fill = "#00bfff";

    t.addEventListener("click", () => {

        const part = bomData.find(p => 
    p.Ref && p.Ref.trim().toUpperCase() === label.trim().toUpperCase()
);

        if (!part) {
            infoBox.innerHTML = `<h3>${label}</h3><p>No BOM data found</p>`;
            return;
        }

        const value = part.Value || "Unknown";
        const mpn = part.MPN || "-";
        const desc = part.Description || "-";
       const ds = part.Datasheet && part.Datasheet.trim() !== "" 
           ? part.Datasheet.trim() 
           : null;
        const img = part.Image || null;
        const dnp = part.DNP ? "YES" : "No";

        infoBox.innerHTML = `
            <h3>${label}</h3>
            <p><b>Value:</b> ${value}</p>
            <p><b>MPN:</b> ${mpn}</p>
            <p><b>Description:</b> ${desc}</p>
            <p><b>DNP:</b> ${dnp}</p>
            ${ds ? `<a href="${ds}" target="_blank" class="dsBtn">📄 Open Datasheet</a>` : ""}
            ${img ? `<img src="${img}" style="width:100%; margin-top:10px; border-radius:8px;">` : ""}
        `;
		zoomToComponent(t.closest("g"));
    });
}); 
    // 🔥 CRITICAL: refresh panzoom AFTER all SVG edits
    setTimeout(() => {
        panZoomInstance.resize();
        panZoomInstance.updateBBox();
        panZoomInstance.fit();
        panZoomInstance.center();
    }, 100);

});
