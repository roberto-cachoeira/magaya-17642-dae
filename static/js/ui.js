function isA(value, p1, p2) {
    if (value == undefined)
        return false;
    if (/[^a-zA-Z]/.test(value)) {
        return false;
    }
    if (p1 && p2) {
        return value.length >= p1 && value.length <= p2;
    } else if (p1) {
        return value.length == p1;
    }
    return true;
}

function isAN(value, p1, p2) {
    // return false;
    if (value == undefined)
        return false;
    if (/[^a-zA-Z0-9 @\.]/.test(value)) {
        return false;
    }
    if (p1 && p2) {
        return value.length >= p1 && value.length <= p2;
    } else if (p1) {
        return value.length == p1;
    }
}

function isN(value, p1, p2) {
    // return false;
    if (value == undefined)
        return false;

    let value2 = String(value);
    if (/[^0-9]/.test(value2)) {
        return false;
    }
    if (p1 && p2) {
        return value2.length >= p1 && value2.length <= p2;
    } else if (p1) {
        // console.log('mmmm');
        return value2.length == p1;
    }
}

var empty = "*";

//const i18 = {} // require('../core/InternationalizationService.js');
//const dict = require('../core/InternationalizationService.js');;



var EHBLBusinessController = {


    FillleftListHouses: function (ShipmentJSon) {

        ShipmentJSon.houseBills.forEach((house, i) => {
            house.SelectedToSend = true;

            $(`<div selectableoption id="house${i}" class="row" aguid="${house.GUID}" > 
                <div  class="container-fluid"  style="padding-top: 10px; padding-bottom: 10px;" >    
                
                    <div class="row">
                        <div class="col-sm-2 center-block" ><img  src="../img/icons/svg/warning.svg"  width="32" height="20" />
                        </div>
                        <div class="col-sm-10" >
                            <div class="container-fluid" >
                                <div class="row" >
                                    <div class="col-sm-12" style="padding-left: 0px;" >${house.Name}</div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-6"  style="padding-left: 0px;"  >${house.commercialpartys[0].name ? house.commercialpartys[0].name : "Shiper Name Unknown"}</div>
                                    <div class="col-sm-5"  style="padding-left: 0px;"  >${house.commercialpartys[1].name ? house.commercialpartys[1].name : "Consignee Name Unknown"}</div>
                                    <div class="col-sm-1"  style="padding-left: 0px;"  ><input type="checkbox"  id="houseSend${i}" aguid="${house.GUID}"  checked ></div>
                                </div>
                            </div>
                        </div>                        
                    </div>



                </div>
            </div>`).prependTo('#divhouses');

            $(`#houseSend${i}`).change(() => {
                ShipmentJSon.houseBills[i].SelectedToSend = $(`#houseSend${i}`).prop('checked');

                let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSon);
                $("#btnSend").prop('disabled', !(allValid && config.configured));
                //if (this.CurrenthouseJSON)
                //    this.ValidateHouse(this.CurrenthouseJSON, true);

            });

            $("#house" + i).click((event) => {
                displayHouse(i);
            });
        });

        $("#selectallHouses").change(() => {
            let _all = $("#selectallHouses").prop('checked');
            let alist = null;
            if (_all) {
                alist = $(`#divhouses input[type="checkbox"]:not(:checked)`);
            } else {
                alist = $(`#divhouses input[type="checkbox"]:checked`);
            }
            alist.each((index, value) => {
                $(value).click();
            });
        });

        if (ShipmentJSon.houseBills.length > 0) {
            $("#house" + (ShipmentJSon.houseBills.length - 1)).click();
        }

    },
    FillMasterDetails: function (ShipmentJSON, WSData) {
        let houseJSON;
        if (ShipmentJSON.houseBills.length > 0) {

            let AllOriginals = ShipmentJSON.houseBills.filter((hb) => {
                return !hb.IsOriginal;
            }).length == 0;

            if (AllOriginals) {
                // select the original and disable  both components
                $("#messageFunctionCodeGeneralvalue").val("9");
                $("#messageFunctionCodeGeneralvalue").prop('disabled', true);
                $("#amendmentCodeGeneralvalue").prop('disabled', true);
            } else {
                // removing Option ORIGINAL
                $("#messageFunctionCode9Generalvalue").remove();
            }

            houseJSON = ShipmentJSON.houseBills[0];
            $('#primaryCCNvalue').html(houseJSON.primaryCCN);
            $('#previousCCNvalue').html(houseJSON.previousCCN);

            // $('#hblCCNvalue').html(houseJSON.hblCCN);
            // $('#uniqueReferenceNovalue').html(houseJSON.uniqueReferenceNo);
            // $('#messageFunctionCodevalue').html(   (houseJSON.messageFunctionCode == 1)?"Cancellation":  ((houseJSON.messageFunctionCode==4)?"Change":(houseJSON.messageFunctionCode==9)?"Original":  ((houseJSON.messageFunctionCode==52)?"Proposed amendment":null)));
            //let vals = {'20':'Amendment to description of goods','25':'Amendment to consignee (name and/or address)','30':'In bond port/sub-location code amendments**', '35':'Clerical error when keying data','60':'Amendment not elsewhere specified','65':' Overage: any change in the number of pieces in a shipment that is higher than the quantity reported at FPOA. Note the initial quantity being amended must be greater than zero.','70':' Shortage: any change in the number of pieces in a shipment that is lower than the quantity reported at FPOA. Note the quantity cannot be reduced to zero, which would then be a cancellation, not amendment.','75':' Goods that have been imported but not released, that have been pilfered, stolen, lost or destroyed while in custody of the carrier','80':'Change request delayed by client systems outage','85':' Change request delayed by CBSA systems outage'};
            //$('#amendmentCodevalue').html(vals[houseJSON.amendmentCode]);

            $('#modeIndicatorvalue').html((houseJSON.modeIndicator == 1) ? "Maritime Transport" : ((houseJSON.modeIndicator == 3) ? "Road Transport" : ((houseJSON.modeIndicator == 3) ? "Air Transport" : "NONE")));
            $('#portOfDestinationvalue').html(houseJSON.portOfDestination);
            //$('#destinationSublocationCodevalue').html(houseJSON.destinationSublocationCode); //  TODO ASSIGN CODE

            // if (WSData && WSData.SublocationCodeTable) {
            //   this.aShipmentDAO.SetSublocationCodeTable(WSData.SublocationCodeTable);

            let portCode = houseJSON.portOfDestination;
            //houseJSON.destinationSublocationCode = "2086"
            sublocations.forEach(function (sublocation, index) {
                //let pcode = sublocation.Code;
                //if (pcode == portCode) {

                $("#destinationSublocationCodevalue").append(`<option ${(houseJSON.destinationSublocationCode == sublocation.Index) ? "selected" : ""}  value="${sublocation.Index}" >${sublocation.Name}</option>`);
                //}
            });

            /*  idselect = `messageFunctionCode${houseJSON.messageFunctionCode}value`;
              // alert(idselect);
              if (idselect && $(`#${idselect}`)) {
                  $(`#${idselect}`).attr('selected', 'selected');
              }*/
            //}
            let idselect = (houseJSON.movementType == "24") ? "importoption" : ((houseJSON.movementType == "27") ? "inbondoption" : null);
            if (idselect && $(`#${idselect}`)) {
                $(`#${idselect}`).attr('selected', 'selected');
            }
        }

        // binding
        this.executeOnChange((newvalue) => {
            ShipmentJSon.houseBills.forEach((ahouseJSON, i) => {
                ahouseJSON.destinationSublocationCode = newvalue;
            });

            let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
            $("#btnSend").prop('disabled', !(allValid && config.configured));
            if (this.CurrenthouseJSON)
                this.ValidateHouse(this.CurrenthouseJSON, true);

        }, '#destinationSublocationCodevalue');
        this.executeOnChange((newvalue) => {
            ShipmentJSon.houseBills.forEach((ahouseJSON, i) => {
                ahouseJSON.movementType = newvalue;
            });
            let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
            $("#btnSend").prop('disabled', !(allValid && config.configured));
            if (this.CurrenthouseJSON)
                this.ValidateHouse(this.CurrenthouseJSON, true);

        }, '#movementTypevalue');
        this.executeOnChange((newvalue) => {
            ShipmentJSon.houseBills.forEach((ahouseJSON, i) => {
                if (!ahouseJSON.IsOriginal)
                    ahouseJSON.messageFunctionCode = newvalue;
            });
            if (!this.CurrenthouseJSON.IsOriginal && newvalue != "" && $(`#messageFunctionCodevalue`)) {
                $(`#messageFunctionCodevalue`).val(newvalue);
            }
            $(`#messageFunctionCodevalue`).trigger("change");

        }, `#messageFunctionCodeGeneralvalue`);

        this.executeOnChange((newvalue) => {
            ShipmentJSon.houseBills.forEach((ahouseJSON, i) => {
                if (!ahouseJSON.IsOriginal) {
                    ahouseJSON.amendmentCode = newvalue;

                }

            });
            if (!this.CurrenthouseJSON.IsOriginal && newvalue != "" && $(`#amendmentCodevalue`)) {
                $(`#amendmentCodevalue`).val(newvalue);
            }
            $(`#amendmentCodevalue`).trigger("change");
            // $(`#amendmentCode${newvalue}value`).attr('selected', 'selected'); 
            //  $( `#amendmentCodevalue` ).trigger( "change" );

        }, `#amendmentCodeGeneralvalue`);

        // translate labels
        this.DoTranslation();
    },
    ValidateCloseShipment(ShipmentCloseJSon, updatecontrols) {

        $('[helpicon]').each((index, value) => {
            $(value).remove();
        });

        $(".error-highlight").each(function (index, value) {
            $(value).removeClass('error-highlight');
        });


        let valid = true;
        let v = true;
        valid &= v = (ShipmentCloseJSon && ShipmentCloseJSon.closeMsgSubmission.closeMessages && ShipmentCloseJSon.closeMsgSubmission.closeMessages.length > 0);
        if (v) {
            let uniqueclosemessage = ShipmentCloseJSon.closeMsgSubmission.closeMessages[0];
            valid &= v = (isAN(ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].primaryCCN, 1, 25));

            valid &= v = (isAN(uniqueclosemessage.primaryCCN, 1, 25));
            if (!v && updatecontrols) {
                this.MarkUnValid('primaryCCN');
            }
            // previousCCN
            valid &= v = (isAN(uniqueclosemessage.previousCCN, 1, 25));
            if (!v && updatecontrols) {
                this.MarkUnValid('previousCCN');
            }

            // cbsaCarrierCode
            valid &= v = (isAN(uniqueclosemessage.cbsaCarrierCode, 4));
            if (!v && updatecontrols) {

                this.MarkUnValid('cbsaCarrierName');
            }


            valid &= v = ["1", "4", "9", "52"].includes(uniqueclosemessage.messageFunctionCode);
            if (!v && updatecontrols) {
                this.MarkUnValid('messageFunctionCode'); //$('#messageFunctionCodevalue').addClass('displayed error-highlight');
            }
            // amendmentCode
            valid &= v = ['20', '30', '35', '60', '65', '70', '75', '80', '85', '90', '95'].includes(uniqueclosemessage.amendmentReasonCode) ||
                (ShipmentCloseJSon.IsOriginal);
            if (!v && updatecontrols) {
                this.MarkUnValid('amendmentReasonCode'); //$('#amendmentCodevalue').addClass('displayed error-highlight');
            }

            uniqueclosemessage.ccnLoop.relatedCCNs.forEach((cnn, index) => {
                valid &= v = (isAN(cnn.relatedCCN, 1, 25));
                let id = `ehbl${index}CCN`;
                if (!v && updatecontrols) {
                    this.MarkUnValid(`ehbl${index}CCN`, 'ccntext');
                }
            });
        }

        valid &= $(`input[type="checkbox"]:enabled:checked`).length > 0;

        // valid = $(`:enabled:checked`);

        $("#btnSend").prop('disabled', updatecontrols && !(valid && config.configured));
        return valid;

    }

    ,
    FillCloseShipment(ShipmentCloseJSon) {
        //$('#content').html(JSON.stringify(ShipmentCloseJSon)); 
        $("#divmasterwaybill").html(ShipmentCloseJSon.closeMsgSubmission.WayBill);
        $('#primaryCCNvalue').html(ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].primaryCCN);
        $('#previousCCNvalue').html(ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].previousCCN);
        $('#cbsaCarrierNamevalue').html(ShipmentCloseJSon.CarrierName);
        $('#divFrom').html(ShipmentCloseJSon.From);
        $('#divTo').html(ShipmentCloseJSon.To);

        $('#uniqueReferenceNovalue').html(ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].uniqueReferenceNo);

        if (['35', '60', '80', '85', '90', '95'].includes(String(ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].messageFunctionCode))) {
            $('#messageFunctionCode' + ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].messageFunctionCode + 'value').attr("selected", "selected");
        }

        let AllClosables = true;
        ShipmentCloseJSon.closeMsgSubmission.closeMessages[0].ccnLoop.relatedCCNs.forEach((relatedCCN, index) => {
            let aclass = relatedCCN.isClosable ? "" : "NonClosable";
            AllClosables &= relatedCCN.isClosable;
            $('#tbrelatedparties tbody').append(` <tr  class="${aclass}" >
                <td ><span><input   id="housecloseSend${index}" type="checkbox" ${relatedCCN.isClosable ? "checked" : ""}  ${relatedCCN.isClosable ? "" : "disabled"} ><span style="margin-left:20px;" >${relatedCCN.waybill}</span></span></td>
                <td ><span id="ehbl${index}CCNvalue" translate="ccntext" >${relatedCCN.relatedCCN}</span></td>
                <td ><span>${relatedCCN.Shipper}</span></td>
                <td ><span>${relatedCCN.Consignee}</span></td>
            </tr>`);

            $(`#housecloseSend${index}`).change(() => {

                relatedCCN.SelectedToSend = $(`#housecloseSend${index}`).prop('checked');
                this.ValidateCloseShipment(ShipmentCloseJSon, true);

            });
        });

        $("#allcloseCheckbox").change(() => {
            let _all = $("#allcloseCheckbox").prop('checked');
            let alist = null;
            if (_all) {
                alist = $(`#DivClosesTBody input[type="checkbox"]:not(:checked):enabled`);
            } else {
                alist = $(`#DivClosesTBody input[type="checkbox"]:checked:enabled`);
            }
            alist.each((index, value) => {
                $(value).click();
            });

        });

        if (!AllClosables) {
            $('#statusDiv').html("The Hightlighted House Shipments Close Messages will not be send ... ");
        }


        this.executeOnChange((newvalue) => {

            let uniqueclosemessage = (ShipmentCloseJSon && ShipmentCloseJSon.closeMsgSubmission && ShipmentCloseJSon.closeMsgSubmission.closeMessages[0]) ? ShipmentCloseJSon.closeMsgSubmission.closeMessages[0] : null;
            if (uniqueclosemessage) {

                uniqueclosemessage.amendmentReasonCode = newvalue;
                this.ValidateCloseShipment(ShipmentCloseJSon, true);
            }
        }, `#amendmentReasonCodevalue`);

        // messageFunctionCodetext
        this.executeOnChange((newvalue) => {
            let uniqueclosemessage = (ShipmentCloseJSon && ShipmentCloseJSon.closeMsgSubmission && ShipmentCloseJSon.closeMsgSubmission.closeMessages[0]) ? ShipmentCloseJSon.closeMsgSubmission.closeMessages[0] : null;
            if (uniqueclosemessage) {

                uniqueclosemessage.messageFunctionCode = newvalue;
                this.ValidateCloseShipment(ShipmentCloseJSon, true);
            }
        }, `#messageFunctionCodevalue`);

        // }



    }

    ,
    DisplayHelp: function (aid) {

        //let apath = path.resolve(`${__dirname}/../pages/help/${aid}.html`);
        let aheader = aid;


        if (dict['help_' + aid] && dict['help_' + aid] != "") {
            aheader = dict['help_' + aid];
        } else if (dict[aid + 'text'] && dict[aid + 'text'] != "") {
            aheader = dict[aid + 'text'];
        }

        $.get(`${EHBLBusinessController.base_url()}/front/help/${aid}`, null, function (data) {
            if (!($('#amessage_help')).length) {
                $(`<div class="modal"  id="amessage_help" role="dialog">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="amessage_help_header" >${aheader}</h4>
                    </div>
                    <div class="modal-body" id="amessage_help_body">
                      <p>${data + ''}</p>
                    </div>               
                  </div>
                </div>
              </div>`).appendTo("#hidden_div").modal();
                $('.modal').find('button').first().focus();
            } else {
                $('#amessage_help_header').html(aheader);
                $('#amessage_help_body').html(data + '');
                $('#amessage_help').modal();
                $('.modal').find('button').first().focus();
            }
        });


    },
    executeOnChange: function (call, idSelect) {
        $(`${idSelect}`).change(() => {
            call($(`${idSelect}`).val());
        });
    },
    DoTranslation: function () {
        $('[translate!=""]').each(function (index, value) {
            let translateid = $(this).attr('translate');
            if (translateid) {
                console.log(translateid);
                console.log(dict[translateid]);
                $(value).html(dict[translateid]);
            }
        });
    },
    DisplayHSSearchFor: function (index) {

        $("#divutil").html(`

                        <!-- Modal -->
                        <div class="modal fade" id="myModalDiv" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title" id="myModalLabel8">Harmonized Schedule Code</h4>
                            </div>
                            <div class="modal-body">
                            <div  style="">
                                
                                    <div class="input-group">                
                                        <input class="form-control field-copy" id="CFilter" placeholder="Search by code or description" type="text">
                                        <span  class="input-group-btn">
                                            <button id="btnFilter" class="btn btn-default" type="button">Search</button>
                                        </span>
                                    </div>
                                    
                                </div>
                                <div  style="margin-top: 10px;">
                                <select id="HsCodeFiltered"  name="HsCodeFiltered" size="15" style="width: 100%; overflow-x:auto;" class="form-control field-copy std-ctrol">                
                                    </select>
                                </div>
                                <div id="divdetails" class= "row" style="padding-left: 15px;" ></div>
                            </div>
                            
                            <div class="modal-footer">
                            <!-- <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> -->
                                <button id="BtnSelect" class="btn btn-primary">Select</button>
                            </div>
                            </div>
                        </div>
                        </div>`);

        this.executeOnChange((newvalue) => {
            let acode = $("#HsCodeFiltered").val();
            let text = $(`#${$("#HsCodeFiltered").val()}hscodeoption`).html();
            text = text.substr(acode.length + 3);
            $("#divdetails").html(`Code: ${acode}<br/>Description: ${text}`);
        }, "#HsCodeFiltered");


        let handleaction = () => {
            let pattern = $("#CFilter").val();
            let quantity = 20;

            alert(this.base_url());
            alert(window.document.location.origin);

            if (pattern.length > 2) {
                $.get(`${this.base_url()}/front/hscode-search/${pattern}-${quantity}`, null, function (ajson) {
                    ajson.forEach((ahsrecord, index) => {
                        $("#HsCodeFiltered").append(`<option id="${ahsrecord.Code}hscodeoption" value="${ahsrecord.Code}">${ahsrecord.Code} - ${ahsrecord.Description}</option>`);
                    });
                }, 'json');
            }

        };

        $("#btnFilter").click(handleaction);

        $("#CFilter").keypress(function (e) {
            if (e.which == 13) {
                // enter pressed
                handleaction();
            }
        });

        $("#BtnSelect").click(() => {
            // <option value="microsoft">http://www.microsoft.com</option>

            $('#HsCodeFiltered option:selected').each((i, tag) => {

                let value = $(tag).attr('value');
                $(`#hsCode${index}value`).html(value);
                $("#myModalDiv").modal('hide');
                $(`#hsCode${index}value`).trigger("change");
            });
        });



        /*   $('#myModalDiv').on('hidden.bs.modal', function (e) {
           // do something...
               
                 $(`hsCode${index}value`).remove();
           });*/
        $("#myModalDiv").modal();

    },
    base_url() {
        return window.document.location.origin + config.program.root;
    },
    FillHouse: function (houseJSON, ShipmentJSON) {

        this.CurrenthouseJSON = houseJSON;

        // $('#divhouseheader').css("display","block");

        if (houseJSON.IsOriginal) {
            // select the original and disable  both components
            $("#messageFunctionCodevalue").val("9");
            $("#messageFunctionCodevalue").prop('disabled', true);
            $("#amendmentCodevalue").prop('disabled', true);
        } else {
            // removing Option ORIGINAL
            $("#messageFunctionCode9value").remove();
        }



        $('#divhouseName').html(houseJSON.Name);

        $('#hblCCNvalue').html(houseJSON.hblCCN ? houseJSON.hblCCN : empty);
        $('#uniqueReferenceNovalue').html(houseJSON.uniqueReferenceNo ? houseJSON.uniqueReferenceNo : empty);

        $('#consolidationIndicatorvalue').html(houseJSON.consolidationIndicator ? houseJSON.consolidationIndicator : empty); // == "N" ? "No" : "Yes");
        $('#handlingInstructionsvalue').html(houseJSON.handlingInstructions ? houseJSON.handlingInstructions : empty);
        $('#totalweightUOMvalue').html('KGM'); //(houseJSON.totalweightUOM);
        $('#totalWeightvalue').html(houseJSON.totalWeight ? houseJSON.totalWeight : empty);

        $('#isDangerousGoodsvalue').html(houseJSON.isDangerousGoods == "N" ? "No" : "Yes");

        if (houseJSON.isDangerousGoods == "N") {
            $('#panelDangerous').hide();
        }

        $('#specialInstructionsvalue').html(houseJSON.specialInstructions ? houseJSON.specialInstructions : empty);
        $('#undgContactNamevalue').html(houseJSON.undgContactName ? houseJSON.undgContactName : empty);
        $('#emailvalue').html(houseJSON.email ? houseJSON.email : empty);
        $('#mobileNovalue').html(houseJSON.mobileNo ? houseJSON.mobileNo : empty);
        $('#volumeUOMvalue').html(houseJSON.volumeUOM ? houseJSON.volumeUOM : empty);
        $('#volumevalue').html(houseJSON.volume ? houseJSON.volume : empty);

        if (houseJSON.amendmentCode && houseJSON.amendmentCode != "")
            $(`#amendmentCodevalue`).val(houseJSON.amendmentCode);
        if (houseJSON.messageFunctionCode && houseJSON.messageFunctionCode != "")
            $(`#messageFunctionCodevalue`).val(houseJSON.messageFunctionCode);

        // to scroll the panel
        $("#parties").append('<div class="row">');

        houseJSON.commercialpartys.forEach((commercialparty, index) => {
            let PartyName;

            switch (commercialparty.partyTypeCode) {
                case 'CZ':
                    {
                        PartyName = "Shipper";
                        break;
                    }
                case 'CN':
                    {
                        PartyName = "Consignee";
                        break;
                    }
                case 'DP':
                    {
                        PartyName = "Delivery Address";
                        break;
                    }
                case 'NI':
                    {
                        PartyName = "Notify Party";
                        break;
                    }
                case 'CS':
                    {
                        PartyName = "Consolidator";
                        break;
                    }
                case 'ZZZ':
                    {
                        PartyName = "Place of Consolidation";
                        break;
                    }

            }


            $("#parties").append(
                '<div class="col-sm-6" style="background:#eeeeee; border: 1px solid #eeeeee; width:47%; margin: 5px;">' +

                '<div class="row">' +
                '<div    class="col-sm-3"><div  id="' + commercialparty.partyTypeCode + 'CommercialPartyType">' + PartyName + '</div><br/>  </div><div class="col-sm-9" style="background:#fff;"  ><div><span translate="nametext" >name:</span><span id="' + commercialparty.partyTypeCode + 'name">' + commercialparty.name + '</span></div>' +
                '<button type="button" class="btn btn-info circle1" style="float: right;margin-top: -12px; margin-right:-7px;" data-toggle="collapse" data-target="#aparty' + index + '" >-</button>' +
                '</div>' +
                '</div>' +
                '<div class="row collapse in" id="aparty' + index + '">' +
                '<div  class="col-sm-3" ></div>' +
                '<div partytype="' + commercialparty.partyTypeCode + '" class="col-sm-9"  style="background:#fff;"  >' + '<div><span translate="partyTypeCodetext" id="partyTypeCodetext" >partyTypeCode:</span><span id="' + commercialparty.partyTypeCode + 'partyTypeCode">' + commercialparty.partyTypeCode + '</span></div>' +

                '<div><span class="field-label"   id="' + commercialparty.partyTypeCode + 'addresstext" translate="addresstext">address:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'addressvalue">' + (commercialparty.address ? commercialparty.address : empty) + '</div></div>' +
                '<div><span class="field-label"   id="' + commercialparty.partyTypeCode + 'citytext" translate="citytext">city:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'cityvalue">' + (commercialparty.city ? commercialparty.city : empty) + '</div></div>' +
                '<div><span class="field-label"   id="' + commercialparty.partyTypeCode + 'statetext" translate="statetext">state:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'statevalue">' + (commercialparty.state ? commercialparty.state : empty) + '</div></div>' +
                '<div><span class="field-label"   id="' + commercialparty.partyTypeCode + 'countrytext" translate="countrytext">country:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'countryvalue">' + (commercialparty.country ? commercialparty.country : empty) + '</div></div>' +
                '<div><span class="field-label"   id="' + commercialparty.partyTypeCode + 'postalCodetext" translate="postalCodetext">postalCode:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'postalCodevalue">' + (commercialparty.postalCode ? commercialparty.postalCode : empty) + '</div></div>' +
                '<div><span class="field-label"  id="' + commercialparty.partyTypeCode + 'contactNametext" translate="contactNametext">contactName:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'contactNamevalue">' + (commercialparty.contactName ? commercialparty.contactName : empty) + '</div></div>' +
                '<div><span class="field-label"  id="' + commercialparty.partyTypeCode + 'telephoneNumbertext" translate="telephoneNumbertext">telephoneNumber:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'telephoneNumbervalue">' + (commercialparty.telephoneNumber ? commercialparty.telephoneNumber : empty) + '</div></div>' +
                '</div>' +

                '</div>' +
                '</div>');

            // '<div><span class="field-label" translate="locationPortCodetext" >locationPortCode:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'locationPortCodevalue">' + (commercialparty.locationPortCode ? commercialparty.locationPortCode : empty) + '</div></div>' +

            // '<div><span class="field-label"  translate="POBoxnumbertext">POBoxnumber:</span><br/><span  class="field-copy"  id="' + commercialparty.partyTypeCode + 'POBoxnumbervalue">' + (commercialparty.POBoxnumber ? commercialparty.POBoxnumber : empty) + '</span></div>' +
            // '<div><span class="field-label" id="' + commercialparty.partyTypeCode + 'divisiontext" translate="divisiontext" >division:</span><br/><div  class="field-copy"  id="' + commercialparty.partyTypeCode + 'divisionvalue">' + (commercialparty.division ? commercialparty.division : empty) + '</div></div>' +

        });

        $("#parties").append('</div>');

        houseJSON.products.forEach((product, index) => {
            $("#products tbody").append(`<tr  >
                <td>
                    <span  class="field-copy"  id="cargoQuantity${index}">${product.cargoQuantity}</span>
                    <span  class="field-copy"  id="cargoUOM${index}">${product.cargoUOM}</span>
                </td>
                <td>
                <span  class="field-copy"  id="cargoDesc${index}value">${product.cargoDesc ? product.cargoDesc : empty}</span>
                </td>
                <td>
                    <span class="field-copy"  id="marksAndNumbers${index}value">${product.marksAndNumbers ? product.marksAndNumbers : empty}</span>
                </td>
                <td>
                    <span class="field-copy"  id="undgCode${index}value">${product.undgCode ? product.undgCode : empty}</span>
                </td>
                <td>

                    <div class="input-group">                
                       <span disabled class="field-copy"  id="hsCode${index}value" type="text"  dofilter  placeholder="Search"   ></span>
                        <span  class="input-group-btn">
                            <button  id="hsCode${index}Search" class="btn btn-default" type="button">
                                <span class="glyphicon glyphicon-search" aria-hidden="true" style="color: #95989a" ></span>
                            </button>
                        </span>
                    </div>

                </td>`);



            this.executeOnChange((newvalue) => {
                if (WSData && WSData.HSCodeConvertionTable) {

                    /*       let val = WSData.HSCodeConvertionTable.find((element)=>{
                              // alert(JSON.stringify(element));
                               return element.Code && element.Code == newvalue;   //element.Description && element.Description == newvalue;
                           });*/
                    let val = newvalue;

                    if (val) {

                        product.hsCode = val;

                        let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
                        $("#btnSend").prop('disabled', !(allValid && config.configured));
                        this.ValidateHouse(houseJSON, true);
                    }
                }


                //product.hsCode = newvalue;


            }, `#hsCode${index}value`);
            // '<td><span id="hsCode' + product.PartNumber + '">' + product.hsCode + '</span> <span translate="hsCodeerror"  id="hsCode' + product.PartNumber + 'error" error-message >ERROR</span></td>
            // <td><span id="cargoUOM${product.PartNumber}">${product.cargoUOM}</span><span translate="cargoUOMerror" id="cargoUOM${product.PartNumber}error" error-message >ERROR</span></td>


            $(`#hsCode${index}Search`).click(() => {
                this.DisplayHSSearchFor(index);
            });

        });

        houseJSON.equipments.forEach((equipment) => {
            $("#equipments tbody").append(
                '<tr>' +
                '<td><span id="equipmentNumber' + equipment.equipmentNumber + 'text" class="field-label">Equipment Number:</span><br/><span class="field-copy"  id="equipmentNumber' + equipment.equipmentNumber + 'value">' + (equipment.equipmentNumber ? equipment.equipmentNumber : empty) + '</span></td>' +
                '<td><span id="sealInfo1' + equipment.equipmentNumber + 'text" class="field-label">Seal Info1:</span><br/><span class="field-copy"  id="sealInfo1' + equipment.equipmentNumber + 'value">' + (equipment.sealInfo.sealNumbers[0] ? equipment.sealInfo.sealNumbers[0] : empty) + '</span></td>' +
                '<td><span id="sealInfo2' + equipment.equipmentNumber + 'text" class="field-label">Seal Info2:</span><br/><span class="field-copy"  id="sealInfo2' + equipment.equipmentNumber + 'value">' + (equipment.sealInfo.sealNumbers[1] ? equipment.sealInfo.sealNumbers[1] : empty) + '</span></td>' +
                '</tr>');
        });

        houseJSON.SNPPartys.forEach((SNPParty, i) => {
            SNPParty = SNPParty || {};
            $("#parties").append(`<div class="col-sm-6" style="background:#eeeeee; border: 1px solid #eeeeee; width:47%; margin: 5px;">
                <div class="row">
                <div  class="col-sm-3"><div  id="SNP${i}Head" style="float:left; max-width:30px;"  >SNP</div></div><div class="col-sm-9" style="background:#fff;"  >
                <div>
                    <span id="SNP${i}" >Carrier - </span>
                    <span  class="field-copy"  id="SNP${i}namevalue">${SNPParty.name || empty}</span>
                    <span  class="field-copy"  id="SNP${i}cbsaIdentifiervalue">${SNPParty.cbsaIdentifier || empty}</span>
                </div>
                </div>`);
        });

        this.executeOnChange((newvalue) => {
            houseJSON.amendmentCode = newvalue;


            let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
            $("#btnSend").prop('disabled', !(allValid && config.configured));
            this.ValidateHouse(houseJSON, true);
        }, `#amendmentCodevalue`);

        this.executeOnChange((newvalue) => {
            houseJSON.messageFunctionCode = newvalue;

            let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
            $("#btnSend").prop('disabled', !(allValid && config.configured));
            this.ValidateHouse(houseJSON, true);
        }, `#messageFunctionCodevalue`);

        // translate
        this.DoTranslation();


        let allValid = this.ValidateMasterDetailsAndAllHouses(ShipmentJSON);
        $("#btnSend").prop('disabled', !(allValid && config.configured));
        this.ValidateHouse(houseJSON, true);
        // this.DoTranslation();
    },
    ValidateMasterDetailsAndAllHouses: function (ShipmentJSON, updatecontrols) {
        let valid = this.ValidateMasterDetails(ShipmentJSON, true) && this.ValidateAllHouses(ShipmentJSON, updatecontrols);
        //$("#btnSend").prop('disabled', updatecontrols && !valid);
        //TODO
        return valid;
    },
    ValidateAllHouses: function (ShipmentJSON, updatecontrols) { // visually validate each house and update de images in the houses table and enable the submit button


        let valid = true;
        //alert(JSON.stringify(ShipmentJSON));
        let foundValidSelected = false;

        let Selecteds = ShipmentJSon.houseBills.filter(item => item.SelectedToSend);
        let ids = Selecteds.map((item) => {
            return item.GUID;
        });

        ShipmentJSon.houseBills.forEach((houseJSON, i) => {

            let validHouse = this.ValidateHouse(houseJSON, updatecontrols);

            if (validHouse) { //  rect(0px,32px,20px,16px)
                //change the image
                $('#house' + i + ' img').attr('src', '../img/icons/svg/check.svg');
            } else {
                $('#house' + i + ' img').attr('src', '../img/icons/svg/warning.svg');
            }

            if (ids.includes(houseJSON.GUID)) {
                valid = valid && validHouse;
                foundValidSelected |= validHouse;
            }

        });



        valid = valid && foundValidSelected;

        return valid;
        // $("#btnSend").prop('disabled', updatecontrols && !valid); //$('#btnSend').removeAttr('disabled');
    },
    MarkUnValid: function (aid, aidtext) {
            if ($(`#${aid}value`) && !$(`#${aid}value`).hasClass('error-highlight')) {
                $(`#${aid}value`).addClass('error-highlight');
            }

            if (aidtext && $(`#${aidtext}`)) {

                let next = $(`#${aidtext}`).next();

                if (!next || next.attr('helpicon') != "") {

                    $(`<div helpicon  ></div>`).insertAfter(`#${aidtext}`);
                }
            } else {

                if ($(`#${aid}text`)) {



                    let next = $(`#${aid}text`).next();

                    if (!next || next.attr('helpicon') != "") {

                        $(`<div helpicon  ></div>`).insertAfter(`#${aid}text`);
                    }
                } else {

                    let next = $(`#${aid}value`).next();

                    if (!next || next.attr('helpicon') != "") {

                        $(`<div helpicon  ></div>`).insertAfter(`#${aid}value`);
                    }
                }
            }

        }

        ,
    ValidateMasterDetails: function (shipment, updatecontrols) {

            // clear validation
            if (updatecontrols) {
                $("#divmasterdetails .error-highlight").each(function (index, value) {
                    $(value).removeClass('error-highlight');
                });
                $("#divmasterdetails [helpicon]").each(function (index, value) {
                    $(value).remove();
                });
            }

            let v = true;
            let valid = true;
            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && (isAN(shipment.houseBills[0].primaryCCN, 1, 21)));

            if (!v && updatecontrols) {
                //  $('#primaryCCNvalue').addClass('error-highlight');
                this.MarkUnValid('primaryCCN');
            }
            // previousCCN
            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && (isAN(shipment.houseBills[0].previousCCN, 1, 21)));
            if (!v && updatecontrols)
                this.MarkUnValid('previousCCN');

            //  modeIndicator
            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && (isN(shipment.houseBills[0].modeIndicator, 1, 3)));
            if (!v && updatecontrols) {
                //$('#modeIndicatorvalue').addClass('error-highlight');
                this.MarkUnValid('modeIndicator');
            }

            // portOfDestination
            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && isN(shipment.houseBills[0].portOfDestination, 4));
            if (!v && updatecontrols) {
                $('#portOfDestinationvalue').addClass('displayed error-highlight');
                this.MarkUnValid('portOfDestination');
            }

            // destinationSublocationCode
            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && isN(shipment.houseBills[0].destinationSublocationCode, 4)) &&
                shipment.houseBills[0].destinationSublocationCode == $('#destinationSublocationCodevalue').val();
            if (!v && updatecontrols) {
                //$('#destinationSublocationCodevalue').addClass('displayed error-highlight');
                this.MarkUnValid('destinationSublocationCode');
            }

            //  movementType

            valid &= v = (shipment && shipment.houseBills && shipment.houseBills.length > 0 && isN(shipment.houseBills[0].movementType, 1, 3)) &&
                shipment.houseBills[0].movementType == $('#movementTypevalue').val();
            if (!v && updatecontrols) {
                $('#movementTypevalue').addClass('displayed error-highlight');
                this.MarkUnValid('movementType');
            }

            /*     // messageFunctionCode
                 //alert(shipment.houseBills[0].messageFunctionCode);
                 valid &= v = $('#messageFunctionCodeGeneralvalue').val() != ""  ;
                // alert(v);
                 //(shipment && shipment.houseBills && shipment.houseBills.length > 0 && isN(shipment.houseBills[0].messageFunctionCode, 1, 3)) &&
                //     shipment.houseBills[0].messageFunctionCode == $('#messageFunctionCodeGeneralvalue').val();
                 if (!v && updatecontrols)
                     $('#messageFunctionCodeGeneralvalue').addClass('displayed error-highlight');*/




            // suscribe master details helps messages
            $('#divmasterdetails [helpicon]').each((index, tag) => {
                $(tag).click(() => {
                    let prevTag = $(tag).prev();
                    if (prevTag) {
                        let aid = prevTag.attr('translate');
                        if (aid && aid.length > 4) {
                            aid = aid.substr(0, aid.length - 4);

                            this.DisplayHelp(aid);
                        }
                    }

                });

            });

            return valid;
        }

        ,
    CleanHouseValidation: function () {
            // clear validation
            $("#divhouse .error-highlight").each(function (index, value) {
                $(value).removeClass('error-highlight');

            });
            $("#divhouse [helpicon]").each(function (index, value) {
                $(value).remove();
            });
        }

        ,
    AddNotificationPartyHelp: function (houseJSON) {

            ['CZ', 'CN', 'DP', 'NI', 'CS', 'ZZZ'].forEach((acode) => {

                $(`<div helpicon helpNP  id="${acode}CommercialPartyTypeHelp"  ></div>`).insertAfter(`#${acode}CommercialPartyType`);
                $(`#${acode}CommercialPartyTypeHelp`).click(() => {
                    this.DisplayHelp(`${acode}CommercialPartyTypeHelp`);
                });
            });

            houseJSON.SNPPartys.forEach((SNPParty, i) => {
                $(`<div helpicon helpNP  id="SNP${i}HeadHelp"  ></div>`).insertAfter(`#SNP${i}Head`);
                $(`#SNP${i}HeadHelp`).click(() => {
                    this.DisplayHelp(`SNP${i + 1}HeadHelp`);
                });

            });
        }

        ,
    ValidateHouseGeneralData: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;

            // hblCCN
            valid &= v = isAN(houseJSON.hblCCN, 1, 25);
            if (!v && updatecontrols)
                this.MarkUnValid('hblCCN'); //$('#hblCCNvalue').addClass('displayed error-highlight');
            // uniqueReferenceNo

            valid &= v = isAN(houseJSON.uniqueReferenceNo, 1, 25);
            if (!v && updatecontrols)
                this.MarkUnValid('uniqueReferenceNo'); //$('#uniqueReferenceNovalue').addClass('displayed error-highlight');
            // messageFunctionCode

            valid &= v = isAN(houseJSON.messageFunctionCode, 1, 3) && ["1", "4", "9", "52"].includes(houseJSON.messageFunctionCode) ||
                (houseJSON.messageFunctionCode == "9" && houseJSON.IsOriginal);
            if (!v && updatecontrols)
                this.MarkUnValid('messageFunctionCode'); //$('#messageFunctionCodevalue').addClass('displayed error-highlight');
            // amendmentCode

            valid &= v = isAN(houseJSON.amendmentCode, 1, 3) && ['20', '30', '35', '60', '65', '70', '75', '80', '85', '90', '95'].includes(houseJSON.amendmentCode) ||
                (houseJSON.messageFunctionCode == "9" && houseJSON.IsOriginal && !houseJSON.amendmentCode);
            if (!v && updatecontrols)
                this.MarkUnValid('amendmentCode'); //$('#amendmentCodevalue').addClass('displayed error-highlight');
            //  movementType
            valid &= v = isN(houseJSON.movementType, 1, 3);
            if (!v && updatecontrols)
                $('#movementTypevalue').addClass('displayed error-highlight');
            //  modeIndicator
            valid &= v = isN(houseJSON.modeIndicator, 1, 3);
            //if (!v && updatecontrols)
            // $('#modeIndicatorvalue').addClass('displayed error-highlight');
            //  portOfDestination
            valid &= v = isN(houseJSON.portOfDestination, 4);
            // if (!v && updatecontrols)
            //    $('#portOfDestinationvalue').addClass('displayed error-highlight');
            //  destinationSublocationCode
            valid &= v = isN(houseJSON.destinationSublocationCode, 4);
            //  if (!v && updatecontrols)
            //      $('#destinationSublocationCodevalue').addClass('displayed error-highlight');


            return valid;
        }

        ,
    ValidateHouseCargoHeader: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;

            //  Cargo Header
            // consolidationIndicator
            valid &= v = ['N', 'Y'].includes(houseJSON.consolidationIndicator); //isAN(houseJSON.consolidationIndicator,25);
            if (!v && updatecontrols)
                this.MarkUnValid('consolidationIndicator'); //$('#consolidationIndicatorvalue').addClass('displayed error-highlight');
            // handlingInstructions
            valid &= v = isAN(houseJSON.handlingInstructions, 1, 256);
            if (!v && updatecontrols)
                this.MarkUnValid('handlingInstructions'); //$('#handlingInstructionsvalue').addClass('displayed error-highlight');
            // totalweightUOM

            /*valid &= v = houseJSON.totalweightUOM == 'KGM'; // isAN(houseJSON.totalweightUOM,25);
            if (!v && updatecontrols)
                this.MarkUnValid('totalweightUOM'); //$('#totalweightUOMvalue').addClass('displayed error-highlight');*/
            // totalWeight
            valid &= v = (isN(houseJSON.totalWeight, 1, 13) && houseJSON.totalWeight > 0);
            if (!v && updatecontrols)
                this.MarkUnValid('totalWeight'); //$('#totalWeightvalue').addClass('displayed error-highlight');
            // b2bComments
            valid &= v = !(houseJSON.b2bComments) || houseJSON.b2bComments == '' || isAN(houseJSON.b2bComments, 1, 256);
            if (!v && updatecontrols)
                this.MarkUnValid('b2bComments'); //$('#b2bCommentsvalue').addClass('displayed error-highlight');
            // isDangerousGoods
            valid &= v = ['Y', 'N'].includes(houseJSON.isDangerousGoods); //isAN(houseJSON.isDangerousGoods,25);
            if (!v && updatecontrols) {
                this.MarkUnValid('isDangerousGoods'); //$('#isDangerousGoodsvalue').addClass('displayed error-highlight');
            }
            // specialInstructions
            valid &= v = (!(houseJSON.isDangerousGoods == 'Y') || isAN(houseJSON.specialInstructions, 1, 256));
            if (!v && updatecontrols)
                this.MarkUnValid('specialInstructions'); //$('#specialInstructionsvalue').addClass('displayed error-highlight');
            // undgContactName
            valid &= v = (!(houseJSON.isDangerousGoods == 'Y') || isAN(houseJSON.undgContactName, 1, 70));
            if (!v && updatecontrols)
                this.MarkUnValid('undgContactName'); //$('#undgContactNamevalue').addClass('displayed error-highlight');
            // email
            valid &= v = (!(houseJSON.isDangerousGoods == 'Y') || isAN(houseJSON.email, 1, 30));
            if (!v && updatecontrols)
                this.MarkUnValid('email'); //$('#emailvalue').addClass('displayed error-highlight');
            // mobileNo
            valid &= v = (!(houseJSON.isDangerousGoods == 'Y') || isAN(houseJSON.mobileNo, 1, 30));
            if (!v && updatecontrols)
                this.MarkUnValid('mobileNo'); //$('#mobileNovalue').addClass('displayed error-highlight');
            // volumeUOM
            /* valid &= v = houseJSON.volumeUOM == 'CMQ'; // isAN(houseJSON.volumeUOM,25);
             if (!v && updatecontrols)
                 this.MarkUnValid('volumeUOM'); //$('#volumeUOMvalue').addClass('displayed error-highlight');*/
            // volume
            valid &= v = isN(houseJSON.volume, 1, 13) && houseJSON.volume != 0;
            if (!v && updatecontrols)
                this.MarkUnValid('volume'); //$('#volumevalue').addClass('displayed error-highlight');


            return valid;
        }

        ,
    ValidateHouseComercialParties: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;
            // Comercial parties
            houseJSON.commercialpartys.forEach((commercialparty) => {
                // apartyTypeCode

                let apartyTypeCode = commercialparty.partyTypeCode;
                v &= ['CZ', 'CN', 'DP', 'NI', 'CS', 'ZZZ'].includes(commercialparty.partyTypeCode);
                //if (!v && updatecontrols)
                //    $('#' + apartyTypeCode + 'partyTypeCodevalue').addClass('displayed error-highlight');
                // name
                valid &= v = isAN(commercialparty.partyTypeCode, 1, 70);
                if (!v && updatecontrols)
                    $('#' + apartyTypeCode + 'partyTypeCodevalue').addClass('displayed error-highlight');
                // division
                /* valid &= v = isAN(commercialparty.division, 1, 70);
                 if (!v && updatecontrols)
                     this.MarkUnValid(apartyTypeCode + 'division'); //$('#' + apartyTypeCode + 'divisionvalue').addClass('displayed error-highlight');*/
                // locationPortCode
                // valid &= v = isAN(commercialparty.locationPortCode, 1, 20);
                //if (!v && updatecontrols)
                //     $('#' + apartyTypeCode + 'locationPortCodevalue').addClass('displayed error-highlight');
                // POBoxnumber
                /*   valid &= v = isAN(commercialparty.POBoxnumber, 1, 35);
                   if (!v && updatecontrols)
                       $('#' + apartyTypeCode + 'POBoxnumbervalue').addClass('displayed error-highlight');*/
                // address
                valid &= v = isAN(commercialparty.address, 1, 35);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'address'); //$('#' + apartyTypeCode + 'addressvalue').addClass('displayed error-highlight');
                // city
                valid &= v = isAN(commercialparty.city, 1, 35);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'city'); // $('#' + apartyTypeCode + 'cityvalue').addClass('displayed error-highlight');
                // state
                valid &= v = (!["US", "CAN"].includes(commercialparty.country) || isA(commercialparty.state, 2, 3));
                valid &= v &= !commercialparty.state || isA(commercialparty.state, 2, 3)
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'state'); // $('#' + apartyTypeCode + 'statevalue').addClass('displayed error-highlight');
                // country
                valid &= v = isA(commercialparty.country, 2, 3);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'country'); //$('#' + apartyTypeCode + 'countryvalue').addClass('displayed error-highlight');
                // postalCode
                valid &= v = isAN(commercialparty.postalCode, 1, 9);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'postalCode'); //$('#' + apartyTypeCode + 'postalCodevalue').addClass('displayed error-highlight');
                // contactName
                valid &= v = isAN(commercialparty.contactName, 1, 70);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'contactName'); //$('#' + apartyTypeCode + 'contactNamevalue').addClass('displayed error-highlight');
                // telephoneNumber
                valid &= v = isAN(commercialparty.telephoneNumber, 1, 35);
                if (!v && updatecontrols)
                    this.MarkUnValid(apartyTypeCode + 'telephoneNumber'); //$('#' + apartyTypeCode + 'telephoneNumbervalue').addClass('displayed error-highlight');


                valid &= v;
            });

            return valid;
        }

        ,
    ValidateHouseProducts: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;

            let all_part_number = true;
            houseJSON.products.forEach((product, index) => {
                valid &= !!product.PartNumber
                all_part_number &= !!product.PartNumber;

                // cargoQuantity
                valid &= v = true; //isAN(product.cargoQuantity,1,70);
                if (!v && updatecontrols)
                    this.MarkUnValid('cargoQuantity' + index, 'cargoQuantityColumntext'); //$('#cargoQuantity' + product.PartNumber + 'value').addClass('displayed error-highlight');
                // cargoUOM
                //valid &= v = true; //isAN(product.cargoUOM,1,70);
                //if (!v && updatecontrols)
                //    $('#cargoUOM' + product.PartNumber + 'value').addClass('displayed error-highlight');
                // cargoDesc
                valid &= v = isAN(product.cargoDesc, 1, 256);
                if (!v && updatecontrols) {

                    this.MarkUnValid('cargoDesc' + index, 'cargoDescColumntext'); //$('#cargoDesc' + product.PartNumber + 'value').addClass('displayed error-highlight');
                } // marksAndNumbers
                valid &= v = isAN(product.marksAndNumbers, 1, 70);
                if (!v && updatecontrols)
                    this.MarkUnValid('marksAndNumbers' + index, 'marksAndNumbersColumntext'); //$('#marksAndNumbers' + product.PartNumber + 'value').addClass('displayed error-highlight');

                valid &= v = (!product.isHazardous || isAN(product.undgCode, 1, 10));
                if (!v && updatecontrols)
                    this.MarkUnValid('undgCode' + index);

                /* valid &= v = isAN(product.hsCode, 10);
                 if (!v && updatecontrols) {
                     //   alert('hsCode' + index);
                     this.MarkUnValid('hsCode' + index, 'hsCodeColumntext'); //$('#hsCode' + product.PartNumber + 'value').addClass('displayed error-highlight');
                 }*/

                // }

            });

            if (!all_part_number && updatecontrols) {
                let message = "There are commodities without Part Number";
                if (!$('#span_not_part_number').length)
                    $('#span_commodities').after(`<span id="span_not_part_number" style='color:red;' >${message}</span>`);
                valid = false;
                // alert("Please review that all commodities have Part Number");
            }

            //alert(houseJSON.products.length > 0);
            if (!(houseJSON.products.length > 0)) {
                let message = "There are not commodities";
                $('#span_commodities').after(`<span id="span_not_part_number" style='color:red;' >${message}</span>`);
                valid = false;
            }

            // products
            /*    $("#products  .field-copy ").each((index, tag) => {
                    //alert(index);
                    if ($(tag).html() == empty) {
                        if (!$(tag).hasClass('error-highlight'))
                            $(tag).addClass('error-highlight');
                    }
                });*/

            return valid;
        }

        ,
    ValidateHouseEquipments: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;

            // equipments
            $("#equipments  .field-copy ").each((index, tag) => {

                if ($(tag).html() == empty) {
                    if (!$(tag).hasClass('error-highlight'))
                        $(tag).addClass('error-highlight');
                }
            });

            houseJSON.equipments.forEach((equipment) => {

                valid &= !!equipment.equipmentNumber;
                // if (equipment.equipmentNumber) {

                // equipmentType
                valid &= v = equipment.equipmentType == 'CN';
                // if (!v && updatecontrols)
                //    $('#equipmentType' + equipment.equipmentType + 'value').addClass('displayed error-highlight');
                // equipmentNumber
                valid &= v = isAN(equipment.equipmentNumber, 1, 16);
                if (!v && updatecontrols)
                    this.MarkUnValid('equipmentNumber' + equipment.equipmentNumber); //$('#equipmentNumber' + equipment.equipmentNumber + 'value').addClass('displayed error-highlight');
                // sealInfo1
                valid &= v = isAN(equipment.sealInfo.sealNumbers[0], 1, 15);

                if (!v && updatecontrols) {
                    this.MarkUnValid('sealInfo1' + equipment.equipmentNumber); //$('#sealInfo1' + equipment.equipmentNumber + 'value').addClass('displayed error-highlight');

                } // sealInfo2
                valid &= v = isAN(equipment.sealInfo.sealNumbers[1], 1, 15);
                if (!v && updatecontrols) {
                    //if(equipment.equipmentNumber)
                    this.MarkUnValid('sealInfo2' + equipment.equipmentNumber); //$('#sealInfo2' + equipment.equipmentNumber + 'value').addClass('displayed error-highlight');
                }
                //}
            });

            return valid;
        }

        ,
    ValidateHouseSNPPartys: function (houseJSON, updatecontrols) {
            let valid = true;
            let v;

            // SNPPartys
            houseJSON.SNPPartys.forEach((SNPParty, i) => {
                // equipmentType
                valid &= v = (SNPParty.SNPType == 'CA');
                //if (!v && updatecontrols)
                //$('#SNPType' + SNPParty.SNPType + 'value').addClass('displayed error-highlight');
                // partyTypeCode
                valid &= v = (SNPParty.partyTypeCode == 'SNP');
                // if (!v && updatecontrols)
                //   $('#SNPType' + SNPParty.partyTypeCode + 'value').addClass('displayed error-highlight');
                // name
                valid &= v = isAN(SNPParty.name, 1, 70);
                if (!v && updatecontrols) {

                    this.MarkUnValid(`SNP${i}name`); // $('#SNPType' + SNPParty.name + 'value').addClass('displayed error-highlight');
                }
                // cbsaIdentifier
                valid &= v = isAN(SNPParty.cbsaIdentifier, 4);
                if (!v && updatecontrols)
                    this.MarkUnValid(`SNP${i}cbsaIdentifier`); //$('#SNPType' + SNPParty.cbsaIdentifier + 'value').addClass('displayed error-highlight');

            });

            return valid;
        }

        ,
    ValidateHouse: function (houseJSON, updatecontrols) { // visually validate de displayed house 

            if (updatecontrols)
                this.CleanHouseValidation();

            let valid = true;
            let v;

            valid &= this.ValidateHouseGeneralData(houseJSON, updatecontrols);
            valid &= this.ValidateHouseCargoHeader(houseJSON, updatecontrols);
            valid &= this.ValidateHouseComercialParties(houseJSON, updatecontrols);
            valid &= this.ValidateHouseProducts(houseJSON, updatecontrols);
            valid &= this.ValidateHouseEquipments(houseJSON, updatecontrols);
            valid &= this.ValidateHouseSNPPartys(houseJSON, updatecontrols);



            // suscribe house details helps messages
            $('#divhouse [helpicon]').each((index, tag) => {
                $(tag).click(() => {
                    let prevTag = $(tag).prev();
                    if (prevTag) {
                        let aid = prevTag.attr('translate');
                        if (aid && aid.length > 4) {
                            aid = aid.substr(0, aid.length - 4);

                            this.DisplayHelp(aid);
                        }
                    }

                });

            });

            if (updatecontrols) {
                this.AddNotificationPartyHelp(houseJSON);
            }

            return valid;

            // hide non error

        }

        ,
    displaySettings: function () {
            /*fs.readFile(`${__dirname}/../pages/partials/settings_partial.html`, function (err, data) {
   
            $('#divrightcontent').html(data + '');
   
            //fill the form         
            let settings = hyp.getStoredSettings();
            
            $("#inputCBSA").val(settings.inputCBSA);
            $("#testMode").prop('checked', settings.testMode);
   
        });*/

            $.get(`${EHBLBusinessController.base_url()}/front/partial/settings_partial`, null, function (data) {
                $('#divrightcontent').html(data + '');

                $.get(`${EHBLBusinessController.base_url()}/front/settings`, null, function (settings) {
                    //fill the form         
                    //let settings = hyp.getStoredSettings();

                    $("#inputCBSA").val(settings.inputCBSA);
                    $("#testMode").prop('checked', settings.testMode);

                });
            });
        }

        ,
    displayAlert: function () {
            $.get(`${this.base_url()}/front/partial/alerts_partial`, null, function (data) {
                $('#divrightcontent').html(data + '');
            });

            /*fs.readFile(`${__dirname}/../pages/partials/alerts_partial.html`, function (err, data) {
                $('#divrightcontent').html(data + '');
            });*/
        }

        ,
    loadhousetemplate: function (callback) {
            $.get(`${this.base_url()}/front/partial/houseTemplate`, null, function (data) {
                callback("" + data);
            });

            /*fs.readFile(`${__dirname}/../pages/ehbl/houseTemplate.html`, function (err, data) {
                callback("" + data);
            });*/
        }

        ,
    loadmainnav: function (callback) {
        fs.readFile(`${__dirname}/../pages/partials/main_nav.html`, function (err, data) {
            callback(data);
        });
    }

}
