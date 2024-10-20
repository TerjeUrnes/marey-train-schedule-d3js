

export class MareyTrainSchedule {

    _visElm;
    _data;
    _svg;
    _timeScale;
    _distScale;
    _width;
    _height;
    _verticalLines
    _horizontalLines;
    _trainLines;
    _chartFrame;

    constructor() {
        this._visElm = document.getElementById("d3vis");
        this.LoadDataAndDraw();

        window.addEventListener("resize", () => {
            this.RedrawSchedule().bind(this);
        });
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
        this.SetSvgSize();
        this.MakeGroups();
        this.MakeGrid();
        this.DrawTrainLines();
        this.DrawFrame();
        this._visElm.appendChild(this._svg.node());
    }

    RedrawSchedule() {
        this.SetWidthAndHeight();
        this.MakeLinearScales();
        this.SetSvgSize();
        this.MakeGrid();
        this.DrawTrainLines();
        this.DrawFrame();
    }

    CleanData() {

        let data = this._data;

        Object.keys(data[0]).forEach(track => {
            if (["station", "distance"].includes(track) == false) {
                for (let i = 0; i < data.length; i++) {

                    let time = (parseInt(data[i][track][0] + data[i][track][1]) * 60) + 
                            parseInt(data[i][track][3] + data[i][track][4]);
                    
                    data[i][track] = { "time": time, "distance": data[i]["distance"]};
                }

                let passesMidnight = false;
                let index = 0;
                for (let i = 0; i < data.length-1; i++) {
                    if (Math.abs(data[i][track]["time"] - data[i + 1][track]["time"]) > 800) {
                        passesMidnight = true;
                        index = i;
                    }
                }

                let track2 = "e" + track;

                if (passesMidnight) {
                    for (let i = 0; i <= index - 1; i++) {
                        data[i][track2] = { "time": NaN, "distance": NaN};
                    }

                    let crossing = this.FindMidnightCrossing(
                        data[index][track]["time"],
                        data[index][track]["distance"],
                        data[index + 1][track]["time"],
                        data[index + 1][track]["distance"]
                    );

                    data[index][track2] = { "time": crossing["time1"], "distance": crossing["distance"]};
                    data[index + 1][track2] = data[index + 1][track];

                    data[index + 1][track] = { "time": crossing["time2"], "distance": crossing["distance"]};

                    for (let i = index + 2; i < data.length; i++) {
                        data[i][track2] = data[i][track];
                        data[i][track] = { "time": NaN, "distance": NaN};
                    }

                }
            }
        });
    }

    FindMidnightCrossing(startTime, startDistance, endTime, endDistance) {

        let startIsLeft = true;
        let distance = 0;

        let dTime = 0;
        let dDistance = 0;
        let slope = 0;
        let newDDistance = 0;
        if (startTime > endTime) {
            dTime = endTime + 1440 - startTime;
            startIsLeft = false;
            dDistance = startDistance - endDistance;
            slope = dDistance / dTime;
            newDDistance = (slope * (1440 - startTime));
        }
        else {
            dTime = startTime + 1440 - endTime;
            dDistance = startDistance - endDistance;
            slope = dDistance / dTime;
            newDDistance = (slope * startTime);
        }
        
        distance = slope < 0 ? startDistance - newDDistance : startDistance + newDDistance;

        return {
            "time1": startIsLeft ? 1440 : 0,
            "time2": startIsLeft ? 0 : 1440,
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
        this._svg = d3.create("svg");
    }

    SetSvgSize() {
        this._svg
            .attr("width", this._width)
            .attr("height", this._height)
            .attr("viewBox", [0, 0, this._width, this._height]);
    }

    MakeGroups() {
        this._verticalLines = this._svg.append("g")
                    .attr("style", "stroke:red");
        this._horizontalLines = this._svg.append("g")
                    .attr("style", "stroke:gray");
        this._trainLines = this._svg.append("g");
        this._chartFrame = this._svg.append("g");
    }

    MakeGrid() {
        this.MakeVerticalLines();
        this.MakeHorizontalLines();
    }

    MakeVerticalLines() {
        this._verticalLines.selectAll("line")
            .data(this._data)
            .join("line")
                .attr("x1", 10)
                .attr("x2", this._width - 10)
                .attr("y1", (d) => this._distScale(d.distance))
                .attr("y2", (d) => this._distScale(d.distance))
                .attr("style", "stroke-width:1;");
    }

    MakeHorizontalLines() {
        this._horizontalLines.selectAll("line")
            .data(this._timeScale.ticks(24*6))
            .join("line")
                .attr("x1", (d) => this._timeScale(d))
                .attr("x2", (d) => this._timeScale(d))
                .attr("y1", 10)
                .attr("y2", this._height - 10)
                .attr("style", (d) => d % 12 == 0 ? "stroke-width:2;" : "stroke-width:1;");
    }

    DrawTrainLines() {

        const lines = [];

        Object.keys(this._data[0]).forEach(track => {
            if (["station", "distance"].includes(track) == false) {
                
                const line = d3.line()
                    .defined(d => !isNaN(d[track]["time"]) && !isNaN(d[track]["distance"]))
                    .x(d => this._timeScale(d[track]["time"]))
                    .y(d => this._distScale(d[track]["distance"]))

                lines.push(line);
            }
        });

        this._trainLines.selectAll("path")
            .data(lines)
            .join("path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 3)
                .attr("d", d => d(this._data));

    }

    DrawFrame() {
        this._chartFrame.selectAll("rect")
            .data([0])
            .join("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", this._width - 20)
            .attr("height", this._height - 20)
            .attr("style", "stroke:black;fill:transparent;stroke-width:4");
    }
}