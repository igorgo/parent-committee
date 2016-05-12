/**
 * Created by igorgo on 26.04.2016.
 */
jQuery(function ($) {
    var $o = {};
    $(function () {
        initObjects();
        initMainTable();
        stunRightPanel();
        initDonateForm();
        initDebtForm();
        initConfirmDelete();
    });

    /**
     * Инициализация объектов страницы
     */
    function initObjects() {
        $o.tableDebtors = $("#debtor-table");
        $o.panelRight = $('#donates-right-panel');
        $o.formDonate = $("#donates-form-donate");
        $o.formDonate.fldPupil = $("#form-make-donate-pupil");
        $o.formDonate.fldDate = $("#form-make-donate-date");
        $o.formDonate.fldSumm = $("#form-make-donate-summ");
        $o.formDonate.btnOk = $("#form-make-donate-ok");
        $o.formDonate.btnCancel = $("#form-make-donate-cancel");
        $o.formDebt = $("#donates-form-make-debt");
        $o.formDebt.fldDate = $("#form-make-debt-date");
        $o.formDebt.fldSumm = $("#form-make-debt-summ");
        $o.formDebt.btnOk = $("#form-make-debt-ok");
        $o.formDebt.btnCancel = $("#form-make-debt-cancel");
        $o.dlgDeleteOper = $("#confirm-delete");
        $o.dlgDeleteOper.btnDelete= $("#oper-del-conf-button");
    }

    /**
     * Инициализация модальной формы подтверждения удаления
     */
    function initConfirmDelete() {
        $o.dlgDeleteOper.btnDelete.on('click', function (e) {
            e.preventDefault();
            $.ajax({
                type: 'DELETE',
                url: '/donates/deldonate/' + $(this).attr("del-oper-id")
            }).done(function () {
                $o.dlgDeleteOper.modal('hide');
                $o.tableDebtors.bootstrapTable('refresh');
            });
        });
    }

    /**
     * Инициализация формы взноса
     */
    function initDonateForm() {
        /**
         * Очистка формы
         */
        function clearMakeDonateForm() {
            $o.formDonate.find("input").val("");
            $o.formDonate.fldPupil.val("").trigger('change');
        }

        initPupilsCombo();
        // Кнопка ОК
        $o.formDonate.btnOk.on("click", function (event) {
            event.preventDefault();
            if (validateForm($o.formDonate)) {
                return;
            }
            var donateDate = $o.formDonate.fldDate.val();
            var donateSumm = $o.formDonate.fldSumm.val();
            var donatePupil = $o.formDonate.fldPupil.val();
            $.ajax({
                type: 'POST',
                data: {date: donateDate, summ: donateSumm, pupil: donatePupil},
                url: '/donates/makedonate',
                dataType: 'JSON'
            }).done(function (response) {
                if (response.status === 'success') {
                    clearMakeDonateForm();
                    $o.tableDebtors.bootstrapTable('refresh');
                }
                else {
                    alert('Error:' + response.error);
                }
            });
        });
        // Кнопка Отмена
        $o.formDonate.btnCancel.on("click", function (event) {
            event.preventDefault();
            $o.formDonate.validator("destroy");
            clearMakeDonateForm();
        });
    }

    /**
     * Валидация вормы
     * @returns {boolean}
     */
    function validateForm(form) {
        form.validator({
            custom: {
                vnotzerro: function ($el) {
                    if ($el.val()) return $el.val() != 0;
                    else return true;
                }
            },
            errors: {
                vnotzerro: 'Число не должно быть нулевым'
            }
        });
        form.validator('validate');
        return (form.find(".has-error").length > 0);
    }


    /**
     * Инициализация формы начисления
     */
    function initDebtForm() {

        /**
         * Очистка формы
         */
        function clearMakeDebtForm() {
            $o.formDebt.find("input").val("");
        }

        // Кнопка ОК
        $o.formDebt.btnOk.on("click", function (event) {
            event.preventDefault();
            if (validateForm($o.formDebt)) {
                return;
            }
            var debtDate = $o.formDebt.fldDate.val();
            var debtSumm = $o.formDebt.fldSumm.val();
            var debt = {};
            debt.date = debtDate;
            debt.summ = debtSumm * 1;
            $.ajax({
                type: 'POST',
                data: debt,
                url: '/donates/makedebt',
                dataType: 'JSON'
            }).done(function () {
                clearMakeDebtForm();
                $o.tableDebtors.bootstrapTable('refresh');
            });
        });
        // Кнопка Отмена
        $o.formDebt.btnCancel.on("click", function (event) {
            event.preventDefault();
            $o.formDebt.validator('destroy');
            clearMakeDebtForm();
            $o.formDebt.collapse('hide');
        });

        function validateForm() {
            $o.formDebt.validator({
                custom: {
                    vnotzerro: function ($el) {
                        if ($el.val()) return $el.val() != 0;
                        else return true;
                    }
                },
                errors: {
                    vnotzerro: 'Число не должно быть нулевым'
                }
            });
            $o.formDebt.validator('validate');
            return ($o.formDebt.find(".has-error").length > 0);
        }
    }

    /**
     * Делает правую панель несдвигаемой
     */
    function stunRightPanel() {
        // см. #donates-right-panel.affix в styles.css
        $o.panelRight.on('affix.bs.affix', function (a) {
            var cv = a.target.clientWidth + 2;
            a.target.style.width = cv + "px";
        });
        $o.panelRight.on('affix-top.bs.affix', function (a) {
            a.target.style.width = "";
        });
    }

    /**
     * Инициализация комбобокса с учениками
     */
    function initPupilsCombo() {
        $.ajax({
            type: 'GET',
            url: '/pupils/select2list',
            dataType: 'json'
        }).then(function (data) {
            // инициируем комбобокс (https://select2.github.io/)
            $o.formDonate.fldPupil.select2({
                placeholder: 'Выберите ученика...',
                language: "ru",
                data: data,
                theme: "bootstrap"
            });
        });
    }

    /**
     * Инициализация основной таблицы должников
     */
    function initMainTable() {
        $o.tableDebtors.bootstrapTable({
            detailView: true,
            idField: "rn",
            uniqueId: "rn",
            url: "/donates/debtors",
            showMultiSort: true,
            search: true,
            showExport: true,
            sortPriority: [
                {
                    sortName: "debtSumm",
                    sortOrder: "desc"
                },
                {
                    sortName: "shortName",
                    sortOrder: "asc"
                }
            ],
            locale: "ru_RU",
            pagination: true,
            pageList:[10,16,20,25,50,100],
            pageSize: 16,
            /*
             sortName: "debtSumm",
             sortOrder: "desc",
             */
            columns: [
                {
                    field: "shortName",
                    title: "ФИО",
                    halign: "center",
                    sortable: true,
                    sorter: localeCompareSort
                },
                {
                    field: "debtSumm",
                    halign: "center",
                    title: "Сумма",
                    align: "right",
                    sortable: true,
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
        $o.tableDebtors.on('expand-row.bs.table', function (e, index, row, $detail) {
            /*if (expandedRowIndex &&  expandedRowIndex != index ) debtorTable.bootstrapTable('collapseRow',expandedRowIndex);
             expandedRowIndex = index;*/
            initDetailTable(row, $detail);
        });
    }

    /**
     * Запрос данных дитейл-таблицы с операциями
     * @param row     - строка данных мастер-таблицы
     * @param $detail - html-элемент дитейла
     */
    function initDetailTable(row, $detail) {
        $.ajax({
            type: 'GET',
            url: '/donates/pupilopers/' + row.rn,
            dataType: 'json'
        }).then(function (data) {
            $detail.html('<table class="table-condensed"></table>')
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
            '<a class="del-oper btn btn-danger btn-xs" href="javascript:void(0)" title="Удалить">',
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
            '<a class="do-donate btn btn-success btn-xs" href="javascript:void(0)"">',
            '<span class="glyphicon glyphicon-plus" aria-hidden="true" style="margin-right: 8px"></span>',
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
            $o.dlgDeleteOper.btnDelete.attr("del-oper-id", row.id);
            $o.dlgDeleteOper.modal('show');
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
            $o.formDonate.fldPupil.val(row.rn).trigger('change');
            $o.formDonate.fldDate.val(new Date().yyyymmdd());
            $o.formDonate.fldSumm.val((row.debtSumm).formatMoney(2, "", ".", ""));
            //alert('You click like action, row: ' + JSON.stringify(row));
        }
    };
});
