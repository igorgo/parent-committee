/**
 * Created by igorgo on 26.04.2016.
 */
jQuery(function ($) {

    $(function () {
        initMainTable();
        stunRightPanel();
        initDonateForm();
        initDebtForm();
    });

    /**
     * Инициализация формы взноса
     */
    function initDonateForm(){
        /**
         * Очистка формы
         */
        function clearMakeDonateForm() {
            $("#donates-form-donate").find("input").val("");
            $("#form-make-donate-pupil").val("").trigger('change');
        }
        initPupilsCombo();
        // Кнопка ОК
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
                alert('Необходимо указать дату взноса');
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
        // Кнопка Отмена
        $("#form-make-donate-cancel").on("click", function (event) {
            event.preventDefault();
            clearMakeDonateForm();
        });
    }

    /**
     * Инициализация формы начисления
     */
    function initDebtForm(){

        /**
         * Очистка формы
         */
        function clearMakeDebtForm() {
            $("#donates-form-make-debt").find("input").val("");
        }
        // Кнопка ОК
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
        // Кнопка Отмена
        $("#form-make-debt-cancel").on("click", function (event) {
            event.preventDefault();
            clearMakeDebtForm();
            $("#donates-form-make-debt").collapse('hide');

        });
    }

    /**
     * Делает правую панель несдвигаемой
     */
    function stunRightPanel() {
        var rightPanel = $('#donates-right-panel');
        // см. #donates-right-panel.affix в styles.css
        rightPanel.on('affix.bs.affix', function (a) {
            var cv = a.target.clientWidth + 2;
            a.target.style.width = cv + "px";
        });
        rightPanel.on('affix-top.bs.affix', function (a) {
            a.target.style.width = "";
        });
    }

    /**
     * Инициализация комбобокса с учениками
     */
    function initPupilsCombo(){
        $.ajax({
            type: 'GET',
            url: '/pupils/select2list',
            dataType: 'json'
        }).then(function (data) {
            // инициируем комбобокс (https://select2.github.io/)
            $('#form-make-donate-pupil').select2({
                placeholder: 'Выберите ученика...',
                language: "ru",
                data: data
            });
        });
    }

    /**
     * Инициализация основной таблицы должников
     */
    function initMainTable() {
        var debtorTable = $("#debtor-table");
        debtorTable.bootstrapTable({
            detailView: true,
            idField: "rn",
            url: "/donates/debtors",
            columns: [
                {
                    field: "shortName",
                    title: "ФИО",
                    halign: "center"
                },
                {
                    field: "debtSumm",
                    halign: "center",
                    title: "Сумма",
                    align: "right",
                    formatter: formatCurrency
                },
                {
                    formatter: operationsFormatter,
                    events: operateEvents,
                    align: "center"
                }
            ]
        });

        // инициируем дитейл-таблицу должников с операциями при разворачивании строки
        debtorTable.on('expand-row.bs.table', function(e, index, row, $detail){initDetailTable(row, $detail)});
    }

    /**
     * Инициализация дитейл-таблицы с операциями
     * @param row     - строка данных мастер-таблицы
     * @param $detail - html-элемент дитейла
     */
    function initDetailTable(row, $detail) {
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
                            events: 'operateOperDateEvents',
                            formatter: deleteOperFormatter
                        }
                    ]
                });
        });
    }

    /**
     * Форматирование числа в валютную сумму с двумя знаками после запятой и символом гривны
     * @param {number} value
     * @returns {string}
     */
    function formatCurrency(value) {
        return (value).formatMoney(2, '₴');
    }

    /**
     * Форматирование даты в dd.mm.yyyy
     * @param value
     * @returns {padding}
     */
    function dateFormatter(value) {
        return new Date(value).ddmmyyyy();
    }

    /**
     * Форматирование колонки дитейл таблицы для удаления операции
     * @returns {string}
     */
    function deleteOperFormatter() {
        return [
            '<a class="del-oper" href="javascript:void(0)" title="Удалить">',
            '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>',
            '</a>'
        ].join('');
    }

    /**
     * Форматирование колонки таблицы для добавления взноса
     * @returns {string}
     */
    function operationsFormatter() {
        return [
            '<a class="do-donate" href="javascript:void(0)"">',
            'Добавить взнос',
            '</a>'
        ].join('');
    }

    /**
     * Обработчик клика на колонке дитейл таблицы для удаления операции
     */
    window.operateOperDateEvents = {
        'click .del-oper': /**
         * Обработчик клика на корзине в детальной информации
         * Посылает запрос на удаление операции из БД
         * @param e
         * @param value
         * @param row
         */
            function (e, value, row) {
            // TODO: delete operation
            alert('You click like action, row: ' + JSON.stringify(row));
        }
    };

    /**
     *  Обработчик клика на колонке таблицы для добавления взноса
     */
    window.operateEvents = {
        'click .do-donate': /**
         * Обработчик клика ссылке "Добавить взнос"
         * Заполняет поля формы "Внесение в кассу",
         * учеником, текущей датой и суммой долга
         * @param e
         * @param value
         * @param {Object} row
         * @param {number} row.rn
         * @param {number} row.debtSumm
         */
            function (e, value, row) {
            $("#form-make-donate-pupil").val(row.rn).trigger('change');
            $("#form-make-donate-date").val(new Date().yyyymmdd());
            $("#form-make-donate-summ").val((row.debtSumm).formatMoney(2, "", ".", ""));
            //alert('You click like action, row: ' + JSON.stringify(row));
        }
    };
});



