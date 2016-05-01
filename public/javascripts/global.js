/**
 * Created by igorgo on 17.04.2016.
 */
Date.prototype.ddmmyyyy = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return  (dd[1]?dd:"0"+dd[0]) + "." + (mm[1]?mm:"0"+mm[0]) + "." + yyyy; // padding
};

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return  yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]) ; // padding
};

Number.prototype.formatMoney = function(decimalPart, currencySymbol, decimalDivider, thousandDivider){
    var n = this,
        c = isNaN(decimalPart = Math.abs(decimalPart)) ? 2 : decimalPart,
        d = decimalDivider == undefined ? "." : decimalDivider,
        t = thousandDivider == undefined ? " " : thousandDivider,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0,
        a = currencySymbol == undefined ? "" : " "+currencySymbol;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + a;
};

function d2s(val) {
    return (val) ? new Date(val).ddmmyyyy() : null;
}

function s2d(val) {
    return (val) ? new Date(val).yyyymmdd() : null;
}

jQuery(function($){
    // Your jQuery code here, using the $
    $(function() {
        $(".phone-mask").inputmask({"mask": "+38 (099) 999-9999"});
    });
});

