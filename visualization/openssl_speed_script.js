var theChart=undefined;

function LoadFile() {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    var datasets=[];
    var dscount=0;
    var oFrame = document.getElementById("frmFile");
    var strRawContents = oFrame.contentWindow.document.body.childNodes[0].innerHTML;
    while (strRawContents.indexOf("\r") >= 0)
        strRawContents = strRawContents.replace("\r", "");
    var arrLines = strRawContents.split("\n");
    var fulljson="";
    for (var i = 0; i < arrLines.length; i++) {
        fulljson = fulljson+arrLines[i];
    }
    //console.log(fulljson);
    var obj = JSON.parse(fulljson);
    Object.keys(obj).forEach(function(key) {
    if ((key!="config")&&(key!="cpuinfo"))  {
      var innerobj=obj[key];
      var ds=[];
      // Order: ["Keygen/s","Encaps/s","Decaps/s","Sign/s","Verify/s"];
      if (innerobj["op/s"] != undefined) {
           ds = [0,innerobj["op/s"],innerobj["op/s"],0,0];
      }
      else {
           ds = [innerobj["keygen/s"],innerobj["encap/s"],innerobj["decap/s"],innerobj["sign/s"],innerobj["verify/s"]];
      }
      datasets[dscount]={
        backgroundColor :getColor(key),
        hidden: (innerobj.keygen<keygenmin)?true:false,
        label :key,
        data: ds,
      }
      dscount++;
    }
   })
   displayData(datasets, parseInt(formData.get("keygenmin")), parseInt(formData.get("encapmin")), parseInt(formData.get("decapmin")), parseInt(formData.get("signmin")), parseInt(formData.get("verifymin")), formData.get("oqsalg")=="OQS only");
}

function handleForm(event) { event.preventDefault(); } 

function SubmitForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', handleForm);
    displayData(undefined, parseInt(formData.get("keygenmin")), parseInt(formData.get("encapmin")), parseInt(formData.get("decapmin")), parseInt(formData.get("signmin")), parseInt(formData.get("verifymin")), formData.get("oqsalg")=="OQS only");
    event.preventDefault();
}

function displayData(datasets, keygenmin, encapmin, decapmin, signmin, verifymin, knowncolor) {
   // Our labels along the x-axis
   var operations = ["Keygen/s","Encaps/s","Decaps/s","Sign/s","Verify/s"];
   var ctx = document.getElementById("speedChart");
   if (theChart===undefined) {
      theChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: operations,
          datasets: datasets
        }
      });
   }
   //else {
     for (let i of theChart.data.datasets) {
      // Order: ["Keygen/s","Encaps/s","Decaps/s","Sign/s","Verify/s"];
       if ( 
           ((keygenmin>0) && ((i.data[0]<keygenmin) || (i.data[0]==undefined))) ||
           ((encapmin>0) && ((i.data[1]<encapmin) || (i.data[1]==undefined))) ||
           ((decapmin>0) && ((i.data[2]<decapmin) || (i.data[2]==undefined))) ||
           ((signmin>0) && ((i.data[3]<signmin) || (i.data[3]==undefined))) ||
           ((verifymin>0) && ((i.data[4]<verifymin) || (i.data[4]==undefined))) ||
           (knowncolor && i.backgroundColor==undefined) 
          ) {
             i.hidden=true;
       }
       else {
           i.hidden=false;
       }
     }
     theChart.update();
     //console.log(myChart.data.datasets);
   //}
}



