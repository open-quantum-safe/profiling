// charts to show
var keygenChart=undefined;
var signChart=undefined;
var verifyChart=undefined;
var encapChart=undefined;
var decapChart=undefined;

// data by date
var jsonarray = undefined;
var refobj;

// Our labels along the x-axis, changes with time series
var alloperations = ["Operations/s"];
var currentoperations = [];

// initialization status
var fullInitDone = false;

// fill numberstable HTML element as per indicated header information
// tabledata must match header structure
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

function CleanSlate() {
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

// main chart-generator function
// only populate config data if fullInit set to true
function LoadData(fullInit, cleanSlate) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var keygendatasets=[];
    var encapdatasets=[];
    var decapdatasets=[];
    var signdatasets=[];
    var verifydatasets=[];
    var dscount=0;
    var charttype = "bar";

    if (cleanSlate) CleanSlate();

    if (jsonarray == undefined) { // loading data just once
       [jsonarray, refobj, alloperations] = loadJSONArray(formData, false, undefined);
    }

    if (refobj == undefined) { // no data yet
      return;
    }

    var setDate = formData.get("date");

    Object.keys(refobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterOQSKeyByName(key)!=undefined))  {
         var innerobj=refobj[key];
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
         for (var i in currentoperations) {
           var date = currentoperations[i];
           if ((setDate==undefined)||(setDate=="All")||(setDate==date)) {
             try {
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
             }
             catch(e) {
                 ka[i] = ea[i] = da[i] = sa[i] = va[i] = NaN;
             }
             i=i+1;
           }
         }
         if (i>1) { // do line chart
            charttype="line";
            var borderdash = [];
            if (key.includes("-ref")) borderdash = [4];
            if (key.includes("-noport")) borderdash = [2]; // dotted line for nonportable code

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
            signdatasets[dscount]={
              borderColor: getColor(key),
              borderDash: borderdash,
              label: key,
              fill: false,
              data: sa
            }
            verifydatasets[dscount]={
              borderColor: getColor(key),
              borderDash: borderdash,
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
       else { 
         addConfigtable(fullInit, key);
       }
   });
   if (!fullInitDone) fullInitDone=true;
   var keygenmin = parseInt(formData.get("keygenmin"));
   var encapmin = parseInt(formData.get("encapmin"));
   var decapmin = parseInt(formData.get("decapmin"));
   var signmin = parseInt(formData.get("signmin"));
   var verifymin = parseInt(formData.get("verifymin"));
   var displaylegend = formData.get("legend")==null?false:true;
   if (keygenChart===undefined) {
      keygenChart = new Chart(document.getElementById("keygenChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: keygendatasets
        },
        options: {
          legend: {
            display: displaylegend
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
          legend: {
            display: displaylegend
          },
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
          legend: {
            display: displaylegend
          },
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
          legend: {
            display: false
          },
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
          legend: {
            display: false
          },
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
          (!isSelectedOQSFamily(keygenChart.data.datasets[i].label)) ||
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

// called upon any filter change
function SubmitOSSLspeedForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    var displaylegend = formData.get("legend")==null?false:true;
    // if toggling between specific date and series, redo chart (e.g., changing type)
    if ((d!="All")||(currentoperations.length!=alloperations.length)||(legendstate!=displaylegend)) {
       legendstate = displaylegend;
       LoadData(false, true);
    }
    else {
       legendstate = displaylegend;
       LoadData(false, false);
    }
    event.preventDefault();
}


LoadData(true, false);


