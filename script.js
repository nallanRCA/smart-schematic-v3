// ================================
// SMART SCHEMATIC CLEAN ENGINE
// ================================

let panZoomInstance = null;
let svgDoc = null;
let bomData = [];

fetch("data/bom.csv")
    .then(r => r.text())
    .then(csv => {

        const rows = csv.split(/\r?\n/).filter(r => r.trim());
        const headers = rows[0].split(",");

        for (let i = 1; i < rows.length; i++) {

            const values = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (!values) continue;

            const obj = {};
            headers.forEach((h, index) => {
                obj[h.trim()] = values[index]
                    ? values[index].replace(/^"|"$/g, "").trim()
                    : "";
            });

            bomData.push(obj);
        }

        console.log("BOM loaded:", bomData.length);
    });

const svgObject = document.getElementById("schematicImage");

svgObject.addEventListener("load", function () {

    svgDoc = svgObject.contentDocument;
    const svg = svgDoc.querySelector("svg");

    panZoomInstance = svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 20
    });

    // ================= ZOOM FUNCTION =================
    function zoomToComponent(target) {

        if (!target) return;

        const bbox = target.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;

        panZoomInstance.zoomAtPointBy(3, { x: cx, y: cy });
    }

    // ================= SEARCH =================
    window.searchComponent = function () {

        const input = document.getElementById("searchInput");
        const ref = input.value.trim().toUpperCase();
        if (!ref) return;

        let target = null;

        svgDoc.querySelectorAll("text").forEach(t => {
            if (t.textContent.trim().toUpperCase() === ref)
                target = t.closest("g");
        });

        if (!target) {
            alert("Component not found");
            return;
        }

        zoomToComponent(target);
    };

    // ================= SEARCH ENTER =================
    document.getElementById("searchInput")
        .addEventListener("keydown", function (e) {
            if (e.key === "Enter") searchComponent();
        });

    // ================= ZOOM BUTTONS =================
    document.getElementById("zoomIn").onclick = () => panZoomInstance.zoomIn();
    document.getElementById("zoomOut").onclick = () => panZoomInstance.zoomOut();
    document.getElementById("zoomReset").onclick = () => {
        panZoomInstance.resetZoom();
        panZoomInstance.center();
    };
    document.getElementById("fitScreen").onclick = () => {
        panZoomInstance.fit();
        panZoomInstance.center();
    };

    // ================= CLICK HANDLER =================
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
                p.Ref && p.Ref.trim().toUpperCase() === label
            );

            if (!part) {
                infoBox.innerHTML = `<h3>${label}</h3><p>No BOM data</p>`;
                return;
            }

            const ds = part.Datasheet && part.Datasheet.trim()
                ? part.Datasheet.trim()
                : null;

            infoBox.innerHTML = `
                <h3>${label}</h3>
                <p><b>Value:</b> ${part.Value}</p>
                <p><b>MPN:</b> ${part.MPN}</p>
                <p><b>Description:</b> ${part.Description}</p>
                ${ds ? `<a href="${ds}" target="_blank" class="dsBtn">📄 Open Datasheet</a>` : ""}
            `;

            zoomToComponent(t.closest("g"));
        });
    });

});