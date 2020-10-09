var handshakesChart=undefined;
var sigalgs=[];
var jsonarray = {};
var firstobj;
// Our labels along the x-axis, changes with time series
var alloperations = ["Handshakes/s"];
var currentoperations = [];
var currentsigalg = "";

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


function LoadData(fullInit) {
    var filterForm = document.getElementById('filterForm');
    var sigalgOption = document.getElementById('sigalg');
    var formData = new FormData(filterForm);
    var sigalg = formData.get("sigalg");
    if (sigalg==null) {
      console.log("Could not determine signature algorithm. Setting default.");
      sigalg="dilithium3"
    }
    var datasets=[];
    var dscount=0;
    var charttype = "bar";
    var setDate = formData.get("date");

    if (Object.keys(jsonarray).length == 0) { // loading data just once
       loadJSONArray(formData);
       // also populate sigalgs array just once
       // remove initial default option
       sigalgOption.remove(0); 
       Object.keys(firstobj).forEach(function(key) {
         var option = document.createElement("option");
         option.text = key;
         sigalgs.push(key);
         sigalgOption.add(option);
       })
       currentsigalg = sigalg;
    }


    var kemobj = firstobj[sigalg];

    Object.keys(kemobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=firstobj[key];
         var hs = [];
         var i = 0;
         if (setDate!="All") {
            currentoperations=[];
            currentoperations[0]=setDate;
         }
         else {
            currentoperations=alloperations;
         }
         for (var date in jsonarray) {
           if ((setDate==undefined)||(setDate=="All")||(setDate==date)) {
              hs[i] = jsonarray[date][sigalg][key];
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
       else { // add to config table
         if (fullInit && filterOQSKeyByName(key)!=undefined) {
            var table = document.getElementById('configtable');
            Object.keys(firstobj[key]).sort().forEach(function(r) {
               var tr = table.insertRow(-1);
               var tabCell = tr.insertCell(-1);
               tabCell.style.width = "20%";
               tabCell.style.textAlign = "right";
               tabCell.innerHTML = r;
               tabCell = tr.insertCell(-1);
               tabCell.style.width = "80%";
               tabCell.style.textAlign = "left";
               tabCell.innerHTML = JSON.stringify(firstobj[key][r]).replace(/\"/g, "");
            });
         }
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
          (handshakesChart.data.datasets[i].data[0]<shakemin)||
          (nOKAtNISTLevel(formData.get("nistlevel"), handshakesChart.data.datasets[i].label))||
          ((formData.get("familyselector")!="All") && !isSelectedOQSFamily(handshakesChart.data.datasets[i].label))
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

function SubmitHandshakesForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    if ((d!="All")||(currentoperations.length!=alloperations.length)||(currentsigalg!=formData.get("sigalg"))) {
       handshakesChart.destroy();
       handshakesChart=undefined;
    }
    LoadData(false);
    event.preventDefault();
}

LoadData(true);
