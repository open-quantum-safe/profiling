// Logic to set form values from hashparams
var hashP = window.location.hash
if (hashP!=undefined && hashP.length>0) {
   hashParams= hashP.substr(1).split('&'); // remove # and split by params
   for(var i = 0; i < hashParams.length; i++){
      var p = hashParams[i].split('=');
      if ((p.length>1) && (p[0].length>0) && (p[1].length>0))
          if (document.getElementById(p[0])!=null) document.getElementById(p[0]).value = decodeURIComponent(p[1]);;
   }
}

var element = document.getElementById("canvases");
for (j=0; j < chartTypes.length; j++) {
  var para = document.createElement("h3");
  var node = document.createTextNode(chartTypes[j] + " operations");
  para.appendChild(node);
  element.appendChild(para);
  para = document.createElement("canvas");
  para.id = chartTypes[j]+"Chart";
  element.appendChild(para);
}

// the data set
var jsonarray;

var sigalgs=[];
var currentsigalg=undefined;

// the reference object (jsonarray of date containing maximum set of data)
var refobj;

// Our labels along the x-axis, changes with time series
var alloperations = []; // becomes date list in series display
var currentoperations = [];

// initialization status
var fullInitDone = false;

// fill numberstable HTML element as per indicated header information
// tabledata must match header structure
function fillNumberTable(tabledata, setDate) {
   var ntable = document.getElementById('numberstable');
   var formData = new FormData(document.getElementById('filterForm'));
   var setMemType = formData.get("memselector");

   clearTable(ntable);
   if (tabledata.length > 0) {
     fillDownloadTable(setDate, DOWNLOADJSON); // populated by specific .js
     var headerstring = "Algorithm";
     for (j = 0; j < chartTypes.length; j++) 
        if (setMemType==undefined) {
           headerstring = headerstring + " " + chartTypes[j];
           if (!chartTypes[j].includes("/s")) {
              headerstring = headerstring +"/s ";
              if (chartTypes[j] != "handshakes") {
                 headerstring = headerstring + chartTypes[j]+"(cycles)";
              }
           }
        }
        else {
           headerstring = headerstring + " " + chartTypes[j]+"(maxHeap) "+chartTypes[j]+"(maxStack)";
        }
     addHeader(ntable, headerstring);
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

// populate 
function PopulateDatum(key, arch, ttype, dscount, currentoperations, setDate,
                       datasets) {
         var darray = [];
         var i = 0;
         var formData = new FormData(document.getElementById('filterForm'));
         var setMemType = formData.get("memselector");
         var setSig = formData.get("sigalg");

         for (j = 0; j < chartTypes.length; j++)
            darray[j] = [];
         var kname=key+" ("+arch+ttype+")";
         for (var i in currentoperations) {
           var date = currentoperations[i];
           if ((setDate==undefined)||(setDate=="All")||(setDate==date)) {
              try { // not all dates may be filled with numbers
                 if (setSig == undefined) {
                   jso = jsonarray[date][key];
                 }
                 else {
                   jso = jsonarray[date][setSig][key];
                 }
                 if (jso === undefined) // alg may be gone
                   console.log("JSO unknown for "+key);
                 else 
                 for (j = 0; j < chartTypes.length; j++) {
                    var cT = chartTypes[j];
                    if (setMemType == undefined) {
                       // special logic for "op/s": Treat like both "encap/s" and "decap/s"
                       if ((cT == "encap/s") || (cT == "decap/s")) {
                          if ("op/s" in jso[arch][ttype]) {
                             darray[j][i] = jso[arch][ttype]["op/s"];
                          }
                          else
                             darray[j][i] = jso[arch][ttype][cT];
                        }
                        else
                             darray[j][i] = jso[arch][ttype][cT];
                    }
                    else {
                        darray[j][i] = jso[arch][ttype][cT][setMemType];
                    }
                 }
              }
              catch(e) {
                 for (j = 0; j < chartTypes.length; j++) 
                    darray[j][i] = NaN;
              }
              i=i+1;
           }
         }
         if (i>1) { // do line chart
            var borderdash = [];
            bd = 1; // default for "-noport"
            if (ttype=="-ref") bd=bd+1; 
            if (ttype=="") bd=bd+2; 
            if (arch=="aarch64") bd=bd*2;
            if (arch=="m1") bd=bd*3;
            if (bd>1) borderdash = [bd];

            for (j = 0; j < chartTypes.length; j++) {
              datasets[j][dscount]={
                borderColor: getColor(key),
                borderDash: borderdash,
                label: kname,
                fill: false,
                data: darray[j]
              }
            }
         }
         else { // do bar chart
            for (j = 0; j < chartTypes.length; j++) {
               datasets[j][dscount]={
                  backgroundColor: getColor(key),
                  label: kname,
                  data: darray[j]
                }
            }
         }
         return datasets;
}

// main chart-generator function
// only populate config data if fullInit set to true
function LoadData(fullInit, cleanSlate) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var sigalgOption = document.getElementById('sigalg');
    var datasets=[];
    var archsets=[];
    var ttypesets=[];
    var dscount=0;
    var charttype = "bar";
    var selectbysig = undefined;

    for (j = 0; j < chartTypes.length; j++)
       datasets[j] = [];

    if (cleanSlate) {
       var table = document.getElementById('configtable');
       clearTable(table);
       CleanSlate();
    }
    if (charts==undefined) {
       charts = [];
       for (i = 0; i < chartTypes.length; i++) 
         charts[i]=undefined;
    }

    if (jsonarray == undefined) { // loading data just once
       [jsonarray, refobj, alloperations] = loadJSONArray(formData, false, undefined);
    }

    if (sigalgOption != null) {
       if ((sigalgs.length == 0) && (refobj != undefined)) {
          // populate sigalgs array just once
          // remove initial default option
          sigalgOption.remove(0); 
          Object.keys(refobj).forEach(function(key) {
            var option = document.createElement("option");
            option.text = key;
            sigalgs.push(key);
            sigalgOption.add(option);
          });
          currentsigalg = sigalg;
       }
       selectbysig = sigalgOption.value;
    }


    if (refobj==undefined) { // no data yet
       return;
    }

    // obtain this only now as loadJSONArray could have changed it:
    var setDate = formData.get("date");
    var setArch = formData.get("archselector");
    var setTType = formData.get("refselector");
    var setMemType = formData.get("memselector");
    var archs = [];
    var ttypes = [];

    if (selectbysig == undefined) ro = refobj;
    else ro = refobj[selectbysig];
    Object.keys(ro).sort().forEach(function(key) {
       //console.log(key);
       if (!(key.startsWith("config"))&&!(key.startsWith("cpuinfo"))&&(filterOQSKeyByName(key)!=undefined))  {
         // construct data name: <key>[(arch)-][ttype]
         if (setDate!="All") {
            currentoperations=[];
            currentoperations[0]=setDate;
         }
         else {
            currentoperations=alloperations;
         }
         if (selectbysig === undefined) jso = jsonarray[currentoperations[0]][key];
         else jso = jsonarray[currentoperations[0]][selectbysig][key];
         try {
          Object.keys(jso).forEach(function(arch) {
            if (!archs.includes(arch)) archs.push(arch);
            Object.keys(jso[arch]).forEach(function(ttype) {
            if (!ttypes.includes(ttype)) ttypes.push(ttype);
            if (((setArch == "All") || (setArch == arch)) && 
                ((setTType == "All") || checkTTypeMatch(setTType, ttype))) {
               datasets = PopulateDatum(key, arch, ttype, dscount, currentoperations, setDate, datasets);
               archsets[dscount]=arch;
               ttypesets[dscount]=ttype;
               dscount++;
            }
            });
          });
          }
          catch(te) {
            // TypeError possible if unknown/old alg type in key (-> empty JSO)
            if (te.name != "TypeError") console.log("Unexpected error: "+te);
          }
       }
       else { 
         if (setDate=="All")
            addConfigtable(fullInit, key, refobj);
         else {
            addConfigtable(fullInit, key, jsonarray[setDate]);
         }
       }
   });
   if (currentoperations.length > 1) charttype="line";
   if (!fullInitDone) fullInitDone=true;

   var dsmin = [];
   for (j = 0; j < chartTypes.length; j++)
      dsmin[j] = parseInt(formData.get(chartTypes[j]+"min"));

   var displaylegend = formData.get("legend")==null?false:true;

   for (j = 0; j < chartTypes.length; j++) {
      if (charts[j]===undefined) {
         var chartLabel = chartTypes[j];
         if (setMemType==undefined) { // this is a speed chart
            if (!chartLabel.includes("/s"))
               chartLabel=chartLabel+"/s";
         }
         else { // this is a memory chart
            chartLabel=chartLabel+" (Bytes)";
         }
         charts[j] = new Chart(document.getElementById(chartTypes[j]+"Chart"), {
           type: charttype,
           data: {
             labels: currentoperations,
             datasets: datasets[j]
           },
           options: {
             animation: false,
             legend: {
               display: displaylegend
             },
             scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: chartLabel
                }
              }]
            }
           }
         });
      }
   }
   // Filter logic
   var tabledata=[];
   for (i = 0; i < charts[0].data.datasets.length; i++) { 
       var specidx = -1;
       // remove arch-specific appendix from complete alg name:
       basename = charts[0].data.datasets[i].label;
       for (ai = 0; ai < archs.length; ai++) {
          if (specidx <= 0) {
             specidx = basename.indexOf(" ("+archs[ai])
          }
       }
       if (specidx > 0) basename = basename.substring(0, specidx);
       var hide = false;
       // check values at reference object/date to decide what to keep globally
       for (j = 0; j < chartTypes.length; j++) {
          try {
             if (ro[basename][archsets[i]][ttypesets[i]][chartTypes[j]]<dsmin[j])
                hide=true;
          }
          catch(e) {
            console.log(e);
          }
       }
       if (hide || 
          (nOKAtNISTLevel(formData.get("nistlevel"), basename))||
          (!isSelectedOQSFamily(basename))
         ) {
           
           for (j = 0; j < chartTypes.length; j++) 
              charts[j].data.datasets[i].hidden=true;
       }
       else {
         if (setDate!="All") {
           var k = charts[0].data.datasets[i].label;
           try {
              var addk = [];
              addk[0] = k;
              var l = 1;
              var setSig = formData.get("sigalg");

              if (setSig == undefined) jso = jsonarray[setDate][basename];
              else jso = jsonarray[setDate][setSig][basename];

              for (j = 0; j < chartTypes.length; j++) {
                 cT = chartTypes[j];
                 if (setMemType==undefined) {
                    // special logic for "op/s": Treat like both "encap/s" and "decap/s"
                    if ((cT == "encap/s") || (cT == "decap/s")) {
                        if ("op/s" in jso[archsets[i]][ttypesets[i]]) {
                           addk[l]=jso[archsets[i]][ttypesets[i]]["op/s"];
                        }
                        else {
                           addk[l]=jso[archsets[i]][ttypesets[i]][chartTypes[j]];
                        }
                    }
                    else {
                           addk[l]=jso[archsets[i]][ttypesets[i]][chartTypes[j]];
                    }
                    l=l+1;
                    if ((chartTypes[j] != "handshakes") && (!chartTypes[j].includes("/s"))) {
                      addk[l]=jso[archsets[i]][ttypesets[i]][chartTypes[j]+"cycles"];
                      l=l+1;
                    }
                 }
                 else {
                    addk[l]=jso[archsets[i]][ttypesets[i]][chartTypes[j]]["maxHeap"];
                    l=l+1;
                    addk[l]=jso[archsets[i]][ttypesets[i]][chartTypes[j]]["maxStack"];
                    l=l+1;
                 }
              }
              tabledata.push(addk);
           }
           catch (e) { // ref data may not be present
              tabledata.push([ k, undefined, undefined, undefined, undefined, undefined, undefined ]);
           }
         }
         for (j = 0; j < chartTypes.length; j++) 
            charts[j].data.datasets[i].hidden=false;
       }
     }
     for (j = 0; j < chartTypes.length; j++) 
         charts[j].update();
     fillNumberTable(tabledata, setDate);
}

LoadData(true);

