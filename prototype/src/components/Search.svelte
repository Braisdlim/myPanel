<script>
  import Icon from "./Icon.svelte";
  import AccountTag from "./AccountTag.svelte";
  import { searchResults, searchCoverage, searchQuery } from "../data/demo.js";
  import { ui, showToast } from "../lib/ui.svelte.js";

  let { withInput = true, compact = false } = $props();
  let q = $state(searchQuery);
  let filter = $state("todo");

  const certaintyLabel = { alta: "Muy probable", media: "Posible", baja: "Poco probable" };
  const certaintyLevel = { alta: 3, media: 2, baja: 1 };
  const sourceName = { drive: "Drive", gmail: "Gmail" };

  const results = $derived(
    ui.estado === "vacio" || !q.trim() ? [] : searchResults.filter((r) => filter === "todo" || r.source === filter)
  );
</script>

<div class="search" class:compact>
  {#if withInput}
    <div class="field">
      <Icon name="search" size={18} />
      <label class="sr-only" for="q">Buscar en tus cuentas</label>
      <input id="q" bind:value={q} placeholder="Busca un documento, correo o tarea" autocomplete="off" enterkeyhint="search" />
    </div>
  {/if}

  <div class="filters" role="group" aria-label="Filtrar por origen">
    {#each [["todo", "Todo"], ["drive", "Drive"], ["gmail", "Gmail"]] as [id, name]}
      <button class:on={filter === id} aria-pressed={filter === id} onclick={() => (filter = id)}>{name}</button>
    {/each}
  </div>

  {#if ui.estado === "cargando"}
    <p class="status" role="status"><span class="spin" aria-hidden="true"></span>Buscando en Drive y Gmail…</p>
  {:else if ui.estado === "error"}
    <div class="warn" role="alert"><Icon name="alert" size={16} /><span>Drive de Secundaria no respondió. Los resultados pueden estar incompletos.</span><button class="link" onclick={() => showToast("Reintentando…")}>Reintentar</button></div>
  {/if}

  {#if ui.estado !== "cargando"}
    {#if results.length}
      <p class="count">{results.length} posibles resultados para «{q}»</p>
      <ul class="results">
        {#each results as r}
          <li class="result">
            <span class="src" aria-hidden="true"><Icon name={r.source === "drive" ? "file" : "mail"} size={18} /></span>
            <div class="info">
              <a class="name" href="#abrir" onclick={(e) => { e.preventDefault(); showToast(`Se abriría en ${sourceName[r.source]}`); }}>{r.name}</a>
              <p class="where">{sourceName[r.source]}, {r.location}</p>
              <div class="meta">
                <AccountTag id={r.account} />
                <span class="num">{r.date}</span>
              </div>
              {#if !compact}<p class="why">{r.why}</p>{/if}
            </div>
            <span class="certainty c-{r.certainty}" title={r.why}>
              <span class="bars" aria-hidden="true">{#each [1, 2, 3] as n}<i class:on={n <= certaintyLevel[r.certainty]}></i>{/each}</span>
              {certaintyLabel[r.certainty]}
            </span>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="none">
        <p class="none-title">No he encontrado nada para «{q}»</p>
        <p class="none-text">Prueba con otra palabra, como «currículum», o busca en una cuenta que aún no esté conectada.</p>
      </div>
    {/if}
    <p class="coverage">
      He buscado en {searchCoverage.searched.join(", ")}. No he buscado en {searchCoverage.notSearched[0].what} porque {searchCoverage.notSearched[0].why}.
    </p>
  {/if}
</div>

<style>
  .search { display: grid; gap: var(--s4); }
  .field { display: flex; align-items: center; gap: var(--s3); min-height: 52px; padding: 0 var(--s4); border-radius: var(--r-row); background: var(--surface-1); border: 1px solid var(--line); color: var(--text-3); }
  .field:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
  .field input { flex: 1; border: 0; background: none; outline: none; min-height: 48px; color: var(--text); font-size: 17px; }
  .filters { display: flex; gap: var(--s2); }
  .filters button { min-height: 36px; padding: 0 var(--s4); border-radius: var(--r-pill); border: 1px solid var(--line-strong); background: none; font-size: var(--fs-meta); font-weight: var(--w-medium); color: var(--text-2); }
  .filters button.on { background: var(--text); color: var(--bg); border-color: var(--text); }
  .count { margin: 0; font-size: var(--fs-meta); color: var(--text-3); padding-left: var(--s1); }
  .results { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s1); }
  .result { display: grid; grid-template-columns: 36px 1fr auto; gap: var(--s3); padding: var(--s3) var(--s3) var(--s3) var(--s2); border-radius: var(--r-row); align-items: start; }
  .result:first-child { background: var(--surface-1); }
  .src { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: var(--surface-3); color: var(--text-2); }
  .info { min-width: 0; display: grid; gap: 3px; }
  .name { color: var(--text); font-weight: var(--w-medium); text-decoration: none; overflow-wrap: anywhere; min-height: 24px; }
  .name:hover { text-decoration: underline; text-underline-offset: 3px; }
  .where { margin: 0; font-size: var(--fs-meta); line-height: var(--lh-meta); color: var(--text-2); overflow-wrap: anywhere; }
  .meta { display: flex; gap: var(--s3); align-items: center; font-size: var(--fs-small); color: var(--text-3); }
  .why { margin: 2px 0 0; font-size: var(--fs-small); color: var(--text-3); }
  .certainty { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-small); font-weight: var(--w-medium); color: var(--text-2); white-space: nowrap; padding-top: 2px; }
  .bars { display: inline-flex; gap: 2px; align-items: flex-end; }
  .bars i { width: 3px; border-radius: 2px; background: var(--line-strong); }
  .bars i:nth-child(1) { height: 6px; } .bars i:nth-child(2) { height: 9px; } .bars i:nth-child(3) { height: 12px; }
  .c-alta .bars i.on { background: var(--ok); }
  .c-media .bars i.on { background: var(--attention); }
  .c-baja .bars i.on { background: var(--text-3); }
  .coverage { margin: 0; font-size: var(--fs-small); line-height: var(--lh-small); color: var(--text-3); padding: var(--s3) var(--s1) 0; border-top: 1px solid var(--line); }
  .status { margin: 0; display: flex; gap: var(--s3); align-items: center; color: var(--text-2); }
  .spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--line-strong); border-top-color: var(--accent); animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .warn { display: flex; gap: var(--s2); align-items: center; flex-wrap: wrap; padding: var(--s3); border-radius: var(--r-chip); background: var(--danger-soft); font-size: var(--fs-meta); }
  .warn :global(svg) { color: var(--danger); }
  .link { background: none; border: 0; padding: 0; color: var(--accent-text); font-weight: var(--w-strong); margin-left: auto; min-height: 32px; }
  .none { padding: var(--s6) var(--s1); }
  .none-title { margin: 0; font-weight: var(--w-strong); font-size: var(--fs-title); }
  .none-text { margin: var(--s2) 0 0; color: var(--text-2); max-width: 44ch; }
  @media (max-width: 480px) {
    .result { grid-template-columns: 36px 1fr; row-gap: 6px; }
    .certainty { grid-column: 2; grid-row: 2; padding-top: 0; }
  }
</style>
