// the chart to show
var handshakesChart=undefined;

// the possible signature algs to select from
var sigalgs=[];

// all data by date
var jsonarray;
var refobj;

// Our labels along the x-axis, changes with time series
var alloperations = ["Handshakes/s"];
var currentoperations = [];
var currentsigalg = "";

// initialization status
var fullInitDone = false;

// fill numberstable HTML element as per indicated header information
// tabledata must match header structure
function fillNumberTable(tabledata, setDate) {
   var ntable = document.getElementById('numberstable');
   clearTable(ntable);
   if (tabledata.length > 0) {
     fillDownloadTable(setDate, "handshakes.json");
     addHeader(ntable, "Algorithm handshakes/s");
     tabledata.forEach(function (item, index) {
        tr = ntable.insertRow(-1);
        row = item;
        row.forEach(function (ri, rx) {
           tabCell = tr.insertCell(-1);
           tabCell.style.width = (typeof ri == "string"?"50%":"20%");
           tabCell.style.textAlign = "right";
           if (ri == undefined) {
             tabCell.innerHTML = "-";
           }
           else {
              tabCell.innerHTML = (typeof ri == "string"?ri:ri.toFixed(2));
           }
        });
     });
   }
   else {
     clearTable(document.getElementById('downloadtable'));
   }
}

function CleanSlate() {
       handshakesChart.destroy();
       handshakesChart=undefined;
}

// main chart-generator function
// only populate config data if fullInit set to true
function LoadData(fullInit, cleanSlate) {
    var filterForm = document.getElementById('filterForm');
    var sigalgOption = document.getElementById('sigalg');
    var formData = new FormData(filterForm);
    var sigalg = formData.get("sigalg");
    if (cleanSlate) CleanSlate();
    if (sigalg==null) {
      console.log("Could not determine signature algorithm. Setting default.");
      sigalg="dilithium3"
    }
    var datasets=[];
    var dscount=0;
    var charttype = "bar";

    if (jsonarray == undefined) { // loading data just once
       [jsonarray, refobj, alloperations] = loadJSONArray(formData, false, undefined);
    }

    if (refobj == undefined) return; // no data yes

    if (sigalgs.length == 0) {
       // populate sigalgs array just once
       // remove initial default option
       sigalgOption.remove(0); 
       Object.keys(refobj).forEach(function(key) {
         var option = document.createElement("option");
         option.text = key;
         sigalgs.push(key);
         sigalgOption.add(option);
       })
       currentsigalg = sigalg;
    }

    var setDate = formData.get("date");
    var kemobj = refobj[sigalg];

    Object.keys(kemobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=refobj[key];
         var hs = [];
         var i = 0;
         if (setDate!="All") {
            currentoperations=[];
            currentoperations[0]=setDate;
         }
         else {
            currentoperations=alloperations;
         }
         for (var i in currentoperations) {
           var date = currentoperations[i];
           if ((setDate==undefined)||(setDate=="All")||(setDate==date)) {
              try {
                hs[i] = jsonarray[date][sigalg][key];
              }
              catch(e) {
                hs[i] = NaN;
              }
              i=i+1;
           }
         }
         if (i>1) { // do line chart
            charttype="line";
            datasets[dscount]={
              borderColor: getColor(key),
              label: key,
              fill: false,
              data: hs
            }
         }
         else { // do bar chart
            datasets[dscount]={
              backgroundColor: getColor(key),
              label: key,
              data: hs
            }
         }
         dscount++;
       }
       else { 
         addConfigtable(fullInit, key);
       }
   });

   var shakemin = parseInt(formData.get("shakemin"));
   if (handshakesChart===undefined) {
      handshakesChart = new Chart(document.getElementById("handshakesChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: datasets
        },
        options: {
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'handshakes/s'
             }
           }]
         }
        }
      });
   }
   // Filter logic
   var tabledata=[];
   for (i = 0; i < handshakesChart.data.datasets.length; i++) {
       if (
          (refobj[sigalg][handshakesChart.data.datasets[i].label]<shakemin)||
          (nOKAtNISTLevel(formData.get("nistlevel"), handshakesChart.data.datasets[i].label))||
          (!isSelectedOQSFamily(handshakesChart.data.datasets[i].label))
         ) {
           handshakesChart.data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           var k = handshakesChart.data.datasets[i].label;
           tabledata.push([ k, jsonarray[setDate][sigalg][k] ]);
         }
         handshakesChart.data.datasets[i].hidden=false;
       }
     }
     handshakesChart.update();
     fillNumberTable(tabledata, setDate);
}

// called upon any filter change
function SubmitHandshakesForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    // if toggling between specific date and series, redo chart (e.g., changing type)
    if ((d!="All")||(currentoperations.length!=alloperations.length)||(currentsigalg!=formData.get("sigalg"))) {
       LoadData(false, true);
    }
    else LoadData(false, false);
    event.preventDefault();
}

LoadData(true, false);
