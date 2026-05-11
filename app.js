const parseDate = d3.timeParse("%Y-%m-%d");
const formatDate = d3.timeFormat("%d/%m");

function createChart(containerId, data, config) {
  const container = d3.select(containerId);
  container.selectAll("*").remove();

  const width = container.node().clientWidth;
  const height = 320;
  const margin = { top: 24, right: 20, bottom: 36, left: 42 };

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d3.max(config.yKeys.map(key => d[key])))]).nice()
    .range([height - margin.bottom, margin.top]);

  const xAxis = g =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(formatDate).ticks(5))
      .call(g => g.select(".domain").remove());

  const yAxis = g =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
      .call(g => g.select(".domain").remove());

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("padding", "10px")
    .style("background", "#0f1724")
    .style("border", "1px solid rgba(148,163,184,0.25)")
    .style("border-radius", "8px")
    .style("color", "#c9d1d9")
    .style("font-size", "0.9rem");

  const line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);

  config.yKeys.forEach((key, index) => {
    const color = config.colors[index];
    const series = data.map(d => ({ date: d.date, value: d[key], label: config.labels[index] }));

    if (config.type === "line") {
      svg
        .append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("d", line);

      svg
        .selectAll(`.dot-${key}`)
        .data(series)
        .join("circle")
        .attr("class", `dot-${key}`)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 5)
        .attr("fill", color)
        .on("mouseenter", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`${formatDate(d.date)}<br>${d.label}: ${d.value}`);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));
    }

    if (config.type === "bar") {
      const barWidth = (width - margin.left - margin.right) / data.length / config.yKeys.length;
      svg
        .selectAll(`.bar-${key}`)
        .data(series)
        .join("rect")
        .attr("class", `bar-${key}`)
        .attr("x", d => x(d.date) - (config.yKeys.length / 2 - index) * barWidth)
        .attr("y", d => y(d.value))
        .attr("width", barWidth * 0.9)
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", color)
        .attr("opacity", 0.85)
        .on("mouseenter", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`${formatDate(d.date)}<br>${d.label}: ${d.value}`);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", `${event.pageX + 12}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));
    }
  });
}

fetch("data.json")
  .then(response => response.json())
  .then(payload => {
    const data = payload.metrics.map(item => ({
      ...item,
      date: parseDate(item.date)
    }));

    createChart("#commits-chart", data, {
      type: "line",
      yKeys: ["commits"],
      labels: ["Commits"],
      colors: [getComputedStyle(document.documentElement).getPropertyValue("--info").trim() || "#79c0ff"]
    });

    createChart("#diff-chart", data, {
      type: "bar",
      yKeys: ["additions", "deletions"],
      labels: ["Adições", "Remoções"],
      colors: [getComputedStyle(document.documentElement).getPropertyValue("--success").trim() || "#3fb950", getComputedStyle(document.documentElement).getPropertyValue("--danger").trim() || "#ff6b6b"]
    });

    createChart("#issues-chart", data, {
      type: "line",
      yKeys: ["issuesOpened", "issuesClosed"],
      labels: ["Issues abertas", "Issues fechadas"],
      colors: ["#8ab4f8", "#f58a8a"]
    });

    createChart("#chars-chart", data, {
      type: "line",
      yKeys: ["charCountAverage"],
      labels: ["Média de caracteres"],
      colors: [getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#58a6ff"]
    });
  })
  .catch(error => {
    d3.select("body")
      .append("div")
      .attr("class", "error-message")
      .text("Erro ao carregar os dados do dashboard.");
    console.error(error);
  });
