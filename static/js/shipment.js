
let saveButton = document.getElementById('btgetDae');

let curDae = "";
let curExp = "";
$(document).ready(function(){

    $('input[id="expDate"]').prop('readonly', true);
      
  })

  $('#btUpdate').on('click', function(event) {
   enableUpdate();
   fetch(`transactionManager/saveConfig`, {
    method: 'POST',
    body: JSON.stringify({
        ftpIP : ftpIP,
        ftpPort:ftpPort,
        username:username,
        password:password,
        caat:caat
    }),
    headers:{
        'Content-Type': 'application/json'
    }
}).then(response => {
    return response.json();
}).then(saveResult => {
    saveButton.disabled = false;
    if (!saveResult.success) {
        alert("Success");
        return;
    }

    alert('Custom Field saved successfully!');
    cfInput.value = '';
    cfInput.focus();
})
.catch(result => {
    
    console.log(result);
});

   
  });
  $('#btgetDae').on('click', function(event) {
   //Need to save this into a JSON file if the update it's enabled.
   //after pull the DAE into the CF
   subMitValueMagaya();
   });
   $('#btCancel').on('click', function(event) {
    $('input[id="expDate"]').prop('readonly', true);
    $('input[id="expDate"]').datepicker('remove');
    $('input[id="daeTextField"]').prop('readonly', true);
    $('#btUpdate').attr("disabled", false);
    $('#btCancel').addClass("invisible");
    $('#btgetDae').text("Get this DAE");
    $('#daeTextField').val(curDae);
    $('#Expdate').val(curExp);
   });

  function enableUpdate()
  {
    $('input[id="expDate"]').prop('readonly', false);
    var date_input=$('input[id="expDate"]'); //our date input has the name "date"
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
      format: 'mm/dd/yyyy',
      container: container,
      todayHighlight: true,
      autoclose: true,
    };
    date_input.datepicker(options);
    $('input[id="daeTextField"]').prop('readonly', false);
    $('#btUpdate').attr("disabled", true);
    $('#btCancel').removeClass("invisible");
    $('#btgetDae').text("Save and Get this DAE");
   
  }
  function subMitValueMagaya()
  {
  
    let dae = document.getElementById('daeTextField').value;
    let shipperName = document.getElementById('divShipper').value;
    let destinationCountry = document.getElementById('divDestination').value;
    let expDate = document.getElementById('expDate').value;

    fetch(`./saveConfig`, {
        method: 'POST',
        body: JSON.stringify({
            dae : dae,
            shipperName:shipperName,
            destinationCountry:destinationCountry,
            expDate:expDate
        }),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json();
    }).then(saveResult => {
        saveButton.disabled = false;
        if (!saveResult.success) {
            return;
       }
       console.log("New DAE added to the log");
        
    })
    .catch(result => {
        
        console.log(result);
    });

    fetch(`transactionManager/${guid}/customfields`, {
        method: 'POST',
        body: JSON.stringify({
            customField : cfInput
        }),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json();
    }).then(saveResult => {
        saveButton.disabled = false;
        if (!saveResult.success) {
            alert(saveResult.error);
            return;
        }
    
        alert('Custom Field saved successfully!');
        //cfInput.value = '';
        //cfInput.focus();
    })
    .catch(result => {
        saveButton.disabled = false;
        console.log(result);
    });
  }

function displayShipmentData(sh) {
    let divShipper = document.getElementById('divShipper');
    fetch(`./getConfig/${sh.ShipperName}/${sh.DestinationPort.Country}`).then(response => {
        return response.json();
    }).then(result => {
        if(result!=""){
        let divShipper = document.getElementById('divShipper');
        let divDestination = document.getElementById('divDestination');
        let daeTextField = document.getElementById('daeTextField');
        daeTextField.readOnly = true;
        let expDate = document.getElementById('expDate');
        expDate.readOnly= true;
      

        divShipper.innerHTML = `${sh.ShipperName}`;
        divDestination.innerHTML = `${sh.DestinationPort.Country}`;
        daeTextField.value = result.dae;
        expDate.value = result.expDate;
       
        $('#btSave').text('Update');
        }
    else
    {
        let divShipper = document.getElementById('divShipper');
        divShipper.innerHTML = `${sh.ShipperName}`;
        let Destination = document.getElementById('divDestination');
        Destination.innerHTML = `${sh.DestinationPort.Country}`;
        $('input[id="expDate"]').prop('readonly', false);
        var date_input=$('input[id="expDate"]'); //our date input has the name "date"
        var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
        var options={
          format: 'mm/dd/yyyy',
          container: container,
          todayHighlight: true,
          autoclose: true,
        };
        date_input.datepicker(options);
         
    }
       
    }).catch(error => {
        //removeLoading();
        let divShipper = document.getElementById('divShipper');
        divShipper.innerHTML = `${sh.ShipperName}`;
        let Destination = document.getElementById('divDestination');
        Destination.innerHTML = `${sh.DestinationPort.Country}`;
        curExp = '02/02/02';
        $('#Expdate').val('02/02/02');
        console.log(error);
    }); 
    
    
    
 
    
}

function displayErrorMessage(message) {
    let dataSection = document.getElementById('info-container');
    let element = createDiv();
    element.innerHTML = `Error: ${message}`;
    dataSection.appendChild(element);
}

function submitValues(e) {
    e.preventDefault();

    let cfValue = cfInput.value;
    if (!cfValue) {
        cfInput.focus();
        return;
    }

    saveButton.disabled = true;
    fetch(`transactionManager/customfields/${guid}`, {
        method: 'POST',
        body: JSON.stringify({
            customField : cfValue
        }),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json();
    }).then(saveResult => {
        saveButton.disabled = false;
        if (!saveResult.success) {
            displayErrorMessage(saveResult.error);
            return;
        }
    
        alert('DAE saved successfully!');
        cfInput.value = '';
        cfInput.focus();
    })
    .catch(result => {
        saveButton.disabled = false;
        console.log(result);
    });
}

function loadShipmentData() {
    //addLoading('shipInfo');
    
    fetch(`transactionManager/${guid}`).then(response => {
        return response.json();
    }).then(result => {
        //removeLoading();
        displayShipmentData(result);
    }).catch(error => {
        //removeLoading();
        console.log(error);
    });
}

const guid = getUrlParameter('sh');
loadShipmentData();


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};