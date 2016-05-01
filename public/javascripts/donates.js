/**
 * Created by igorgo on 26.04.2016.
 */
jQuery(function ($) {

    function clearMakeDebtForm() {
        $("#donates-form-make-debt input").val("");
    }

    $(function () {

        $("#form-make-debt-ok").on("click", function (event) {
            event.preventDefault();
            var debtDate = $("#form-make-debt-date").val();
            var debtSumm = $("#form-make-debt-summ").val();
            if ((debtSumm === "") || (debtSumm*1 === 0)) {
                alert('Сумма начисления не должна быть нулевой');
                return false;
            }
            if (debtDate === "") {
                alert('Необходимо указать дату начисления');
                return false;
            }
            var debt = {};
            debt.date = debtDate;
            debt.summ = debtSumm*1;
            $.ajax({
                type: 'POST',
                data: debt,
                url: '/donates/makedebt',
                dataType: 'JSON'
            }).done(function(response) {
                if (response.status === 'success') {
                    clearMakeDebtForm();
                }
                else {
                    alert('Error:' + response.error);
                }
            });
        });

        $("#form-make-debt-cancel").on("click", function (event) {
            event.preventDefault();
            clearMakeDebtForm();
            $("#donates-form-make-debt").collapse('hide');

        });


        var rightPanel = $('#donates-right-panel');
        rightPanel.on('affix.bs.affix', function (a) {
            var cv = a.target.clientWidth + 2;
            a.target.style.width = cv + "px";
        });

        rightPanel.on('affix-top.bs.affix', function (a) {
            //console.info('affix-top.bs.affix');
            a.target.style.width = "";
        });

    });

    // https://select2.github.io/
});

function formatCurrency (value, row, index) {
    return (value).formatMoney(2,'₴');
}
