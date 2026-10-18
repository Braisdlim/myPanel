<script>
  let { name, size = 20, label = null } = $props();
  const paths = {
    plus: "M12 5v14M5 12h14",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.6-3.6",
    today: "M4 8h16M8 3v3M16 3v3M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM12 12.5v3",
    inbox: "M4 13l2.2-7.2A1 1 0 0 1 7.2 5h9.6a1 1 0 0 1 1 .8L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Zm0 0h4.5l1.5 2.5h4l1.5-2.5H20",
    check: "M5 12.5l4.2 4.2L19 7",
    clock: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 8v4.3l2.8 1.7",
    alert: "M12 4 2.8 19.5h18.4L12 4ZM12 10v4.2M12 17h.01",
    file: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5",
    mail: "M4 6h16v12H4zM4.5 6.5 12 13l7.5-6.5",
    chevron: "M9 6l6 6-6 6",
    down: "M6 9l6 6 6-6",
    x: "M6 6l12 12M18 6 6 18",
    repeat: "M17 2.5 20 5.5l-3 3M4 11v-1.5a4 4 0 0 1 4-4h12M7 21.5 4 18.5l3-3M20 13v1.5a4 4 0 0 1-4 4H4",
    moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z",
    sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
    pin: "M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    refresh: "M20 11a8 8 0 0 0-14.6-4.5M4 4v3.5h3.5M4 13a8 8 0 0 0 14.6 4.5M20 20v-3.5h-3.5",
    calendar: "M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM4 9h16M8 3v4M16 3v4",
    sun: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
    sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
    open: "M8 16 16 8M10 8h6v6",
    plan: "M4 6h16M4 12h10M4 18h7M17 15v6M14 18h6",
    layers: "M12 4 3 9l9 5 9-5-9-5ZM3 14l9 5 9-5",
    home: "M4 11 12 4l8 7M6 9.5V20h12V9.5",
    brain: "M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 4 3 3 0 0 0 6 0V6a2 2 0 0 0-4-1ZM15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 4 3 3 0 0 1-4 2",
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? "img" : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : "true"}
><path d={paths[name]} /></svg>
