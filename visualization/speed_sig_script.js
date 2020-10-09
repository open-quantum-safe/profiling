var keygenChart=undefined;
var signChart=undefined;
var verifyChart=undefined;
var jsonarray = {};
var firstobj;
// Our labels along the x-axis, changes with time series
var alloperations = ["Operations/s"];
var currentoperations = [];

function fillNumberTable(tabledata, setDate) {
   var ntable = document.getElementById('numberstable');
   clearTable(ntable);
   if (tabledata.length > 0) {
     fillDownloadTable(setDate, "speed_sig.json");
     addHeader(ntable, "Algorithm keygen/s keygen(cycles) sign/s sign(cycles) verify/s verify(cycles)");
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

function SubmitSIGForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    if ((d!="All")||(currentoperations.length!=alloperations.length)) {
       keygenChart.destroy();
       keygenChart=undefined;
       signChart.destroy();
       signChart=undefined;
       verifyChart.destroy();
       verifyChart=undefined;
    }
    LoadData(false);
    event.preventDefault();
}

function redoSIGTable(ci) {
   var filterForm = document.getElementById('filterForm');
   var formData = new FormData(filterForm);
   var setDate = formData.get("date");
   var tabledata = [];
   for (i = 0; i < ci.data.datasets.length; i++) {
         var meta = ci.getDatasetMeta(i);
         if (setDate!="All" && !meta.hidden) {
           var k = ci.data.datasets[i].label;
           tabledata.push([ k, jsonarray[setDate][k].keypair, jsonarray[setDate][k].keypaircycles, jsonarray[setDate][k].sign, jsonarray[setDate][k].signcycles, jsonarray[setDate][k].verify, jsonarray[setDate][k].verifycycles ]);
         }
   }
   fillNumberTable(tabledata, setDate);
}

function SIGlegendClickHandler(e, legendItem) {
    var index = legendItem.datasetIndex;
    var ci = this.chart;
    var meta = ci.getDatasetMeta(index);

    // See controller.isDatasetVisible comment
    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
    // We hid a dataset ... rerender the chart
    ci.update();
    redoSIGTable(ci);
}

function LoadData(fullInit) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var keygendatasets=[];
    var signdatasets=[];
    var verifydatasets=[];
    var dscount=0;
    var charttype = "bar";
    var setDate = formData.get("date");

    if (Object.keys(jsonarray).length == 0) { // loading data just once
       loadJSONArray(formData);
    }

    Object.keys(firstobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=firstobj[key];
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
              ka[i] = jsonarray[date][key].keypair;
              ea[i] = jsonarray[date][key].sign;
              da[i] = jsonarray[date][key].verify;
              i=i+1;
           }
         }
         if (i>1) { // do line chart
            charttype="line";
            keygendatasets[dscount]={
              borderColor: getColor(key),
              label: key,
              fill: false,
              data: ka
            }
            signdatasets[dscount]={
              borderColor: getColor(key),
              label: key,
              fill: false,
              data: ea
            }
            verifydatasets[dscount]={
              borderColor: getColor(key),
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
            signdatasets[dscount]={
              backgroundColor: getColor(key),
              label: key,
              data: ea
            }
            verifydatasets[dscount]={
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
   var keygenmin = parseInt(formData.get("keygenmin"));
   var signmin = parseInt(formData.get("signmin"));
   var verifymin = parseInt(formData.get("verifymin"));
   if (keygenChart===undefined) {
      keygenChart = new Chart(document.getElementById("keygenChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: keygendatasets
        },
        options: {
          legend: {
            //onClick: SIGlegendClickHandler
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
   if (signChart===undefined) {
      signChart = new Chart(document.getElementById("signChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: signdatasets
        },
        options: {
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'sign/s'
             }
           }]
         }
        }

      });
   }
   if (verifyChart===undefined) {
      verifyChart = new Chart(document.getElementById("verifyChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: verifydatasets
        },
        options: {
          scales: {
           yAxes: [{
             scaleLabel: {
               display: true,
               labelString: 'verify/s'
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
          (keygenChart.data.datasets[i].data[0]<keygenmin)||
          (signChart.data.datasets[i].data[0]<signmin)||
          (verifyChart.data.datasets[i].data[0]<verifymin)||
          (nOKAtNISTLevel(formData.get("nistlevel"), keygenChart.data.datasets[i].label))||
          ((formData.get("familyselector")!="All") && !isSelectedOQSFamily(keygenChart.data.datasets[i].label))
         ) {
           keygenChart.data.datasets[i].hidden=true;
           signChart.data.datasets[i].hidden=true;
           verifyChart.data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           var k = keygenChart.data.datasets[i].label;
           tabledata.push([ k, jsonarray[setDate][k].keypair, jsonarray[setDate][k].keypaircycles, jsonarray[setDate][k].sign, jsonarray[setDate][k].signcycles, jsonarray[setDate][k].verify, jsonarray[setDate][k].verifycycles ]);
         }
         keygenChart.data.datasets[i].hidden=false;
         signChart.data.datasets[i].hidden=false;
         verifyChart.data.datasets[i].hidden=false;
       }
     }
     keygenChart.update();
     signChart.update();
     verifyChart.update();
     fillNumberTable(tabledata, setDate);
}

LoadData(true);

