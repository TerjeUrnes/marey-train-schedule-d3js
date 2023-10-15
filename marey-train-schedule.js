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
    d3.csv("data/distance.csv").then(
        (result) => { createSchedule(result); }
    );
}

function createSchedule(data) {

    if (data != null) {
        t79TS.data = data;
    }
    else {
        data = t79TS.data;
    }

    width = t79TS.d3OutputElm.clientWidth * 2;
    height = Math.floor(width * 0.66);

    console.log(data);
    const maxDistance = d3.max(data, (d) => parseInt(d.distance));
    console.log(maxDistance);

    const y = d3.scaleLinear()
        .range([0,maxDistance])
        .domain([10,height - 20])

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