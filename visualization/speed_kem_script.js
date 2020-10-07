var keygenChart=undefined;
var encapChart=undefined;
var decapChart=undefined;
var jsonarray = {};
var firstobj;
// Our labels along the x-axis, changes with time series
var alloperations = ["Operations/s"];
var currentoperations = [];

var l1algs =  "bike1-l1-fo kyber512 kyber512-90s classic-mceliece-348864 classic-mceliece-348864f lightsaber-kem hqc-128-1-cca2 frodokem-640-aes frodokem-640-shake ntru-hps-2048-509 sidh-p434 sidh-p434-compressed sidh-p503 sidh-p503-compressed sike-p434 sike-p434-compressed sike-p503 sike-p503-compressed " ;
var l3algs =  "bike1-l3-fo kyber768 kyber768-90s classic-mceliece-460896 classic-mceliece-460896f saber-kem hqc-192-1-cca2 hqc-192-2-cca2 frodokem-976-aes frodokem-976-shake tru-hps-2048-677 ntru-hrss-701 sidh-p610 sidh-p610-compressed sike-p610 sike-p610-compressed " ;
var l5algs =  "kyber1024 kyber1024-90s classic-mceliece-6688128 classic-mceliece-6688128f classic-mceliece-6960119 classic-mceliece-6960119f classic-mceliece-8192128 classic-mceliece-8192128f firesaber-kem hqc-256-1-cca2 hqc-256-2-cca2 hqc-256-3-cca2 frodokem-1344-aes frodokem-1344-shake ntru-hps-4096-821 sidh-p751 sidh-p751-compressed sike-p751 sike-p751-compressed" ;

function nOKAtNISTLevel(setLevel, algName) {
   if (setLevel=="All") {
      return false;
   }
   if (setLevel=="Level 1") {
     if (l1algs.split(" ").includes(algName.toLowerCase())) return false;
   }
   if (setLevel=="Level 3") {
     if (l3algs.split(" ").includes(algName.toLowerCase())) return false;
   }
   if (setLevel=="Level 5") {
     if (l5algs.split(" ").includes(algName.toLowerCase())) return false;
   }
   return true;
}

function filterKeyByName(key) {
   if ((key.toLowerCase().includes("cpa"))||(key.toLowerCase().includes("default"))) {
     return undefined;
   }
   return key;
}

function clearTable(table) {
  while(table.rows.length > 0) {
    table.deleteRow(0);
  }
}

function addHeader(table, headings) {
   var cols = headings.split(" ");
   var hr = table.insertRow(-1);
   cols.forEach(function (item, index) {
     var hcell=document.createElement('TH')
     hcell.innerHTML = item;
     hr.appendChild(hcell);
   });
}

function fillNumbers(tabledata) {
   var table = document.getElementById('numberstable');
   clearTable(table);
   if (tabledata.length > 0) {
     addHeader(table, "Algorithm keygen/s encaps/s decaps/s");
     tabledata.forEach(function (item, index) {
        var tr = table.insertRow(-1);
        var row = item;
        row.forEach(function (ri, rx) {
           var tabCell = tr.insertCell(-1);
           tabCell.style.width = "20%";
           tabCell.style.textAlign = "right";
           tabCell.innerHTML = ri; 
        });
     });
   }
}

function handleForm(event) { event.preventDefault(); } 

function SubmitForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', handleForm);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
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

function RetrieveData(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
       result = xmlhttp.responseText;
    }
    return result;
}

function LoadData(fullInit) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var dateOption = document.getElementById('date');
    var keygendatasets=[];
    var encapdatasets=[];
    var decapdatasets=[];
    var dscount=0;
    var charttype = "bar";
    var setDate = formData.get("date");

    if (Object.keys(jsonarray).length == 0) { // loading data just once
       if (formData.get("datafile").endsWith(".json")) { // single JSON to load
         firstobj = jsonarray["All"] = JSON.parse(RetrieveData(formData.get("datafile")));
       }
       else { // iterate through resources...
          var urls = RetrieveData(formData.get("datafile")).split("\n");
          var filldates = (dateOption.options.length==1);
          urls.forEach(function (url, index) {
            if (url.length>0) {
                var d = url.substring(0, url.indexOf("/"));
                jsonarray[d] = JSON.parse(RetrieveData(url));
                if (firstobj==undefined) {
                  firstobj = jsonarray[d];
                }
                alloperations[index] = d;
                var option = document.createElement("option");
                if (filldates) {
                   option.text = d;
                   dateOption.add(option);
                }
            }
          });
       }
    }

    Object.keys(firstobj).sort().forEach(function(key) {
       //console.log(key);
       if ((key!="config")&&(key!="cpuinfo")&&(filterKeyByName(key)!=undefined))  {
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
              ka[i] = jsonarray[date][key].keygen;
              ea[i] = jsonarray[date][key].encaps;
              da[i] = jsonarray[date][key].decaps;
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
         if (fullInit && filterKeyByName(key)!=undefined) {
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
   if (keygenChart===undefined) {
      keygenChart = new Chart(document.getElementById("keygenChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: keygendatasets
        }
      });
   }
   if (encapChart===undefined) {
      encapChart = new Chart(document.getElementById("encapChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: encapdatasets
        }
      });
   }
   if (decapChart===undefined) {
      decapChart = new Chart(document.getElementById("decapChart"), {
        type: charttype,
        data: {
          labels: currentoperations,
          datasets: decapdatasets
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
          (nOKAtNISTLevel(formData.get("nistlevel"), keygenChart.data.datasets[i].label))||
          ((formData.get("familyselector")!="All") && (!keygenChart.data.datasets[i].label.toLowerCase().includes(formData.get("familyselector").toLowerCase())))
         ) {
           keygenChart.data.datasets[i].hidden=true;
           encapChart.data.datasets[i].hidden=true;
           decapChart.data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           tabledata.push([ keygenChart.data.datasets[i].label, keygenChart.data.datasets[i].data[0], encapChart.data.datasets[i].data[0], decapChart.data.datasets[i].data[0] ]);
         }
         keygenChart.data.datasets[i].hidden=false;
         encapChart.data.datasets[i].hidden=false;
         decapChart.data.datasets[i].hidden=false;
       }
     }
     keygenChart.update();
     encapChart.update();
     decapChart.update();
     fillNumbers(tabledata);
}

LoadData(true);

