// =====================================================
// GLOBAL DATA
// =====================================================
let parts = {};
let panZoom;


// =====================================================
// APP START
// =====================================================
window.onload = async () => {
    await loadParts();
    await loadSVG();
    buildLeftPanel();
};


// =====================================================
// LOAD BOM
// =====================================================
async function loadParts() {
    const res = await fetch("parts.json");
    parts = await res.json();
    console.log("BOM loaded");
}


// =====================================================
// LOAD + PREPARE SVG
// =====================================================
async function loadSVG() {

    const res = await fetch("data/schematic.svg");
    const text = await res.text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, "image/svg+xml");
    const svg = svgDoc.querySelector("svg");

    const viewer = document.getElementById("viewer");
    viewer.appendChild(svg);

    // Remove KiCad fixed sizing
    svg.removeAttribute("width");
    svg.removeAttribute("height");

    // ⭐ Create proper viewBox from drawing size
    const bbox = svg.getBBox();
    svg.setAttribute("viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

    svg.setAttribute("width", "100%");
    svg.se
