document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive') {
        initSchedule();
    }
});

var t79TS = {};

function initSchedule() {
    t79TS.d3OutputElm = document.getElementById("d3vis");
    openData();
}

function openData() {
    d3.csv("data/data.csv").then(
        (result) => { createSchedule(result); }
    );
}

function createSchedule(data) {

    width = t79TS.d3OutputElm.clientWidth * 2;
    height = Math.floor(width * 0.5);

    const maxDistance = d3.max(data, (d) => parseInt(d.distance));

    const y = d3.scaleLinear()
        .domain([0,maxDistance])
        .range([10,height - 10]);

    const x = d3.scaleLinear()
        .domain([0, 24*60])
        .range([10, width - 10]);

    var svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .attr("style", "stroke:gray")
        .selectAll("line")
        .data(x.ticks(24*6))
        .join("line")
            .attr("x1", (d) => x(d))
            .attr("x2", (d) => x(d))
            .attr("y1", 10)
            .attr("y2", height - 10)
            .attr("style", (d) => d % 12 == 0 ? "stroke-width:2;" : "stroke-width:1;");

    svg.append("g")
        .attr("style", "stroke:red;")
        .selectAll("line")
        .data(data)
        .join("line")
            .attr("x1", 10)
            .attr("x2", width - 10)
            .attr("y1", (d) => y(d.distance))
            .attr("y2", (d) => y(d.distance))


    var keys = Object.keys(data[0]);
    Object.keys(data[0]).forEach(element => {
        if (["station", "distance"].includes(element) == false) {
            
            const line = d3.line()
                .x(d => x((parseInt(d[element][0] + d[element][1]) * 60)+(parseInt(d[element][3] + d[element][4]))))
                .y(d => y(d.distance))

            svg.append("path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5)
                .attr("d", line(data));
        }
    });

    svg.append("g")
        .append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", width - 20)
            .attr("height", height - 20)
            .attr("style", "stroke:gray;fill:transparent;stroke-width:2");

    t79TS.d3OutputElm.appendChild(svg.node());
}