var keygenChart=undefined;
var signChart=undefined;
var verifyChart=undefined;
var encapChart=undefined;
var decapChart=undefined;
var jsonarray = {};
var firstobj;
// Our labels along the x-axis, changes with time series
var alloperations = ["Operations/s"];
var currentoperations = [];

function fillNumberTable(tabledata, setDate) {
   var ntable = document.getElementById('numberstable');
   clearTable(ntable);
   if (tabledata.length > 0) {
     fillDownloadTable(setDate, "speed_kem.json");
     addHeader(ntable, "Algorithm keygen/s encaps/s decaps/s sign/s verify/s");
     tabledata.forEach(function (item, index) {
        tr = ntable.insertRow(-1);
        row = item;
        row.forEach(function (ri, rx) {
           tabCell = tr.insertCell(-1);
           tabCell.style.width = (typeof ri == "string"?"30%":"10%");
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
    var formData = new FormData(filterForm);
    var keygendatasets=[];
    var encapdatasets=[];
    var decapdatasets=[];
    var signdatasets=[];
    var verifydatasets=[];
    var dscount=0;
    var charttype = "bar";

    if (Object.keys(jsonarray).length == 0) { // loading data just once
       loadJSONArray(formData);
    }

    var setDate = formData.get("date");

    Object.keys(firstobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=firstobj[key];
         var ka = [];
         var ea = [];
         var da = [];
         var sa = [];
         var va = [];
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
             var innerobj = jsonarray[date][key];
             if (innerobj["op/s"] != undefined) {
              ka[i] = 0;
              ea[i] = innerobj["op/s"];
              da[i] = innerobj["op/s"];
              sa[i] = 0;
              va[i] = 0;
             }
             else {
              ka[i] = innerobj["keygen/s"];
              ea[i] = innerobj["encap/s"];
              da[i] = innerobj["decap/s"];
              sa[i] = innerobj["sign/s"];
              va[i] = innerobj["verify/s"];
             }
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
            encapdatasets[dscount]={
              borderColor: getColor(key),
              label: key,
              fill: false,
              data: ea
            }
            decapdatasets[dscount]={
              borderColor: getColor(key),
              hidden: false,
              label: key,
              fill: false,
              data: da
            }
            signdatasets[dscount]={
              borderColor: getColor(key),
              label: key,
              fill: false,
              data: sa
            }
            verifydatasets[dscount]={
              borderColor: getColor(key),
              hidden: false,
              label: key,
              fill: false,
              data: va
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
            signdatasets[dscount]={
              backgroundColor: getColor(key),
              label: key,
              data: sa
            }
            verifydatasets[dscount]={
              backgroundColor: getColor(key),
              hidden: false,
              label: key,
              data: va
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
   var encapmin = parseInt(formData.get("encapmin"));
   var decapmin = parseInt(formData.get("decapmin"));
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
               labelString: 'encaps/s'
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
               labelString: 'decaps/s'
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
               labelString: 'signatures/s'
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
               labelString: 'verifications/s'
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
          (encapChart.data.datasets[i].data[0]<encapmin)||
          (decapChart.data.datasets[i].data[0]<decapmin)||
          (signChart.data.datasets[i].data[0]<signmin)||
          (verifyChart.data.datasets[i].data[0]<verifymin)||
          (nOKAtNISTLevel(formData.get("nistlevel"), keygenChart.data.datasets[i].label))||
          ((formData.get("familyselector")!="All") && !isSelectedOQSFamily(keygenChart.data.datasets[i].label)) ||
          ((formData.get("oqsalg")=="OQS only") && (keygenChart.data.datasets[i].backgroundColor==undefined) && (keygenChart.data.datasets[i].borderColor==undefined))
         ) {
           keygenChart.data.datasets[i].hidden=true;
           encapChart.data.datasets[i].hidden=true;
           decapChart.data.datasets[i].hidden=true;
           signChart.data.datasets[i].hidden=true;
           verifyChart.data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           var k = keygenChart.data.datasets[i].label;
           var o = jsonarray[setDate][k];
           if (o["op/s"] != undefined) {
             tabledata.push([ k, undefined, o["op/s"], o["op/s"], undefined, undefined ]);
           }
           else {
              tabledata.push([ k, o["keygen/s"], o["encap/s"], o["decap/s"], o["sign/s"], o["verify/s"] ]);
           }
         }
         keygenChart.data.datasets[i].hidden=false;
         encapChart.data.datasets[i].hidden=false;
         decapChart.data.datasets[i].hidden=false;
         signChart.data.datasets[i].hidden=false;
         verifyChart.data.datasets[i].hidden=false;
       }
     }
     keygenChart.update();
     encapChart.update();
     decapChart.update();
     signChart.update();
     verifyChart.update();
     fillNumberTable(tabledata, setDate);
}

function SubmitOSSLspeedForm(event) {
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
       encapChart.destroy();
       encapChart=undefined;
       decapChart.destroy();
       decapChart=undefined;
    }
    LoadData(false);
    event.preventDefault();
}


LoadData(true);


