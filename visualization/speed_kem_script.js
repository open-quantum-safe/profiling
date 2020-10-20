// the Charts to display
var keygenChart=undefined;
var encapChart=undefined;
var decapChart=undefined;

// the data set
var jsonarray;

// the reference object (jsonarray of date containing maximum set of data)
var refobj;

// Our labels along the x-axis, changes with time series
var alloperations = []; // becomes date list in series display
var currentoperations = [];

// fill numberstable HTML element as per indicated header information
// tabledata must match header structure
function fillNumberTable(tabledata, setDate) {
   var ntable = document.getElementById('numberstable');
   clearTable(ntable);
   if (tabledata.length > 0) {
     fillDownloadTable(setDate, "speed_kem.json");
     addHeader(ntable, "Algorithm keygen/s keygen(cycles) encaps/s encap(cycles) decaps/s decaps(cycles)");
     tabledata.forEach(function (item, index) {
        tr = ntable.insertRow(-1);
        row = item;
        row.forEach(function (ri, rx) {
           tabCell = tr.insertCell(-1);
           tabCell.style.width = (typeof ri == "string"?"20%":"10%");
           tabCell.style.textAlign = "right";
           if (ri == undefined) {
             tabCell.innerHTML = "-";
           }
           else {
              tabCell.innerHTML = (typeof ri == "string"?ri:(rx%2==0?ri:ri.toFixed(2)));
           }
        });
     });
   }
   else {
     clearTable(document.getElementById('downloadtable'));
   }
}

// called upon any filter change
function SubmitKEMForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    // if toggling between specific date and series, redo chart (e.g., changing type)
    if ((d!="All")||(currentoperations.length!=alloperations.length)) {
       keygenChart.destroy();
       keygenChart=undefined;
       encapChart.destroy();
       encapChart=undefined;
       decapChart.destroy();
       decapChart=undefined;
    }
    LoadData(false);
    event.preventDefault();
}

// main chart-generator function
// only populate config data if fullInit set to true
function LoadData(fullInit) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var keygendatasets=[];
    var encapdatasets=[];
    var decapdatasets=[];
    var dscount=0;
    var charttype = "bar";

    if (jsonarray == undefined) { // loading data just once
       [jsonarray, refobj, alloperations] = loadJSONArray(formData, false, 
          loadJSONArray(formData, true, undefined)[0] // loading ref data if/when present
       );
    }

    // obtain this only now as loadJSONArray could have changed it:
    var setDate = formData.get("date");

    Object.keys(refobj).sort().forEach(function(key) {
       //console.log(key);
       if (!(key.startsWith("config"))&&!(key.startsWith("cpuinfo"))&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=refobj[key];
         var ka = [];
         var ea = [];
         var da = [];
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
              try { // not all dates may be filled with numbers
                 ka[i] = jsonarray[date][key].keygen;
                 ea[i] = jsonarray[date][key].encaps;
                 da[i] = jsonarray[date][key].decaps;
              }
              catch(e) {
                 ka[i] = ea[i] = da[i] = NaN;
              }
              i=i+1;
           }
         }
         if (i>1) { // do line chart
            charttype="line";
            // straight line for optimized implementations
            var borderdash = [];
            if (key.includes("-ref")) borderdash = [4]; // dashed line for reference code

            keygendatasets[dscount]={
              borderColor: getColor(key),
              borderDash: borderdash,
              label: key,
              fill: false,
              data: ka
            }
            encapdatasets[dscount]={
              borderColor: getColor(key),
              borderDash: borderdash,
              label: key,
              fill: false,
              data: ea
            }
            decapdatasets[dscount]={
              borderColor: getColor(key),
              borderDash: borderdash,
              hidden: false,
              label: key,
              fill: false,
              data: da
            }
         }
         else { // do bar chart
            keygendatasets[dscount]={
              backgroundColor: getColor(key),
              label: key,
              data: ka
            }
            encapdatasets[dscount]={
              backgroundColor: getColor(key),
              label: key,
              data: ea
            }
            decapdatasets[dscount]={
              backgroundColor: getColor(key),
              hidden: false,
              label: key,
              data: da
            }
         }
         dscount++;
       }
       else { // add to config table
         if (fullInit && filterOQSKeyByName(key)!=undefined) {
            var table = document.getElementById('configtable');
            Object.keys(refobj[key]).sort().forEach(function(r) {
               var tr = table.insertRow(-1);
               var tabCell = tr.insertCell(-1);
               tabCell.style.width = "20%";
               tabCell.style.textAlign = "right";
               tabCell.innerHTML = r; 
               tabCell = tr.insertCell(-1);
               tabCell.style.width = "80%";
               tabCell.style.textAlign = "left";
               tabCell.innerHTML = JSON.stringify(refobj[key][r]).replace(/\"/g, ""); 
            });
         }
       }
   });
   var keygenmin = parseInt(formData.get("keygenmin"));
   var encapmin = parseInt(formData.get("encapmin"));
   var decapmin = parseInt(formData.get("decapmin"));
   if (keygenChart===undefined) {
      keygenChart = new Chart(document.getElementById("keygenChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: keygendatasets
        },
        options: {
          legend: {
            // Possible ToDo: React on clicks to legend
            //onClick: KEMlegendClickHandler
          },
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'key generations/s'
             }
           }]
         }
        }
      });
   }
   if (encapChart===undefined) {
      encapChart = new Chart(document.getElementById("encapChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: encapdatasets
        },
        options: {
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'encap/s'
             }
           }]
         }
        }

      });
   }
   if (decapChart===undefined) {
      decapChart = new Chart(document.getElementById("decapChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: decapdatasets
        },
        options: {
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'decap/s'
             }
           }]
         }
        }
      });
   }
   // Filter logic
   var tabledata=[];
   for (i = 0; i < keygenChart.data.datasets.length; i++) { 
       if (
          // check values at reference object/date to decide what to keep globally
          (refobj[keygenChart.data.datasets[i].label]["keygen"]<keygenmin)||
          (refobj[encapChart.data.datasets[i].label]["encaps"]<encapmin)||
          (refobj[decapChart.data.datasets[i].label]["decaps"]<decapmin)||
          (nOKAtNISTLevel(formData.get("nistlevel"), keygenChart.data.datasets[i].label))||
          (!isSelectedOQSFamily(keygenChart.data.datasets[i].label))
         ) {
           keygenChart.data.datasets[i].hidden=true;
           encapChart.data.datasets[i].hidden=true;
           decapChart.data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           var k = keygenChart.data.datasets[i].label;
           tabledata.push([ k, jsonarray[setDate][k].keygen, jsonarray[setDate][k].keygencycles, jsonarray[setDate][k].encaps, jsonarray[setDate][k].encapscycles, jsonarray[setDate][k].decaps, jsonarray[setDate][k].decapscycles ]);
         }
         keygenChart.data.datasets[i].hidden=false;
         encapChart.data.datasets[i].hidden=false;
         decapChart.data.datasets[i].hidden=false;
       }
     }
     keygenChart.update();
     encapChart.update();
     decapChart.update();
     fillNumberTable(tabledata, setDate);
}

LoadData(true);

