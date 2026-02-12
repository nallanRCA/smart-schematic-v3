# Smart Schematic V3
### Interactive BOM-Driven Schematic Viewer

## Overview
Smart Schematic V3 is a web-based interactive schematic viewer that links electronic schematics with Bill of Materials (BOM) data, datasheets and component images.

The tool transforms a static schematic into a searchable, interactive engineering interface.

This project was developed as an exploratory research prototype in Electronic Engineering (EEE).

---

## Motivation
Traditional schematic PDFs are static and difficult to navigate.

Engineers must manually:
• Search BOM spreadsheets  
• Open datasheets separately  
• Visually scan schematics  

This project explores how web technologies can turn schematics into **interactive engineering tools**.

---

## Key Features
• Zoomable & pannable schematic viewer  
• Click any component to view BOM data  
• Datasheet links and component images  
• Intelligent search with auto-zoom  
• Local offline operation (no cloud required)

---

## How It Works
Pipeline:
KiCad → SVG export → Smart Schematic Viewer

The application parses:
• SVG schematic  
• BOM CSV  

and dynamically links components using reference designators.

---

## Research Value
This prototype demonstrates how manufacturing, repair and failure analysis workflows can be improved by linking design data directly with documentation.

Potential applications:
• Manufacturing troubleshooting  
• Quality & failure analysis  
• Engineering training  
• Technical documentation systems  

---

## Run Locally
