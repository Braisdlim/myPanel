<script>
  import { ICONOS } from "../lib/iconos.js";
  let { n, tam = 16, clase = "", estilo = "" } = $props();
</script>

<svg class="pa-icon {clase}" style="width: {tam}px; height: {tam}px; {estilo}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html ICONOS[n] ?? ""}</svg>
