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
            image: cols[5]?.trim(),
            dnp: cols[6]?.trim().toUpperCase() === "YES"
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
        maxZoom: 20,
        panEnabled: true,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: false,
        touchEnabled: true
    });

    setTimeout(createClickTargets, 800);
}

// -------- CREATE CLICK TARGETS --------
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
// ⭐ DNP overlay circle (bigger)
const dnpCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
dnpCircle.setAttribute("cx", componentPositions[ref].x);
dnpCircle.setAttribute("cy", componentPositions[ref].y);
dnpCircle.setAttribute("r", 18);
dnpCircle.setAttribute("fill", "rgba(255,0,0,0.4)");

dnpCircle.setAttribute("data-ref", ref);
dnpCircle.classList.add("dnp-overlay");

viewport.appendChild(dnpCircle);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", componentPositions[ref].x);
        circle.setAttribute("cy", componentPositions[ref].y);
        circle.setAttribute("r", 6);
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("data-ref", ref);
        circle.classList.add("dnp-target");
        circle.style.cursor = "pointer";

        circle.addEventListener("click", (e) => {
            e.stopPropagation();
            showComponent(ref);
        });

        viewport.appendChild(circle);
    });

    updateDNPVisibility();
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

        Object.keys(BOM).forEach(ref => {
            const part = BOM[ref];
            const text = (ref + part.desc + part.value + part.mpn).toUpperCase();

            if (text.includes(term)) {
                const item = document.createElement("div");
                item.innerText = ref + " — " + part.desc;
                item.style.cursor = "pointer";
                item.style.padding = "4px";
                item.onclick = () => zoomToComponent(ref);
                resultsDiv.appendChild(item);
            }
        });
    });
}

// -------- DNP FEATURE --------
function updateDNPVisibility() {
    const toggle = document.getElementById("dnpToggle");
    if (!toggle) return;

    const showDNP = toggle.checked;
    const descs = document.querySelectorAll("desc");

    descs.forEach(desc => {
        const ref = desc.textContent.trim().toUpperCase();
        const part = BOM[ref];
        if (!part) return;

        // climb up until top component group
        let group = desc.parentElement;
        while (group && group.parentElement && group.parentElement.tagName !== "svg") {
            group = group.parentElement;
        }

        if (!group) return;

        if (part.dnp && !showDNP) {
            group.style.opacity = "0.15";   // fade whole component
        } else {
            group.style.opacity = "1";
        }
    });
}


function setupDNPToggle() {
    const toggle = document.getElementById("dnpToggle");
    if (toggle) toggle.addEventListener("change", updateDNPVisibility);
}

// -------- START APP --------
async function startApp() {
    await loadBOM();
    await loadSchematic();
    setupSearch();
    setupDNPToggle();
}

startApp();
