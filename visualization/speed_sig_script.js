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
      datasets[dscount]={
        backgroundColor :getColor(key),
        hidden: (innerobj.keygen<keygenmin)?true:false,
        label :key,
        data : [innerobj.keypair,innerobj.sign,innerobj.verify]
      }
      dscount++;
    }
   })
   displayData(datasets, parseInt(formData.get("keygenmin")));
}

function handleForm(event) { event.preventDefault(); } 

function SubmitForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', handleForm);
    displayData(undefined, parseInt(formData.get("keygenmin")), parseInt(formData.get("signmin")), parseInt(formData.get("verifymin")));
    event.preventDefault();
}

function displayData(datasets, keygenmin, signmin, verifymin) {
   // Our labels along the x-axis
   var operations = ["Keygen/s","Sign/s","Verify/s"];
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
   else {
     for (let i of theChart.data.datasets) {
       if ((i.data[0]<keygenmin)||(i.data[1]<signmin)||(i.data[2]<verifymin)) {
           i.hidden=true;
       }
       else {
           i.hidden=false;
       }
     }
     theChart.update();
     //console.log(myChart.data.datasets);
   }
}



