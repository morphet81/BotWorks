/**
 * Created by alexandre on 21/12/2016.
 */
jQuery.ajaxSetup({
    dataFilter: function (data, type) {
        console.log(data);
        return data;
    }
});

var i = 0;
var test = function() {
    // Click the button
    $("#J_flashBtn").trigger("click");
    location.reload();

    if(i % 3 == 0) {
        console.log('Check clicking : ' + i);
    }

    if($("#J_miAlert").is(':visible') || $("#J_modalFlashSoldout").is(':visible') || $("#J_modalAward").is(':visible') || $("#J_modalVideo").is(':visible')) {
        console.log('close dialogs');
        $("#J_modalFlashSoldout a").trigger('click');
        $("#J_miAlertConfirm").trigger('click');
    }

    if(!$("#J_flashBtn").hasClass('btn-disable')) {
        setTimeout(function () {
            console.log('Stop trying')
            clearInterval(autoClick);
        }, 10000);
    }
    i++;
};

// var autoClick = setInterval(test, 400);