let parts = {};
let panZoom;

// LOAD EVERYTHING
window.onload = async () => {
    await loadParts();
    await loadSVG();
    buildLeftPanel();
};

// LOAD BOM
async function loadParts() {
    const res = await fetch("parts.json");
    parts = await res.json();
    console.log("BOM loaded");
}

// LOAD SVG
async function loadSVG() {

    const res = await fetch("data/schematic.svg");
    const text = await res.text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, "image/svg+xml");
    const svg = svgDoc.querySelector("svg");

    document.getElementById("viewer").appendChild(svg);

    svg.removeAttribute("width");
    svg.removeAttribute("height");

    recolorSVG(svg);
    enableClick(svg);

    setTimeout(() => {
        panZoom = svgPanZoom(svg, {
            zoomEnabled:true,
            controlIconsEnabled:true,
            fit:true,
            center:true
        });
    }, 300);
}

// RECOLOR KICAD SVG
function recolorSVG(svg) {
    svg.querySelectorAll("*").forEach(el => {
        if (el.getAttribute("stroke"))
            el.setAttribute("stroke","#fff");

        if (el.getAttribute("fill") && el.getAttribute("fill") !== "none")
            el.setAttribute("fill","#fff");
    });
}

// CLICK COMPONENT
function enableClick(svg) {
    svg.addEventListener("click", e => {
        let el = e.target;
        while (el && el !== svg) {
            const desc = el.querySelector("desc");
            if (desc) {
                showComponent(desc.textContent.trim());
                return;
            }
            el = el.parentNode;
        }
    });
}

// SHOW RIGHT PANEL
function showComponent(ref) {
    const part = parts[ref];
    if (!part) return;

    document.getElementById("ref").textContent = ref;
    document.getElementById("value").textContent = part.value;
    document.getElementById("footprint").textContent = part.footprint;
    document.getElementById("datasheetBtn").onclick =
        ()=> window.open(part.datasheet);
}

// BUILD LEFT PANEL
function buildLeftPanel() {
    const list = document.getElementById("componentList");

    Object.keys(parts).forEach(ref => {
        const row = document.createElement("div");
        row.innerHTML =
        `<label>
           <input type="checkbox" checked onchange="toggleDNP('${ref}')">
           ${ref}
         </label>`;
        list.appendChild(row);
    });
}

function toggleDNP(ref){
    const el = document.querySelector(`[data-ref="${ref}"]`);
    if(el) el.classList.toggle("dnp");
}
