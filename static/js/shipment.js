
let saveButton = document.getElementById('btgetDae');

let curDae = "";
let curExp = "";
$(document).ready(function(){

    $('input[id="Expdate"]').prop('readonly', true);
      
  })

  $('#btUpdate').on('click', function(event) {
   enableUpdate();
   
  });
  $('#btgetDae').on('click', function(event) {
   //Need to save this into a JSON file if the update it's enabled.
   //after pull the DAE into the CF
   subMitValueMagaya();
   });
   $('#btCancel').on('click', function(event) {
    $('input[id="Expdate"]').prop('readonly', true);
    $('input[id="Expdate"]').datepicker('remove');
    $('input[id="daeTextField"]').prop('readonly', true);
    $('#btUpdate').attr("disabled", false);
    $('#btCancel').addClass("invisible");
    $('#btgetDae').text("Get this DAE");
    $('#daeTextField').val(curDae);
    $('#Expdate').val(curExp);
   });

  function enableUpdate()
  {
    $('input[id="Expdate"]').prop('readonly', false);
    var date_input=$('input[id="Expdate"]'); //our date input has the name "date"
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
    let cfInput = document.getElementById('daeTextField');
    fetch(`transactionManager/${guid}/customfields`, {
        method: 'POST',
        body: JSON.stringify({
            customField : cfInput.value
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
    
    divShipper.innerHTML = `${sh.ShipperName}`;
    curDae = "DAE";
    let x = document.getElementById('daeTextField');
    x.setAttribute("type", "text");
    x.setAttribute("value", "DAE");
    x.readOnly  = true;
    
    let Destination = document.getElementById('divDestination');
    Destination.innerHTML = `${sh.DestinationPort.Name}`;
    curExp = '02/02/02';
     $('#Expdate').val('02/02/02');
 
    
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