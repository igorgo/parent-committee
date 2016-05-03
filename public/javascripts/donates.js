/**
 * Created by igorgo on 26.04.2016.
 */
jQuery(function ($) {

    function clearMakeDebtForm() {
        $("#donates-form-make-debt input").val("");
    }

    function clearMakeDonateForm() {
        $("#donates-form-donate input").val("");
        $("#form-make-donate-pupil").val("").trigger('change');

    }

    $(function () {

        $("#form-make-debt-ok").on("click", function (event) {
            event.preventDefault();
            var debtDate = $("#form-make-debt-date").val();
            var debtSumm = $("#form-make-debt-summ").val();
            if ((debtSumm === "") || (debtSumm * 1 === 0)) {
                alert('Сумма начисления не должна быть нулевой');
                return false;
            }
            if (debtDate === "") {
                alert('Необходимо указать дату начисления');
                return false;
            }
            var debt = {};
            debt.date = debtDate;
            debt.summ = debtSumm * 1;
            $.ajax({
                type: 'POST',
                data: debt,
                url: '/donates/makedebt',
                dataType: 'JSON'
            }).done(function (response) {
                if (response.status === 'success') {
                    clearMakeDebtForm();
                    $("#debtor-table").bootstrapTable('refresh');
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

        $("#form-make-donate-ok").on("click", function (event) {
            event.preventDefault();
            var donateDate = $("#form-make-donate-date").val();
            var donateSumm = $("#form-make-donate-summ").val();
            var donatePupil = $("#form-make-donate-pupil").val();
            if ((donateSumm === "") || (donateSumm * 1 === 0)) {
                alert('Сумма взноса не должна быть нулевой');
                return false;
            }
            if (donateDate === "") {
                alert('Необходимо указать дату начисления');
                return false;
            }
            if (donatePupil === "") {
                alert('Необходимо выбрать ученика');
                return false;
            }
            $.ajax({
                type: 'POST',
                data: {date: donateDate, summ: donateSumm, pupil: donatePupil},
                url: '/donates/makedonate',
                dataType: 'JSON'
            }).done(function (response) {
                if (response.status === 'success') {
                    clearMakeDonateForm();
                    $("#debtor-table").bootstrapTable('refresh');
                }
                else {
                    alert('Error:' + response.error);
                }
            });
        });

        $("#form-make-donate-cancel").on("click", function (event) {
            event.preventDefault();
            clearMakeDonateForm();
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

        $.ajax({
            type: 'GET',
            url: '/pupils/select2list',
            dataType: 'json'
        }).then(function (data) {
            $('#form-make-donate-pupil').select2({
                placeholder: 'Выберите ученика...',
                language: "ru",
                data: data
            });
        });

        $("#debtor-table").on('expand-row.bs.table', function (e, index, row, $detail) {
            $.ajax({
                type: 'GET',
                url: '/donates/pupilopers/' + row.rn,
                dataType: 'json'
            }).then(function (data) {
                $detail.html('<table></table>')
                    .find('table')
                    .bootstrapTable({
                        data: data,
                        columns: [
                            {
                                field: "oper_date",
                                title: "Дата",
                                formatter: dateFormatter,
                                sortable: true
                            },
                            {
                                field: "oper_type",
                                title: "Операция",
                                sortable: true
                            },
                            {
                                field: "oper_summ",
                                title: "Сумма",
                                sortable: true
                            },
                            {
                                align: 'center',
                                events:'operateOperDateEvents',
                                formatter: deleteOperFormatter
                            }
                        ]
                    });
                /*$(".del-oper").on('click',function (e, value, row, index) {
                    alert('You click like action, row: ' + JSON.stringify(row));
                });*/
            });

        });


    });
    // https://select2.github.io/

    function dateFormatter(value) {
        return new Date(value).ddmmyyyy();
    }

    function formatCurrency(value, row, index) {
        return (value).formatMoney(2, '₴');
    }

    function dateFormatter(value) {
        return new Date(value).ddmmyyyy();
    }

    function deleteOperFormatter(value, row, index) {
        return [
            '<a class="del-oper" href="javascript:void(0)" title="Удалить">',
            '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>',
            '</a>'
        ].join('');
    }

    function operationsFormatter(value, row, index) {
        return [
            '<a class="do-donate" href="javascript:void(0)"">',
            'Добавить взнос',
            '</a>'
        ].join('');
    }

    window.operateOperDateEvents = {
        'click .del-oper': function (e, value, row, index) {
            // TODO: delete operation
            alert('You click like action, row: ' + JSON.stringify(row));
        }
    };

    window.operateEvents = {
        'click .do-donate': function (e, value, row, index) {
            $("#form-make-donate-pupil").val(row.rn).trigger('change');
            $("#form-make-donate-date").val(new Date().yyyymmdd());
            $("#form-make-donate-summ").val((row.debtSumm).formatMoney(2, "", ".", ""));
            //alert('You click like action, row: ' + JSON.stringify(row));
        }
    };

});



