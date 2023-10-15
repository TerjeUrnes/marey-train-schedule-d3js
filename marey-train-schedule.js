document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive') {
        initSchedule();
    }
});

var t79TS = {};

function initSchedule() {
    t79TS.d3OutputElm = document.getElementById("d3vis");
    createSchedule();
}

function createSchedule() {
    width = t79TS.d3OutputElm.clientWidth * 2;
    height = Math.floor(width * 0.66);

    var svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .attr("fill", "black")
        .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width/2)
            .attr("height", height);

    t79TS.d3OutputElm.appendChild(svg.node());
}