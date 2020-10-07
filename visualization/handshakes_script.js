var myChart=undefined;
var sigalgs=[];


function LoadFile() {
    var filterForm = document.getElementById('filterForm');
    var sigalgOption = document.getElementById('sigalg');
    var formData = new FormData(filterForm);
    var sigalg = formData.get("sigalg")
    if (sigalg==null) {
      console.log("Could not determine signature algorithm. Setting default.");
      sigalg="dilithium3"
    }
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
    var obj = JSON.parse(fulljson)
    if (sigalgs.length==0) {
       // remove initial default option
       sigalgOption.remove(0); 
       Object.keys(obj).forEach(function(key) {
         var option = document.createElement("option");
         option.text = key;
         sigalgs.push(key);
         sigalgOption.add(option);
       })
    }
    var kemobj = obj[sigalg];
    Object.keys(kemobj).forEach(function(key) {
    var value=kemobj[key];
    datasets[dscount]={
      backgroundColor : getColor(key),
      hidden: (value<shakemin)?true:false,
      label :key,
      // this is where to add time series data
      data : [value]
    }
    dscount++;
   })
   displayData(datasets, parseInt(formData.get("shakemin")));
}

function handleForm(event) { event.preventDefault(); } 

function SubmitForm(event) {
    var filterForm = document.getElementById('filterForm');
    var formData = new FormData(filterForm);
    filterForm.addEventListener('submit', handleForm);
    // completely redo chart
    myChart.destroy();
    myChart=undefined;
    LoadFile();
    event.preventDefault();
}

function displayData(datasets, shakemin) {
   // Our labels along the x-axis
   var operations = ["handshakes/s"];
   var ctx = document.getElementById("speedChart");
   if (myChart===undefined) {
      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: operations,
          datasets: datasets
        }
      });
   }
   if (shakemin>0) {
     for (let i of myChart.data.datasets) {
       if (i.data[0]<shakemin) {
           i.hidden=true;
       }
       else {
           i.hidden=false;
       }
     }
     myChart.update();
     //console.log(myChart.data.datasets);
   }
}



