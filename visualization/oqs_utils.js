var cmkeys=[];
// legend toggle
var legendstate = false;

function RetrieveData(url, async) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, async);
  if (async) {
    xhr.onload = function (e) {
      var ld = xhr.responseURL.lastIndexOf("/");
      date = xhr.responseURL.substring(ld-10,ld);
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            jd = JSON.parse(xhr.responseText);
            var nro = undefined; // candidate new reference object
            if (jsonarray == undefined) {
                 jsonarray={};
            }
            if (jsonarray[date] == undefined) {
                 jsonarray[date]={};
            }
            Object.keys(jd).forEach(function(key) {
               if (xhr.responseURL.includes("-ref.json")) {
                    jsonarray[date][key+"-ref"]=jd[key];
                    // ensure only fully populated date entry becomes reference object
                    if ((jsonarray[date][key]!=undefined)&&(jsonarray[date][key+"-noport"]!=undefined)) {
                       nro = jsonarray[date];
                    }
               }
               else if (xhr.responseURL.includes("-noport.json")) {
                    jsonarray[date][key+"-noport"]=jd[key];
                    // ensure only fully populated date entry becomes reference object
                    if ((jsonarray[date][key]!=undefined)&&(jsonarray[date][key+"-ref"]!=undefined)) {
                       nro = jsonarray[date];
                    }
               }
               else {
                    jsonarray[date][key]=jd[key];
                    // ensure only fully populated date entry becomes reference object
                    if ((jsonarray[date][key+"-ref"]!=undefined)&&(jsonarray[date][key+"-noport"]!=undefined)) {
                       nro = jsonarray[date];
                    }
               }
            });

            if (nro != undefined) { // candidate new refobj available
              if (refobj==undefined) { // take nro as refobj
                 refobj=nro;
                 document.getElementById("date").value = date;
                 LoadData(true);
               }
               else { // check whether nro contains more keys than refobj; if so, it may be a new nro
                 var candidate = false;
                 Object.keys(nro).forEach(function(key) {
                   if (refobj[key]==undefined) {
                      candidate = true;
                    }
                  });
                  if (candidate) { // Now check whether it doesn't contain all that refobj contains
                      Object.keys(refobj).forEach(function(key) {
                         if (nro[key]==undefined) { // add prev refobj key
                            nro[key]=refobj[key];
                         }
                      });
                      refobj = nro;
                  }
               }
            }
            // activate this code to automatically show all data if all requested data sets have arrived; warning: Information overload :-)
            //if (Object.keys(jsonarray).length == alloperations.length) {
            //  CleanSlate();
            //  LoadData(false);
            //}
        } else {
           console.log("error getting "+xhr.responseURL);
           console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
  }
  xhr.send();
  if (!async) {
     if (xhr.status==200) {
        result = xhr.responseText;
     }
     else {
        console.log("Error retrieving "+url);
     }
     return result;
  }
}


// created with help from coolors.co
var ColorMap = {
// Unstructured lattice: https://coolors.co/gradient-palette/8448b0-401062?number=10
"frodo640aes":"#8448b0",
"frodo640shake":"#7c42a7",
"frodo976aes":"#753c9f",
"frodo976shake":"#6d3596",
"frodo1344aes":"#662f8d",
"frodo1344shake":"#5e2985",
"FrodoKEM-640-AES":"#8448b0", 
"FrodoKEM-640-SHAKE":"#7c42a7", 
"FrodoKEM-976-AES":"#753c9f", 
"FrodoKEM-976-SHAKE":"#6d3596", 
"FrodoKEM-1344-AES":"#662f8d", 
"FrodoKEM-1344-SHAKE":"#5e2985", 

// Structured lattice https://coolors.co/gradient-palette/00ba63-0b4a2d?number=30
// and https://coolors.co/gradient-palette/0b4a2d-000000?number=30
"kyber512":"#00BA63",
"kyber768":"#00B661",
"kyber1024":"#01B25F",
"kyber90s512":"#01AE5D",
"kyber90s768":"#02AB5C",
"kyber90s1024":"#02A75A",
"Kyber512":"#02A358", 
"Kyber768":"#039F56", 
"Kyber1024":"#039B54", 
"Kyber512-90s":"#039752", 
"Kyber768-90s":"#049350", 
"Kyber1024-90s":"#04904F", 
"ntru_hps2048509":"#058C4D",
"ntru_hps2048677":"#05884B",
"ntru_hps4096821":"#068047",
"ntru_hrss701":"#067C45",
"lightsaber":"#067843",
"saber":"#077441",
"firesaber":"#086D3E",
"NTRU-HPS-2048-509":"#08693C", 
"NTRU-HPS-2048-677":"#08653A", 
"NTRU-HPS-4096-821":"#096138", 
"NTRU-HRSS-701":"#095D36", 
"ntrulpr653":"#095934",
"ntrulpr761":"#0A5633",
"ntrulpr857":"#0A5231",
"sntrup653":"#0B4E2F",
"sntrup761":"#0B4A2D",
"sntrup857":"#0B472B",
"LightSaber-KEM":"#0A452A", 
"Saber-KEM":"#0A4228", 
"FireSaber-KEM":"#094027", 
// https://coolors.co/gradient-palette/93c5f0-297fcb?number=20
"Dilithium2":"#93C5F0",
"Dilithium3":"#88BEEC",
"Dilithium5":"#7DB6E8",
"DILITHIUM2":"#93C5F0",
"DILITHIUM3":"#88BEEC",
"DILITHIUM5":"#7DB6E8",
"Dilithium2-AES":"#77B3E6",
"Dilithium3-AES":"#6CABE2",
"Dilithium5-AES":"#61A4DE",
"dilithium2_aes":"#77B3E6",
"dilithium3_aes":"#6CABE2",
"dilithium5_aes":"#61A4DE",
"Falcon-512":"#5BA0DD",
"Falcon-1024":"#3A8AD1",

//Isogenies https://coolors.co/gradient-palette/8b1100-531108?number=10
"sidhp434":"#8b1100",
"sidhp503":"#851101",
"sidhp610":"#7f1102",
"sidhp751":"#781103",
"SIDH-p434":"#8b1100", 
"SIDH-p503":"#851101", 
"SIDH-p610":"#7f1102", 
"SIDH-p751":"#781103", 
// slight R adaptation
"SIDH-p434-compressed":"#8a1100", 
"SIDH-p503-compressed":"#841101", 
"SIDH-p610-compressed":"#7e1102", 
"SIDH-p751-compressed":"#771103", 
"sikep434":"#721104",
"sikep503":"#6c1104",
"sikep610":"#661105",
"sikep751":"#5f1106",
"SIKE-p434":"#721104", 
"SIKE-p503":"#6c1104", 
"SIKE-p610":"#661105", 
"SIKE-p751":"#5f1106", 
// slight R adaptation
"SIKE-p434-compressed":"#711104", 
"SIKE-p503-compressed":"#6b1104", 
"SIKE-p610-compressed":"#651105", 
"SIKE-p751-compressed":"#5e1106",

// Quasi cyclic https://coolors.co/gradient-palette/ff2600-e15c45?number=20
"bikel1":"#ff2600",
"bikel3":"#fd2904",
"BIKE-L1":"#ff2600", 
"BIKE-L3":"#fd2904", 
"hqc128_1_cca2":"#f63716",
"hqc192_1_cca2":"#f43a19",
"hqc192_2_cca2":"#f14021",
"hqc256_1_cca2":"#ef4224",
"hqc256_2_cca2":"#ee4528",
"hqc256_3_cca2":"#ec482c",
"HQC-128-1-CCA2":"#f63716", 
"HQC-192-1-CCA2":"#f43a19", 
"HQC-192-2-CCA2":"#f14021", 
"HQC-256-1-CCA2":"#ef4224", 
"HQC-256-2-CCA2":"#ee4528", 
"HQC-256-3-CCA2":"#ec482c", 
// spreading out https://coolors.co/gradient-palette/ff2600-eb3e20?number=30 &&
// https://coolors.co/gradient-palette/eb3e20-de543c?number=30
"SPHINCS+-Haraka-128f-robust":"#ff2600", 
"SPHINCS+-Haraka-128f-simple":"#FE2701", 
"SPHINCS+-Haraka-128s-robust":"#FE2802", 
"SPHINCS+-Haraka-128s-simple":"#FD2803", 
"SPHINCS+-Haraka-192f-robust":"#FC2904", 
"SPHINCS+-Haraka-192f-simple":"#FC2A06", 
"SPHINCS+-Haraka-192s-robust":"#FB2B07", 
"SPHINCS+-Haraka-192s-simple":"#FA2C08", 
"SPHINCS+-Haraka-256f-robust":"#F92D09", 
"SPHINCS+-Haraka-256f-simple":"#F82E0B", 
"SPHINCS+-Haraka-256s-robust":"#F72F0C", 
"SPHINCS+-Haraka-256s-simple":"#F7300D", 
"SPHINCS+-SHA256-128f-robust":"#F6310E", 
"SPHINCS+-SHA256-128f-simple":"#F5320F", 
"SPHINCS+-SHA256-128s-robust":"#F53211", 
"SPHINCS+-SHA256-128s-simple":"#F43312", 
"SPHINCS+-SHA256-192f-robust":"#F33514", 
"SPHINCS+-SHA256-192f-simple":"#F23615", 
"SPHINCS+-SHA256-192s-robust":"#F13716", 
"SPHINCS+-SHA256-192s-simple":"#F03818", 
"SPHINCS+-SHA256-256f-robust":"#EE3A1A", 
"SPHINCS+-SHA256-256f-simple":"#EE3B1C", 
"SPHINCS+-SHA256-256s-robust":"#ED3C1D", 
"SPHINCS+-SHA256-256s-simple":"#EC3C1E", 
"SPHINCS+-SHAKE256-128f-robust":"#EC3D1F", 
"SPHINCS+-SHAKE256-128f-simple":"#EB3E20", 
"SPHINCS+-SHAKE256-128s-robust":"#EB3F21", 
"SPHINCS+-SHAKE256-128s-simple":"#EA4022", 
"SPHINCS+-SHAKE256-192f-robust":"#E94124", 
"SPHINCS+-SHAKE256-192f-simple":"#E84326", 
"SPHINCS+-SHAKE256-192s-robust":"#E74428", 
"SPHINCS+-SHAKE256-192s-simple":"#E74529", 
"SPHINCS+-SHAKE256-256f-robust":"#E7462A", 
"SPHINCS+-SHAKE256-256f-simple":"#E6462B", 
"SPHINCS+-SHAKE256-256s-robust":"#E5482D", 
"SPHINCS+-SHAKE256-256s-simple":"#E5492E", 
"picnic_L1_FS":"#E34B30", 
"picnic_L1_UR":"#E24C32", 
"picnic_L1_full":"#E24E34", 
"picnic_L3_FS":"#E14F36", 
"picnic_L3_UR":"#E05037", 
"picnic_L3_full":"#E05138", 
"picnic_L5_FS":"#DF5239", 
"picnic_L5_UR":"#DF523A", 
"picnic_L5_full":"#DE533B", 
"picnic3_L1":"#DE543C", 
"picnic3_L3":"#E34C31", 
"picnic3_L5":"#E5482D",

// McEliece https://coolors.co/gradient-palette/ff7200-cf6e1f?number=20
"Classic-McEliece-348864":"#ff7200", 
"Classic-McEliece-348864f":"#fc7202", 
"Classic-McEliece-460896":"#fa7203", 
"Classic-McEliece-460896f":"#f77105", 
"Classic-McEliece-6688128":"#f57107", 
"Classic-McEliece-6688128f":"#f27108", 
"Classic-McEliece-6960119":"#f0710a", 
"Classic-McEliece-6960119f":"#ed710b", 
"Classic-McEliece-8192128":"#e8700f", 
"Classic-McEliece-8192128f":"#e67010", 

// Multivariate https://coolors.co/gradient-palette/c61536-aa0000?number=20
"Rainbow-I-Circumzenithal":"#C61536",
"Rainbow-I-Classic":"#C51433",
"Rainbow-I-Compressed":"#C2122D",
"Rainbow-III-Circumzenithal":"#C0112B",
"Rainbow-III-Classic":"#BD0E25",
"Rainbow-III-Compressed":"#BC0D22",
"Rainbow-V-Circumzenithal":"#BA0C1F",
"Rainbow-V-Classic":"#B90B1C",
"Rainbow-V-Compressed":"#B70A1A",
}

function getColor(alg) {
   // -ref algs get the same color:
   if (alg.substring(alg.length-4, alg.length)=="-ref") {
      alg = alg.substring(0, alg.length-4);
   }
   // -noport algs get the same color:
   if (alg.substring(alg.length-7, alg.length)=="-noport") {
      alg = alg.substring(0, alg.length-7);
   }
   if (!(alg in ColorMap)) {
      //console.log(alg+": missing perfect color - checking heuristics");
   }
   else {
      return ColorMap[alg];
   }
   // try to find regardless: Remove all special characters in ColorMap.keys and do lowercase-only compare:
   // first populate cmkeys map:
   if (cmkeys.length == 0) {
      Object.keys(ColorMap).forEach(function(key) {
       var nk = key.toLowerCase().replace(/\-|\+|\_/g, "");
       cmkeys[nk]=key;
      });
   }
   // now check for perfect lowercase match:
   var lcalg = alg.toLowerCase();
   if (lcalg in cmkeys) {
     return ColorMap[cmkeys[lcalg]];
   }
   // now check for hybrids: Would be indicated by leading string with _
   if (lcalg.includes("_")) {
      var blcalg = lcalg.substring(lcalg.indexOf("_")+1);
      if (blcalg in cmkeys) {
        // TBD: Change color for hybrid?
        return ColorMap[cmkeys[blcalg]];
      }
   }
   return undefined;
}

// List of all algs as per NIST level
// ToDo: Generate automatically

var l1algs =  "bike-l1 bikel1 kyber512 kyber512-90s kyber90s512 classic-mceliece-348864 classic-mceliece-348864f lightsaber-kem lightsaber hqc-128-1-cca2 hqc128_1_cca2 frodokem-640-aes frodo640aes frodokem-640-shake frodo640shake ntru-hps-2048-509 ntru_hps2048509 sidh-p434 sidhp434 sidh-p434-compressed sidh-p503 sidhp503 sidh-p503-compressed sike-p434 sikep434 sike-p434-compressed sike-p503 sike-p503-compressed sikep503 dilithium2 dilithium2-aes falcon-512 picnic3_l1 picnic_l1_fs picnic_l1_ur picnic_l1_full rainbowicircumzenithal rainbowicompressed rainbowiclassic rainbow-i-circumzenithal rainbow-i-compressed rainbow-i-classic sphincs+-shake256-128s-simple sphincs+-shake256-128s-robust sphincs+-shake256-128f-simple sphincs+-shake256-128f-robust sphincs+-sha256-128s-simple sphincs+-sha256-128s-robust sphincs+-sha256-128f-simple sphincs+-sha256-128f-robust sphincs+-haraka-128s-simple sphincs+-haraka-128s-robust sphincs+-haraka-128f-simple sphincs+-haraka-128f-robust ntrulpr653 sntrup653" ;
var l3algs =  "bike-l3 bikel3 kyber768 kyber768-90s kyber90s768 classic-mceliece-460896 classic-mceliece-460896f saber-kem saber hqc-192-1-cca2 hqc192_1_cca2 hqc-192-2-cca2 hqc192_2_cca2 frodokem-976-aes frodo976aes frodokem-976-shake frodo976shake ntru-hps-2048-677 ntru_hps2048677 ntru-hrss-701 ntru_hrss701 sidh-p610 sidhp610 sidh-p610-compressed sike-p610 sikep610 sike-p610-compressed dilithium_4 picnic3_l3 picnic_l3_fs picnic_l3_ur dilithium3 dilithium3-aes picnic_l3_full rainbowiiicircumzenithal rainbowiiicompressed rainbowiiiclassic rainbow-iii-circumzenithal rainbow-iii-compressed rainbow-iii-classic sphincs+-haraka-192s-simple sphincs+-haraka-192s-robust sphincs+-haraka-192f-simplesphincs+-haraka-192f-robust sphincs+-sha256-192s-simple sphincs+-sha256-192s-robustsphincs+-sha256-192f-simple sphincs+-sha256-192f-robust sphincs+-shake256-192s-simple sphincs+-shake256-192s-robust sphincs+-shake256-192f-simple sphincs+-shake256-192f-robust ntrulpr761 ntrulpr857 sntrup761 sntrup857" ;
var l5algs =  "kyber1024 kyber1024-90s kyber90s1024 classic-mceliece-6688128 classic-mceliece-6688128f classic-mceliece-6960119 classic-mceliece-6960119f classic-mceliece-8192128 classic-mceliece-8192128f firesaber-kem firesaber hqc-256-1-cca2 hqc256_1_cca2 hqc-256-2-cca2 hqc256_2_cca2 hqc-256-3-cca2 hqc256_3_cca2 frodokem-1344-aes frodo1344aes frodokem-1344-shake frodo1344shake ntru-hps-4096-821 ntru_hps4096821 sidh-p751 sidhp751 sidh-p751-compressed dilithium5 dilithium5-aes sike-p751 sikep751 sike-p751-compressed falcon-1024 picnic3_l5 picnic_l5_fs picnic_l5_ur picnic_l5_full rainbowvcircumzenithal rainbowvcompressed rainbowvclassic rainbow-v-circumzenithal rainbow-v-compressed rainbow-v-classic sphincs+-shake256-256s-simple sphincs+-shake256-256s-robust sphincs+-shake256-256f-simple sphincs+-shake256-256f-robust sphincs+-sha256-256s-simple sphincs+-sha256-256s-robust sphincs+-sha256-256f-simple sphincs+-sha256-256f-robust sphincs+-haraka-256s-simple sphincs+-haraka-256s-robust sphincs+-haraka-256f-simple sphincs+-haraka-256f-robust" ;

// check whether a specific algorithm (alg) is NOT OK at a given level (setLevel)
function nOKAtNISTLevel(setLevel, alg) {
   // -ref/-noport algs have the same strength:
   if (alg.substring(alg.length-4, alg.length)=="-ref") {
      alg = alg.substring(0, alg.length-4);
   }
   if (alg.substring(alg.length-7, alg.length)=="-noport") {
      alg = alg.substring(0, alg.length-7);
   }
   if (setLevel=="All") {
      return false;
   }
   if (setLevel=="Level 1") {
     if (l1algs.split(" ").includes(alg.toLowerCase())) return false;
   }
   if (setLevel=="Level 3") {
     if (l3algs.split(" ").includes(alg.toLowerCase())) return false;
   }
   if (setLevel=="Level 5") {
     if (l5algs.split(" ").includes(alg.toLowerCase())) return false;
   }
   return true;
}

// function to filter out generally specific key terms 
function filterOQSKeyByName(key) {
   if ((key.toLowerCase().includes("cpa"))||(key.toLowerCase().includes("default"))) {
     return undefined;
   }
   return key;
}

// helper function to clear HTML table
function clearTable(table) {
  while(table.rows.length > 0) {
    table.deleteRow(0);
  }
}

// helper function to add headings to HTML table
function addHeader(table, headings) {
   var cols = headings.split(" ");
   var hr = table.insertRow(-1);
   cols.forEach(function (item, index) {
     var hcell=document.createElement('TH')
     hcell.innerHTML = item;
     hr.appendChild(hcell);
   });
}

// helper function populating config information table
function addConfigtable(fullInit, key) {
         if ((!fullInitDone || fullInit) && filterOQSKeyByName(key)!=undefined && !key.includes("-ref") && !key.includes("-noport")) {
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

// helper function to set table of download links
function fillDownloadTable(setDate, filename) {
     var dtable = document.getElementById('downloadtable');
     clearTable(dtable);
     var tr = dtable.insertRow(-1);

     var tabCell = tr.insertCell(-1);
     tabCell.style.width = "20%";
     tabCell.style.textAlign = "center";
     tabCell.innerHTML = "Raw Data";

     tabCell = tr.insertCell(-1);
     tabCell.style.width = "30%";
     tabCell.style.textAlign = "center";
     var a = document.createElement('a');
     var linkText = document.createTextNode(setDate);
     a.appendChild(linkText);
     a.title = setDate;
     a.href = setDate+"/"+filename;
     tabCell.innerHTML = null;
     tr.cells[1].appendChild(a);

     tabCell = tr.insertCell(-1);
     tabCell.style.width = "30%";
     tabCell.style.textAlign = "center";
     var a = document.createElement('a');
     var linkText = document.createTextNode(setDate+"(ref)");
     a.appendChild(linkText);
     a.title = setDate+"(ref)";
     a.href = setDate+"/"+filename.substring(0,filename.length-5)+"-ref.json";
     tabCell.innerHTML = null;
     tr.cells[2].appendChild(a);

     tabCell = tr.insertCell(-1);
     tabCell.style.width = "30%";
     tabCell.style.textAlign = "center";
     var a = document.createElement('a');
     var linkText = document.createTextNode(setDate+"(noport)");
     a.appendChild(linkText);
     a.title = setDate+"(noport)";
     a.href = setDate+"/"+filename.substring(0,filename.length-5)+"-noport.json";
     tabCell.innerHTML = null;
     tr.cells[3].appendChild(a);
}

// returns true if algorithm toTest belongs to the OQS family set in the familyselector HTML form selector
// also used to filter out {reference|optimized} algorithms if ref algs {not} requested
function isSelectedOQSFamily(toTest) {
  var select = document.getElementById("familyselector");
  var refselect = new FormData(document.getElementById("filterForm")).get("refselector");
  if ((refselect == "Optimized non-portable only") && !(toTest.includes("-noport"))) return false;
  if ((refselect == "Reference only") && !(toTest.includes("-ref"))) return false;
  if ((refselect == "Optimized portable only") && ((toTest.includes("-ref")) || (toTest.includes("-noport")))) return false;
  var options = select && select.options;
  if (options[0].selected) return true;
  for (var j=0; j<options.length; j++) {
    var opt = options[j];

    if (opt.selected) {
      var sval = opt.value || opt.text;
      if (toTest.toLowerCase().includes(sval.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

function preventFormHandling(event) { event.preventDefault(); }

// function to load JSON data
// parameters:
// formData: HTML component containing reference to datafile
// loadRef: boolean determining whether reference data shall be loaded; 
//          if false, only optimized alg data is loaded (without -ref extension)
// refarray: is not undefined, contains ref alg data to be mixed in with optimized alg data
function loadJSONArray(formData, loadRef, refarray) {
    // values to be returned:
    var jsonarray = {};
    var refobj;
    var alldates = [];
       var dateOption = document.getElementById('date');
       var d;

       // format: "date/name[-ref].{json|list}"
       var fname = formData.get("datafile");
       var suffix = fname.substring(fname.length-5, fname.length);
       var prefix = fname.substring(0, fname.length-5);
       if (loadRef) {
          fname = prefix+"-ref"+suffix;
       }

       if (fname.endsWith(".json")) { // single JSON to load
         refobj = jsonarray["All"] = JSON.parse(RetrieveData(fname, false));
       }
       else { // iterate through resources in .list file:
          var urls = RetrieveData(fname, false).split("\n");
          // add dates only at first run (where dataOption only contains default "All" entry)
          var filldates = (dateOption.options.length==1);
          var idx = 0;
          urls.forEach(function (url, index) {
            if (url.length>0) {
                d = url.substring(0, url.indexOf("/"));
                alldates[idx++] = d;
                if (filldates) {
                      // add date to dateOption list
                      var option = document.createElement("option");
                      option.text = d;
                      dateOption.add(option);
                }
            }
          });
          urls.reverse().forEach(function (url, index) {
            if (url.length>0) {
                d = url.substring(0, url.indexOf("/"));
                try {
                   RetrieveData(url, true);
                   // also request -ref
                   var rname = url.substring(0,url.length-5)+"-ref"+url.substring(url.length-5, url.length);
                   RetrieveData(rname, true);
                   // also request -noport
                   var rname = url.substring(0,url.length-5)+"-noport"+url.substring(url.length-5, url.length);
                   RetrieveData(rname, true);
                }
                catch(e) {
                   console.log("Error loading "+url+":"+e);
                }
            }
          });
       }
       if (dateOption.options.length==2) { // single date only; remove leading "All" option
          dateOption.remove(0);
          formData.set("date", d);
       }
   return [jsonarray, refobj, alldates];
}

// Shared code

// called upon any filter change
function SubmitSIGForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', preventFormHandling);
    // completely redo chart if specific date selected
    var dateOption = document.getElementById('date');
    var d = formData.get("date")
    var displaylegend = formData.get("legend")==null?false:true;
    var memselector = formData.get("memselector");
    var forceClean = false;
    try {
       if (heapOrStack != memselector) forceClean=true;
     }
     catch(e) {
        // don't act on unavailable fields
     }

    // if toggling between specific date and series, or toggling legend redo chart (e.g., changing type)
    if ((d!="All")||(currentoperations.length!=alloperations.length)||(legendstate!=displaylegend)||forceClean) {
       legendstate = displaylegend;
       CleanSlate();
    }
    LoadData(false);
    event.preventDefault();
}

// called upon any filter change
function SubmitKEMForm(event) {
    SubmitSIGForm(event);
}

