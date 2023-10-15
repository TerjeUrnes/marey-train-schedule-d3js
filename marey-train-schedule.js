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
        .append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", width/2 - 20)
            .attr("height", height - 20)
            .attr("style", "stroke:gray;fill:transparent;stroke-width:1");

    t79TS.d3OutputElm.appendChild(svg.node());
}