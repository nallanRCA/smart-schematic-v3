// ================================
// SMART SCHEMATIC - CLEAN ENGINE
// ================================

let panZoomInstance = null;
let bomData = [];
let hideDNP = false;

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

        console.log("BOM Ready:", bomData.length);
    });

// ================= SVG LOAD =================
svgObject.addEventListener("load", function () {

    const svgDoc = svgObject.contentDocument;
    const svg = svgDoc.querySelector("svg");

    if (!svg) {
        console.log("SVG not found");
        return;
    }

    // 1️⃣ Initialize zoom
    panZoomInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 20
    });

    // 2️⃣ Auto-group components
    autoGroupComponents(svgDoc);

    // 3️⃣ Apply DNP state
    updateDNPVisibility(svgDoc);

    // 4️⃣ Enable component click
    enableComponentClick(svgDoc);

    console.log("Viewer Ready");
});

// ================= AUTO GROUP =================
function autoGroupComponents(svgDoc) {

    const texts = svgDoc.querySelectorAll("text");

    texts.forEach(t => {

        const ref = t.textContent.trim();
        if (!/^[A-Z]+\d+$/i.test(ref)) return;

        const bbox = t.getBBox();
        const padding = 40;

        const minX = bbox.x - padding;
        const minY = bbox.y - padding;
        const maxX = bbox.x + bbox.width + padding;
        const maxY = bbox.y + bbox.height + padding;

        const newGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
        newGroup.setAttribute("id", ref);

        const elements = svgDoc.querySelectorAll("path, line, rect, circle, polyline, polygon");

        elements.forEach(el => {

            const elBox = el.getBBox();
            const centerX = elBox.x + elBox.width / 2;
            const centerY = elBox.y + elBox.height / 2;

            if (
                centerX >= minX &&
                centerX <= maxX &&
                centerY >= minY &&
                centerY <= maxY
            ) {
                newGroup.appendChild(el);
            }
        });

        newGroup.appendChild(t);
        svgDoc.querySelector("svg").appendChild(newGroup);

    });

    console.log("Auto grouping complete");
}

// ================= DNP =================
function updateDNPVisibility(svgDoc) {

    console.log("Running DNP update");

    bomData.forEach(part => {

        console.log(part.Ref, part.DNP);

        const ref = part.Ref?.trim();
        const isDNP = ["YES","TRUE","1"].includes(
            part.DNP?.trim().toUpperCase()
        );

        console.log("Is DNP?", ref, isDNP);

        const element = svgDoc.getElementById(ref);

        if (element && isDNP) {
            element.style.display = hideDNP ? "none" : "inline";
            console.log("Toggled:", ref);
        }
    });
}

// ================= TOGGLE =================
document.getElementById("toggleDNP").addEventListener("click", function () {

    hideDNP = !hideDNP;

    const svgDoc = svgObject.contentDocument;
    updateDNPVisibility(svgDoc);

    
});

// ================= COMPONENT CLICK =================
function enableComponentClick(svgDoc) {

    const infoBox = document.getElementById("infoBox");

    svgDoc.querySelectorAll("g[id]").forEach(group => {

        const ref = group.getAttribute("id");

        group.style.cursor = "pointer";

        group.addEventListener("click", () => {

            const part = bomData.find(p =>
                p.Ref && p.Ref.trim().toUpperCase() === ref.toUpperCase()
            );

            if (!part) {
                infoBox.innerHTML = `<h3>${ref}</h3><p>No BOM Data</p>`;
                return;
            }

            infoBox.innerHTML = `
                <h3>${ref}</h3>
                <p><b>Value:</b> ${part.Value}</p>
                <p><b>MPN:</b> ${part.MPN}</p>
                <p><b>Description:</b> ${part.Description}</p>
            `;
        });
    });
}