let BOM = {};
let componentPositions = {};
let panZoomInstance;
let zoomLevel = 1.5; // default zoom (1 = 100%)
let panZoomInstance;

window.addEventListener("load", () => {

    const obj = document.getElementById("schematicObj");

    obj.addEventListener("load", () => {

        const svgDoc = obj.contentDocument;
        const svg = svgDoc.querySelector("svg");

        svg.setAttribute("id", "schematicSVG");

        panZoomInstance = svgPanZoom(svg, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true
        });

        setTimeout(() => {
            panZoomInstance.zoomBy(2.2);
        }, 500);

        console.log("Pan & Zoom Ready");

        // ⭐ NOW that SVG is ready, create click targets
        createClickTargets();
    });

});



// -------- CLICK TARGETS --------
function createClickTargets() {
    const svgDoc = document.getElementById("schematicObj").contentDocument;
const viewport = svgDoc.querySelector(".svg-pan-zoom_viewport");
const descs = svgDoc.querySelectorAll("desc");
const svgDoc = document.getElementById("schematicObj").contentDocument;
const viewport = svgDoc.querySelector(".svg-pan-zoom_viewport");
const descs = svgDoc.querySelectorAll("desc");


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

    //panZoomInstance.zoom(6);
    //panZoomInstance.pan({
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


