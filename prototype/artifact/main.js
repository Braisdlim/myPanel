// Entrada para empaquetar el prototipo como una sola página (visor de artefactos de claude.ai).
import "./fonts.css";
import "../src/styles/tokens.css";
import "../src/styles/global.css";
import { mount } from "svelte";
import App from "../src/components/App.svelte";

mount(App, { target: document.getElementById("app") });
