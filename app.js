// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width",svgWidth)
    .attr("height",svgHeight);

//Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Initial Params
    var chosenXAxis = "poverty";

    //Create scale functions
    function xScale(censusData, chosenXAxis) {

        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) *0.8,
                d3.max(censusData, d => d[chosenXAxis]) *1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        
        return xAxis;
        
    }

    var chosenYAxis = "healthcare";

    function yScale(censusData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d=> d[chosenYAxis]) *0.8,
            d3.max(censusData, d => d[chosenYAxis]) *1.2
        ])
        .range([height,0]);

        return yLinearScale;
    }

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
        .duration(1000)
        .call(leftAxis);

        return yAxis;
    }
    
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", data => newXScale(data[chosenXAxis]))
            .attr("cy", data => newYScale(data[chosenYAxis]));
        
        return circlesGroup
    }
    
    function renderText(circleLabels,newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circleLabels.transition()
            .duration(1000)
            .attr("cx", data => newXScale(data[chosenXAxis]))
            .attr("cy", data => newYScale(data[chosenYAxis]));
        
        return circleLabels
    }

    //Function to update tooltips
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    var xlabel;

        if (chosenXAxis ==="poverty") {
            xlabel = "Poverty: ";
        }
       
        else{
            xlabel = "Age: ";
        }

    var ylabel;

        if(chosenYAxis ==="healthcare") {
            ylabel = "Healthcare: ";
        }

        else {
            ylabel = "Smokes: "
        }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80,-60])
    .html(function(d) {
        return (`${xlabel}: ${d[chosenXAxis]} <br> ${ylabel}: ${d[chosenYAxis]}`);
    });
    
    chartGroup.call(toolTip);

    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })

    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;

}

    //Import Data
    d3.csv("data.csv").then(function(censusData, err) {
        if (err) throw(err);
        
    //Parse Data/Cast as numbers
    censusData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age= +data.age;
        data.smokes = +data.smokes;
    });
    
    var xLinearScale = xScale(censusData, chosenXAxis);      
    var yLinearScale = yScale(censusData, chosenYAxis);
          
    //Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //Append xAxis to chart
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "green")
        .attr("opacity", ".5");

    var circleLabels = chartGroup.selectAll(null)
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .text(function(d) {
            return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text( "In Poverty (%)");
    
    var ageLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Age (Median)");
    
    var yLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${0-margin.left / 4}, ${height / 2})`);
    
    var healthcareLabel = yLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 0-20)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .attr("class", "axisText")
        .attr("transform", "rotate(-90)")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
    var smokesLabel = yLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 0-40)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .attr("class", "axisText")
        .attr("transform", "rotate(-90)")
        .classed("inactive", true)
        .text("Smokes (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);
        
        xLabelGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                
                if(value !== chosenXAxis) {
                    
                    chosenXAxis = value;
                   
                    xLinearScale = xScale(censusData, chosenXAxis);
                    
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            })

        yLabelGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if(value !==chosenYAxis) {

                    chosenYAxis = value;

                    yLinearScale = yScale(censusData, chosenYAxis);

                    yAxis = renderYAxis(yLinearScale, yAxis);

                    circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

                    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                    if(chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel 
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
         }).catch(function(error) {
            console.log(error);
    });

