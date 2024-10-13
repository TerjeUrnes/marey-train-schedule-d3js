

export class MareyTrainSchedule {

    _visElm;
    _data;
    _svg;
    _timeScale;
    _distScale;
    _width;
    _height;

    constructor() {
        this._visElm = document.getElementById("d3vis");
        this.LoadDataAndDraw();
    }

    LoadDataAndDraw() {
        d3.csv("data/data.csv").then(
            (result) => { this.CreateSchedule(result); }
        );
    }

    CreateSchedule(data) {
        this._data = data;
        this.CleanData();

        this.SetWidthAndHeight();
        this.MakeLinearScales();
        this.MakeSvg();
        this.MakeGrid();
        this.DrawTrainLines();

        this.DrawFrame();
        this._visElm.appendChild(this._svg.node());
    }

    CleanData() {

        let data = this._data;

        Object.keys(data[0]).forEach(element => {
            if (["station", "distance"].includes(element) == false) {
                for (let i = 0; i < data.length; i++) {

                    let time = (parseInt(data[i][element][0] + data[i][element][1]) * 60) + 
                            parseInt(data[i][element][3] + data[i][element][4]);
                    
                    data[i][element] = { "time": time, "distance": data[i]["distance"]};
                }

                let passesMidnight = false;
                let index = 0;
                for (let i = 0; i < data.length-1; i++) {
                    if (Math.abs(data[i][element]["time"] - data[i + 1][element]["time"]) > 800) {
                        passesMidnight = true;
                        index = i;
                    }
                }

                let element2 = "e" + element;

                if (passesMidnight) {
                    for (let i = 0; i <= index - 1; i++) {
                        data[i][element2] = { "time": NaN, "distance": NaN};
                    }

                    let crossing = this.FindMidnightCrossing(
                        data[index][element]["time"],
                        data[index][element]["distance"],
                        data[index + 1][element]["time"],
                        data[index + 1][element]["distance"]
                    );

                    data[index][element2] = { "time": crossing["time1"], "distance": crossing["distance"]};

                    data[index][element] = { "time": crossing["time2"], "distance": crossing["distance"]};

                    for (let i = index + 1; i < data.length; i++) {
                        data[i][element2] = data[i][element];
                        data[i][element] = { "time": NaN, "distance": NaN};
                    }

                }
            }
        });
    }

    FindMidnightCrossing(startTime, startDistance, endTime, endDistance) {

        let startIsLeft = true;
        let distance = 0;

        if (startTime > endTime) {
            startIsLeft = false;
            if (startDistance < endDistance) {
                let dTime = endTime + 1440 - startTime;
                let dDistance = endDistance - startDistance;
                let slope = dDistance / dTime;
                let newDDistance = (slope * (1440 - startTime));
                distance = slope < 0 ? endDistance - newDDistance : endDistance + newDDistance;
            }
            else {
                let dTime = endTime + 1440 - startTime;
                let dDistance = startDistance - endDistance;
                let slope = dDistance / dTime;
                let newDDistance = (slope * (1440 - startTime));
                distance = slope < 0 ? startDistance - newDDistance : startDistance + newDDistance;
            }
        }
        else {
            if (startDistance < endDistance) {
                let dTime = endTime - 1440 - startTime;
                let dDistance = endDistance - startDistance;
                let slope = dDistance / dTime;
                let newDDistance = (slope * (1440 - startTime));
                distance = slope < 0 ? endDistance - newDDistance : endDistance + newDDistance;
            }
            else {
                let dTime = endTime - 1440 - startTime;
                let dDistance = startDistance - endDistance;
                let slope = dDistance / dTime;
                let newDDistance = (slope * (1440 - startTime));
                distance = slope < 0 ? startDistance - newDDistance : startDistance + newDDistance;
            }
        }

        return {
            "time1": startIsLeft ? endTime : 0,
            "time2": startIsLeft ? endTime : 1440,
            "distance": distance
        }
    }

    SetWidthAndHeight() {
        this._width =  this._visElm.clientWidth * 2;
        this._height = Math.floor(this._width / 2)
    }

    MakeLinearScales() {
        const maxDistance = d3.max(this._data, (d) => parseInt(d.distance));

        this._timeScale = d3.scaleLinear()
            .domain([0, 24*60])
            .range([10, this._width - 10]);
        this._distScale = d3.scaleLinear()
            .domain([0, maxDistance])
            .range([10, this._height - 10]);
    }

    MakeSvg() {
        this._svg = d3.create("svg")
            .attr("width", this._width)
            .attr("height", this._height)
            .attr("viewBox", [0, 0, this._width, this._height]);
    }

    MakeGrid() {
        this.MakeVerticalLines();
        this.MakeHorizontalLines();
    }

    MakeVerticalLines() {
        this._svg.append("g")
            .attr("style", "stroke:red")
            .selectAll("line")
            .data(this._data)
            .join("line")
                .attr("x1", 10)
                .attr("x2", this._width - 10)
                .attr("y1", (d) => this._distScale(d.distance))
                .attr("y2", (d) => this._distScale(d.distance))
                .attr("style", "stroke-width:1;");
    }

    MakeHorizontalLines() {
        this._svg.append("g")
            .attr("style", "stroke:gray")
            .selectAll("line")
            .data(this._timeScale.ticks(24*6))
            .join("line")
                .attr("x1", (d) => this._timeScale(d))
                .attr("x2", (d) => this._timeScale(d))
                .attr("y1", 10)
                .attr("y2", this._height - 10)
                .attr("style", (d) => d % 12 == 0 ? "stroke-width:2;" : "stroke-width:1;");
    }

    DrawTrainLines() {
        Object.keys(this._data[0]).forEach(element => {
            if (["station", "distance"].includes(element) == false) {
                
                const line = d3.line()
                    .defined(d => !isNaN(d[element]["time"]))
                    .x(d => this._timeScale(d[element]["time"]))
                    .y(d => this._distScale(d[element]["distance"]))
    
                this._svg.append("path")
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 2.5)
                    .attr("d", line(this._data));
            }
        });
    }

    DrawFrame() {
        this._svg.append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", this._width - 20)
            .attr("height", this._height - 20)
            .attr("style", "stroke:black;fill:transparent;stroke-width:4");
    }
}