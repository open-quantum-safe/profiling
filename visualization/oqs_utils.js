var cmkeys=[];

function RetrieveData(url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
       result = xmlhttp.responseText;
    }
    return result;
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

// Structured lattice https://coolors.co/gradient-palette/00ba63-0b4a2d?number=20
"kyber512":"#00ba63",
"kyber768":"#01b640",
"kyber1024":"#01ae5d",
"kyber90s512":"#02a85a",
"kyber90s768":"#02a258",
"kyber90s1024":"#039d55",
"Kyber512":"#00ba63", 
"Kyber768":"#01b640", 
"Kyber1024":"#01ae5d", 
"Kyber512-90s":"#02a85d", 
"Kyber768-90s":"#02a258", 
"Kyber1024-90s":"#039d55", 
"ntru_hps2048509":"#058549",
"ntru_hps2048677":"#067f47",
"ntru_hps4096821":"#067944",
"ntru_hrss701":"#077341",
"lightsaber":"#0a5633",
"saber":"#0a5030",
"firesaber":"#0b4a2d",
"NTRU-HPS-2048-509":"#058549", 
"NTRU-HPS-2048-677":"#067f47", 
"NTRU-HPS-4096-821":"#067944", 
"NTRU-HRSS-701":"#077341", 
"LightSaber-KEM":"#0a5633", 
"Saber-KEM":"#0a5030", 
"FireSaber-KEM":"#0b4a2d", 
// https://coolors.co/gradient-palette/93c5f0-297fcb?number=20
"DILITHIUM_2":"#93C5F0", 
"DILITHIUM_3":"#88BEEC", 
"DILITHIUM_4":"#7DB6E8", 
"DILITHIUM2":"#93C5F0", 
"DILITHIUM3":"#88BEEC", 
"DILITHIUM4":"#7DB6E8", 
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
"bike1l1cpa":"#ff2600",
"bike1l3cpa":"#fd2904",
"bike1l1fo":"#fc2c07",
"bike1l3fo":"#f73412",
"BIKE1-L1-CPA":"#ff2600", 
"BIKE1-L3-CPA":"#fd2904", 
"BIKE1-L1-FO":"#fc2c07", 
"BIKE1-L3-FO":"#f73412", 
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
"Rainbow-Ia-Classic":"#C61536", 
"Rainbow-Ia-Cyclic":"#C51433", 
"Rainbow-Ia-Cyclic-Compressed":"#C2122D", 
"Rainbow-IIIc-Classic":"#C0112B", 
"Rainbow-IIIc-Cyclic":"#BD0E25", 
"Rainbow-IIIc-Cyclic-Compressed":"#BC0D22", 
"Rainbow-Vc-Classic":"#BA0C1F", 
"Rainbow-Vc-Cyclic":"#B90B1C", 
"Rainbow-Vc-Cyclic-Compressed":"#B70A1A", 
}

function getColor(alg) {
   if (!(alg in ColorMap)) {
      console.log(alg+": missing perfect color - checking heuristics");
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

var l1algs =  "bike1-l1-fo bike1l1fo kyber512 kyber512-90s kyber90s512 classic-mceliece-348864 classic-mceliece-348864f lightsaber-kem lightsaber hqc-128-1-cca2 hqc128_1_cca2 frodokem-640-aes frodo640aes frodokem-640-shake frodo640shake ntru-hps-2048-509 ntru_hps2048509 sidh-p434 sidhp434 sidh-p434-compressed sidh-p503 sidhp503 sidh-p503-compressed sike-p434 sikep434 sike-p434-compressed sike-p503 sike-p503-compressed sikep503 " ;
var l3algs =  "bike1-l3-fo bike1l3fo kyber768 kyber768-90s kyber90s768 classic-mceliece-460896 classic-mceliece-460896f saber-kem saber hqc-192-1-cca2 hqc192_1_cca2 hqc-192-2-cca2 hqc192_2_cca2 frodokem-976-aes frodo976aes frodokem-976-shake frodo976shake ntru-hps-2048-677 ntru_hps2048677 ntru-hrss-701 ntru_hrss701 sidh-p610 sidhp610 sidh-p610-compressed sike-p610 sikep610 sike-p610-compressed " ;
var l5algs =  "kyber1024 kyber1024-90s kyber90s1024 classic-mceliece-6688128 classic-mceliece-6688128f classic-mceliece-6960119 classic-mceliece-6960119f classic-mceliece-8192128 classic-mceliece-8192128f firesaber-kem firesaber hqc-256-1-cca2 hqc256_1_cca2 hqc-256-2-cca2 hqc256_2_cca2 hqc-256-3-cca2 hqc256_3_cca2 frodokem-1344-aes frodo1344aes frodokem-1344-shake frodo1344shake ntru-hps-4096-821 ntru_hps4096821 sidh-p751 sidhp751 sidh-p751-compressed sike-p751 sikep751 sike-p751-compressed" ;

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

function filterOQSKeyByName(key) {
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

function fillDownloadTable(setDate, filename) {
     var dtable = document.getElementById('downloadtable');
     clearTable(dtable);
     var tr = dtable.insertRow(-1);
     var tabCell = tr.insertCell(-1);
     tabCell.style.width = "20%";
     tabCell.style.textAlign = "center";
     tabCell.innerHTML = "Raw Data";
     tabCell = tr.insertCell(-1);
     tabCell.style.width = "80%";
     tabCell.style.textAlign = "center";
     var a = document.createElement('a');
     var linkText = document.createTextNode(setDate);
     a.appendChild(linkText);
     a.title = setDate;
     a.href = "/"+setDate+"/"+filename;
     tabCell.innerHTML = null;
     tr.cells[1].appendChild(a);
}

function isSelectedOQSFamily(toTest) {
  var select = document.getElementById("familyselector");
  var options = select && select.options;
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

function loadJSONArray(formData) {
       var dateOption = document.getElementById('date');
       var d;
       if (formData.get("datafile").endsWith(".json")) { // single JSON to load
         firstobj = jsonarray["All"] = JSON.parse(RetrieveData(formData.get("datafile")));
       }
       else { // iterate through resources...
          var urls = RetrieveData(formData.get("datafile")).split("\n");
          var filldates = (dateOption.options.length==1);
          urls.forEach(function (url, index) {
            if (url.length>0) {
                d = url.substring(0, url.indexOf("/"));
                try {
                   data = JSON.parse(RetrieveData(url));
                   jsonarray[d] = data;
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
                catch(e) {
                   console.log("Error loading "+url);
                }
            }
          });
       }
       if (dateOption.options.length==2) { // single date only; remove leading "All" option
          dateOption.remove(0);
          formData.set("date", d);
       }
}
