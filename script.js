// ================================
// SMART SCHEMATIC CORE ENGINE
// ================================

let panZoomInstance = null;
let svgDoc = null;

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


    const texts = svgDoc.querySelectorAll("text");

    texts.forEach(t => {
        const label = t.textContent.trim();

        if (isReference(label)) {
            t.style.cursor = "pointer";
            t.style.fill = "#00bfff";

            t.addEventListener("click", () => {

    const group = t.closest("g");
    const texts = group.querySelectorAll("text");

    let value = "Unknown";
    let dnp = demoDNP.includes(label) ? "YES" : "No";


    texts.forEach(txt => {
        const content = txt.textContent.trim();

        if (content.toUpperCase() === "DNP") {
            dnp = "YES";
        }

        // value = any text that is not reference and not DNP
        if (!isReference(content) && content.toUpperCase() !== "DNP") {
            value = content;
        }
    });

    const img = getComponentImage(label);

infoBox.innerHTML = `
    <h3>${label}</h3>
    <p><b>Value:</b> ${value}</p>
    <p><b>DNP:</b> ${dnp}</p>
    <img src="${img}" style="width:100%; margin-top:10px; border-radius:8px;">
`;


    console.log("Clicked:", label, "Value:", value, "DNP:", dnp);
});

        }
    });

    // 🔥 CRITICAL: refresh panzoom AFTER all SVG edits
    setTimeout(() => {
        panZoomInstance.resize();
        panZoomInstance.updateBBox();
        panZoomInstance.fit();
        panZoomInstance.center();
    }, 100);

});
