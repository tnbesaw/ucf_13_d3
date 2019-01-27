var svgWidth = 600;
var svgHeight = 450;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chartLabelGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.9,
      d3.max(csvData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(csvData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.9, 
      d3.max(csvData, d => d[chosenYAxis]) * 1.1 
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, circlesTextGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  circlesTextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) ) //-5
    .attr("y", d => newYScale(d[chosenYAxis]) +2); //3

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xLabel = "Poverty:";
    var xSuffix = "%"
  }
  else if (chosenXAxis === "age") {
    var xLabel = "Age:";
    var xSuffix = ""
  }
  else {
    var xLabel = "Income:";
    var xSuffix = ""
  }

  if (chosenYAxis === "healthcare") {
    var yLabel = "Lacks Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    var yLabel = "Smokes:";
  }
  else {
    var yLabel = "Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`<div class="tooltip_title">${d.state}</div><br>${xLabel} ${d[chosenXAxis]}${xSuffix}<br>${yLabel} ${d[chosenYAxis]}%`);
    })
    ;

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, csvData) {
  if (err) throw err;
  
  // parse data
  csvData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;      
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(csvData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(csvData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 8)
    .attr("fill", "lightblue")
    .attr("opacity", "1")

  // append initial circle text 
  var circlesTextGroup = chartLabelGroup.selectAll("text")
    .data(csvData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]) )
    .attr("y", d => yLinearScale(d[chosenYAxis]) +2)
    .text( d => d.abbr )
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", "6px")
    .attr("font-weight", "bold")
    .attr("fill", "white");


  // ****************************************
  //
  // Create group for 3 x- axis labels
  //
  // ****************************************
  var xLabelGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var xLabelPoverty = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("axisLabelStyle",true)
    .text("In Poverty (%)");

  var xLabelAge = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("axisLabelStyle",true)
    .text("Age (Median)");

  var xLabelIncome = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("axisLabelStyle",true)
    .text("Household Income (Median)");


  // ****************************************
  //
  // Create group for 3 y- axis labels
  //
  // ****************************************
  var yLabelGroup = chartGroup.append("g")
    .attr("transform", `translate(0, 0)`);

  // append y axis
  var yLabelHealthcare = yLabelGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "4em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .classed("axisLabelStyle",true)
    .text("Lacks Healthcare (%)");

  var yLabelSmokes = yLabelGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "2.5em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .classed("axisLabelStyle",true)
    .text("Smokes (%)");
  
  var yLabelObesity = yLabelGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .classed("axisLabelStyle",true)
    .text("Obese (%)");


  // ****************************************
  //
  // updateToolTip function above csv import
  //
  // ****************************************
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);



  // ****************************************
  //
  // x axis labels event listener
  //
  // ****************************************
  xLabelGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(csvData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, circlesTextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          xLabelPoverty
            .classed("active", true)
            .classed("inactive", false);
          xLabelAge
            .classed("active", false)
            .classed("inactive", true);
          xLabelIncome
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          xLabelPoverty
            .classed("active", false)
            .classed("inactive", true);
          xLabelAge
            .classed("active", true)
            .classed("inactive", false);
          xLabelIncome
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          xLabelPoverty
            .classed("active", false)
            .classed("inactive", true);
          xLabelAge
            .classed("active", false)
            .classed("inactive", true);
          xLabelIncome
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });    


// ****************************************
//  
// y axis labels event listener
//
// ****************************************
yLabelGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(csvData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, circlesTextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          yLabelHealthcare
            .classed("active", true)
            .classed("inactive", false);
          yLabelSmokes
            .classed("active", false)
            .classed("inactive", true);
            yLabelObesity
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          yLabelHealthcare
            .classed("active", false)
            .classed("inactive", true);
          yLabelSmokes
            .classed("active", true)
            .classed("inactive", false);
            yLabelObesity
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          yLabelHealthcare
            .classed("active", false)
            .classed("inactive", true);
          yLabelSmokes
            .classed("active", false)
            .classed("inactive", true);
          yLabelObesity
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });    

});
