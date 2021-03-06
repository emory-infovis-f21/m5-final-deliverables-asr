var width = 700;
var height = 500;
var barWidth = 50;
var barGap = 10;
var barHeightMultiplier = 10;
var margin = {left:50, right:50, top:50, bottom:50};
var parseDate = d3.timeParse("%Y");
var yearArray = [2016, 2017, 2018, 2019, 2020];
var currentState = "Alaska";


const states = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "District of Columbia",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North Carolina",
    "North Dakota",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "Nevada",
    "New York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Vermont",
    "Washington",
    "Wisconsin",
    "West Virginia",
    "Wyoming"
];

// Load the data
d3.csv("assets/data/aggregate_states.csv")
    .row (function (d) {
        return {
            date: parseDate(d.Year),
            state: d.STATE,
            aqi: Number(d.yearly_aqi_value)};
    })
    .get(function (error, data) {
            if (error) {
                throw error;
            }

            initialize(0);


            function initialize(param) {
                // Setup the visualization before user interaction
                var minVal = d3.min(data.filter(function (d) {
                    return d.state === currentState;
                }), function (d) {
                    return d.aqi;
                });

                var maxVal = d3.max(data.filter(function (d) {
                    return d.state === currentState;
                }), function (d) {
                    return d.aqi;
                });
                var minDate = d3.min(data.filter(function (d) {
                    return d.state === currentState;
                }), function (d) {
                    return d.date;
                });
                var maxDate = d3.max(data.filter(function (d) {
                    return d.state === currentState;
                }), function (d) {
                    return d.date;
                });

                var redcolorscale = d3.scaleSequential(d3.interpolateReds).domain([minVal, maxVal]);
                var tooltip = d3.select("body").append("div").style("opacity", "0").style("position", "absolute");

                // Populate the dropdown menu
                d3.select('select.state')
                    .on('change', () => update())
                    .selectAll('option')
                    .data(states)
                    .enter()
                    .append('option')
                    .attr('value', function (d) {
                        return d;
                    })
                    .text(function (d) {
                        return d;
                    });

                var y = d3.scaleLinear()
                    .domain([0, maxVal])
                    .range([height - 2 * margin.bottom, 0]);

                // var x = d3.scaleTime()
                //   .domain([minDate, maxDate])
                //   .range([0, width]);

                var x = d3.scaleBand()
                    .domain(yearArray)
                    .range([0, width])
                    .paddingInner((yearArray.length - 1) * barGap / (width));

                var yAxis = d3.axisLeft(y);
                var xAxis = d3.axisBottom(x);


                var svg = d3.select("#bar_chart")
                    .attr("width", width).attr("height", height);

                // check if I should remove everything
                console.log(param);
                if (param === 1) {
                    svg.selectAll("*").remove();
                }


                var chartGroup = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                chartGroup.append("g").attr("class", "y axis").call(yAxis);
                chartGroup.append("g").attr("class", "x axis")
                    .attr("transform", "translate(0," + (height - 2 * margin.top) + ")") // this should be just height
                    .call(xAxis);
                chartGroup.append("text")
                    .attr("class", "y text")
                    .attr("x", -3*height/7)
                    .attr("y", -2*margin.left/3)
                    .attr("transform", "rotate(270)")
                    .text("Yearly AQI");
                chartGroup.append("text")
                    .attr("class", "x text")
                    .attr("x", width/2)
                    .attr("y", height - margin.top)
                    .text("Year");


                chartGroup.selectAll("rect")
                    .data(data.filter(function (d) {
                        return d.state === currentState;
                    }))
                    .enter()
                    .append("rect")
                    .attr("height", function (d, i) {
                        return d.aqi * barHeightMultiplier;
                    })
                    .attr("width", barWidth)
                    .attr("fill", function (d, i) {
                        return redcolorscale(d.aqi);
                    })
                    .attr("x", function (d, i) {
                        return i * (1.05*x.bandwidth()) + margin.left;
                    })
                    .attr("y", function (d, i) {
                        return height - (d.aqi * barHeightMultiplier + 2 * margin.bottom);
                    })
                    .on("mouseover", function (d) {
                        tooltip.style("opacity", "1")
                            .style("left", d3.event.pageX + "px")
                            .style("top", d3.event.pageY + "px")
                            .style("background", "lightblue");

                        tooltip.html("AQI: " + d.aqi.toFixed(3));
                    })
                    .on("mouseout", function () {
                        tooltip.style("opacity", "0");
                    });

                // This is attempting to fix the y scaling of the bars
                // chartGroup.selectAll("rect")
                // .data(data.filter(function (d) {
                //   return d.state === currentState;
                // }))
                //         .enter()
                //         .append("rect")
                //         .attr("height", function (d, i) { return d.aqi * barHeightMultiplier; })
                //         .attr("width", barWidth)
                //         .attr("fill", function(d,i) { return redcolorscale(d.aqi); })
                //         .attr("x", function(d,i) { return i * (1.05*x.bandwidth()) + margin.left; })
                //         .attr("y", function(d,i) { return height - (d.aqi * barHeightMultiplier + 2 * margin.bottom); })
                // .on("mouseover", function (d) {
                //             tooltip.style("opacity", "1")
                //                     .style("left", d3.event.pageX + "px")
                //                     .style("top", d3.event.pageY + "px")
                //                     .style("background", "lightblue");
                //
                //             tooltip.html("AQI: " + d.aqi);
                //           })
                //           .on("mouseout", function () {
                //             tooltip.style("opacity", "0");
                //           });

            }

            // Redraw the bar chart when a new state is selected
            function update() {
                currentState = document.getElementById('state').value;
                initialize(1);
            }
        }

    )



