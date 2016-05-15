/**
 * Created by igorgo on 15.05.2016.
 */
jQuery(function ($) {
    var $o = {};
    // Инициализация страницы
    $(function () {
        $o.panelCash = $("#cash-panel");
        $o.panelCash.remnCash = $o.panelCash.find("#cash-remns");
        $o.panelCash.remnDebt = $o.panelCash.find("#debt-remns");
        panelCashInit();
    });

    function panelCashInit () {
        $.get("/remnondate/" + (new Date()).yyyymmdd())
            .done(function (result) {
                $o.panelCash.remnCash.text(n2c(result.remn));
            });
        $.get("/debtondate/" + (new Date()).yyyymmdd())
            .done(function (result) {
                $o.panelCash.remnDebt.text(n2c(result.debt));
            });
    }
});