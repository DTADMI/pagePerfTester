var url_set = "";

var results_div;
var launch_btn;
var timeOutId;

var counter = 0;

var first_contentful_paints = [];
var speed_indexes = [];
var times_to_interactive = [];
var first_meaningful_paints =  [];
var first_CPU_Idles = [];
var estimated_input_latencies = [];

var units;

function launch_tests() {
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to executePerfTest when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(executeMultiplePerfTests);
}

	  
// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(table_data, title) {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Launch');
    data.addColumn('number', 'Score');
    data.addRows(table_data);

    // Set chart options
    var options = {'title': title,
                   'width':400,
                   'height':300};

    const chart_div = document.createElement('div');
      // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(chart_div);
    chart.draw(data, options);
    results_div.appendChild(chart_div);
}

function stopPerfTestsAndHandleData() {
    window.clearTimeout(timeOutId);
    var tables = [
        [first_contentful_paints, "First Contentful Paints ("+units[0]+")"],
        [speed_indexes, "Speed Indexes ("+units[1]+")"],
        [times_to_interactive, "Times To Interactive ("+units[2]+")"],
        [first_meaningful_paints, "First Meaningful Paints ("+units[3]+")"],
        [first_CPU_Idles, "First CPU Idles ("+units[4]+")"],
        [estimated_input_latencies, "Estimated Input Latencies ("+units[5]+")"]
    ];

    tables.forEach((table)=>{
        drawChart(table[0], table[1]);
    });
    document.getElementById("loader").className = "loader hidden";
}

function executeMultiplePerfTests() {
	url_set = document.getElementById("url").value;
	launch_btn = document.getElementById("launch_btn");
	
	if(url_set){
		document.getElementById("loader").className = "loader";
		results_div = document.getElementById("results");
		results_div.innerHTML = '';

        executePerfTest();
	} else {
		window.alert('No url set : please provide a url to test');
	}
}

function executePerfTest() {
	 
  const url = setUpQuery();
  fetch(url)
	.then(response => response.json())
	.then(json => {		  
	  const lighthouse = json.lighthouseResult;

		first_contentful_paints.push(['Launch ' + counter, parseFloat(lighthouse.audits['first-contentful-paint'].displayValue, 10)]);
		
		speed_indexes.push(['Launch ' + counter, parseFloat(lighthouse.audits['speed-index'].displayValue, 10)]);
		
		times_to_interactive.push(['Launch ' + counter, parseFloat(lighthouse.audits['interactive'].displayValue, 10)]);
		
		first_meaningful_paints.push(['Launch ' + counter, parseFloat(lighthouse.audits['first-meaningful-paint'].displayValue, 10)]);
		
		first_CPU_Idles.push(['Launch ' + counter, parseFloat(lighthouse.audits['first-cpu-idle'].displayValue, 10)]);
		
		estimated_input_latencies.push(['Launch ' + counter, parseFloat(lighthouse.audits['estimated-input-latency'].displayValue, 10)]);


		if(!units){
			units = [lighthouse.audits['first-contentful-paint'].displayValue.replace(first_contentful_paints[0][1],'').trim(),
			lighthouse.audits['speed-index'].displayValue.replace(speed_indexes[0][1],'').trim(),
			lighthouse.audits['interactive'].displayValue.replace(times_to_interactive[0][1],'').trim(),
			lighthouse.audits['first-meaningful-paint'].displayValue.replace(first_meaningful_paints[0][1],'').trim(),
			lighthouse.audits['first-cpu-idle'].displayValue.replace(first_CPU_Idles[0][1],'').trim(),
			lighthouse.audits['estimated-input-latency'].displayValue.replace(estimated_input_latencies[0][1],'').trim()];
		};
			
	}).finally(()=>{
		counter++;		
		if(counter < 5){
		    timeOutId = window.setTimeout(executePerfTest, 180000);
		} else {
		    stopPerfTestsAndHandleData();
		}		
	});	
}

function setUpQuery() {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const parameters = {
    url: encodeURIComponent(url_set)//'https://developers.google.com')
  };
  let query = `${api}?`;
  for (key in parameters) {
    query += `${key}=${parameters[key]}`;
  }
  return query;
}
