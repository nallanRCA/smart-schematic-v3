let BOM = {};
let componentPositions = {};
let panZoomInstance;

// -------- LOAD BOM --------
async function loadBOM() {
    const response = await fetch("./data/bom.csv");
    const text = await response.text();
    const rows = text.split(/\r?\n/).slice(1);

    rows.forEach(row => {
        const cols = row.split(",");
        const ref = cols[0]?.trim().toUpperCase();
        if (!ref) return;

        BOM[ref] = {
            value: cols[1]?.trim(),
            mpn: cols[2]?.trim(),
            desc: cols[3]?.trim(),
            datasheet: cols[4]?.trim(),
            image: cols[5]?.trim()
        };
    });
}

// -------- LOAD SCHEMATIC --------
async function loadSchematic() {
    const response = await fetch("./data/schematic.svg");

    const svgText = await response.text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = svgDoc.querySelector("svg");

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.width = "100%";
    svg.style.height = "100%";

    document.getElementById("schematicContainer").appendChild(svg);

    panZoomInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 20
    });

    setTimeout(createClickTargets, 800);
}

// -------- CLICK TARGETS --------
function createClickTargets() {
    const viewport = document.querySelector(".svg-pan-zoom_viewport");
    const descs = document.querySelectorAll("desc");

    descs.forEach(desc => {
        const ref = desc.textContent.trim().toUpperCase();
        if (!/^[A-Z]+[0-9]+$/i.test(ref)) return;

        const parent = desc.parentElement;
        const bbox = parent.getBBox();

        componentPositions[ref] = {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", componentPositions[ref].x);
        circle.setAttribute("cy", componentPositions[ref].y);
        circle.setAttribute("r", 6);
        circle.setAttribute("fill", "transparent");
        circle.style.cursor = "pointer";

        circle.addEventListener("click", (e) => {
            e.stopPropagation();
            showComponent(ref);
        });

        viewport.appendChild(circle);
    });
}

// -------- SHOW COMPONENT --------
function showComponent(ref) {
    const panel = document.getElementById("componentDetails");
    const part = BOM[ref];

    if (!part) {
        panel.innerHTML = `<h2>${ref}</h2><p>No BOM data found</p>`;
        return;
    }

    panel.innerHTML = `
        <h2>${ref}</h2>
        <p><b>Value:</b> ${part.value}</p>
        <p><b>Description:</b> ${part.desc}</p>
        <p><b>MPN:</b> ${part.mpn}</p>
        <p><a href="${part.datasheet}" target="_blank">📄 Datasheet</a></p>
        <img src="${part.image}" width="200">
    `;
}

// -------- SEARCH --------
function zoomToComponent(ref) {
    const pos = componentPositions[ref];
    if (!pos || !panZoomInstance) return;

    panZoomInstance.zoom(6);
    panZoomInstance.pan({
        x: -pos.x * 6 + 400,
        y: -pos.y * 6 + 300
    });

    showComponent(ref);
}

function setupSearch() {
    const box = document.getElementById("searchBox");
    const resultsDiv = document.getElementById("searchResults");

    box.addEventListener("input", () => {
        const term = box.value.toUpperCase();
        resultsDiv.innerHTML = "";
        if (!term) return;

        const exactMatches = [];
const partialMatches = [];

Object.keys(BOM).forEach(ref => {
    const part = BOM[ref];
    const text = (ref + part.desc + part.value + part.mpn).toUpperCase();

    if (ref === term) {
        exactMatches.push(ref);
    } else if (text.includes(term)) {
        partialMatches.push(ref);
    }
});

// show exact match first
[...exactMatches, ...partialMatches].forEach(ref => {
    const part = BOM[ref];
    const item = document.createElement("div");
    item.innerText = ref + " — " + part.desc;
    item.style.cursor = "pointer";
    item.style.padding = "4px";
    item.onclick = () => zoomToComponent(ref);
    resultsDiv.appendChild(item);
});

    });
}

// -------- START APP --------
async function startApp() {
    await loadBOM();
    await loadSchematic();
    setupSearch();
}

startApp();
