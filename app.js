let BOM = {};
let componentPositions = {};
let panZoomInstance;
let zoomLevel = 1.5; // default zoom (1 = 100%)


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
let panZoomInstance;

function loadSchematic() {
    fetch("data/schematic.svg")


        .then(res => res.text())
        .then(svgText => {

            const container = document.getElementById("schematicContainer");
            container.innerHTML = svgText;

            const svg = container.querySelector("svg");

            // Give SVG an id so library can control it
            svg.setAttribute("id", "schematicSVG");

            // --- Initialize viewer ---
            panZoomInstance = svgPanZoom("#schematicSVG", {
                zoomEnabled: true,
                controlIconsEnabled: true,
                minZoom: 0.5,
                maxZoom: 20,
                panEnabled: true,
                dblClickZoomEnabled: true,
                mouseWheelZoomEnabled: true,
                preventMouseEventsDefault: false,
                touchEnabled: true,
                fit: true,
                center: true
            });

            // 🔥 DESKTOP STARTUP ZOOM (guaranteed working)
            setTimeout(() => {
                panZoomInstance.zoomBy(2.5); // BIG readable start
            }, 500);

            // your existing feature
            setTimeout(createClickTargets, 800);
        });
}

// Run when page loads
window.addEventListener("load", loadSchematic);

    panZoomInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: false,
        center: false,

        minZoom: 0.5,
        maxZoom: 20,
        panEnabled: true,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: false,
        touchEnabled: true
    });

    // ⭐ REAL STARTUP VIEW
setTimeout(() => {
    panZoomInstance.resize();   // recalc viewer size
    panZoomInstance.fit();      // fit once
    panZoomInstance.center();   // center once
    panZoomInstance.zoomBy(2.2); // 🔥 BIG zoom (this is the magic)
}, 300);

}
panZoomInstance = svgPanZoom(svg, {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: false,
    center: false,
    minZoom: 0.5,
    maxZoom: 20,
    panEnabled: true,
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: false,
    touchEnabled: true,

    // ⭐ RUN ONLY WHEN VIEWER IS READY
    onUpdatedCTM: function () {
        // run once only
        if (!panZoomInstance.startupZoomDone) {
            panZoomInstance.startupZoomDone = true;

            panZoomInstance.resize();
            panZoomInstance.fit();
            panZoomInstance.center();
            panZoomInstance.zoomBy(2.5); // big readable zoom
        }
    }
});



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

// -------- START --------
window.addEventListener("load", async () => {
    await loadBOM();
    await loadSchematic();
    setupSearch();
});
