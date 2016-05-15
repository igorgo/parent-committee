/**
 * Created by igorgo on 08.05.2016.
 */
jQuery(function ($) {
    // TODO: При выборе описания расхода последняя кол-во/цена/сумма
    // TODO: Грид с расходами

    var $o = {};
    var expTypes = [];
    var rowTemplate;

    var rowSelectors = {
        row: ".expense-row",
        type: ".form-add-expenses-type",
        descr: ".form-add-expenses-descr",
        ammount: ".form-add-expenses-ammount",
        quant: ".form-add-expenses-quant",
        buttonPlus: ".exp-type-new-row",
        buttonMinus: ".exp-type-del-row"
    };

    // Инициализация страницы
    $(function () {
        // Инициализация объектов страницы
        $o.btnNewExpenses = $("#expense-button-new-expense");
        $o.dlgAddExpenses = $("#dialog-add-expenses");
        $o.formAdd = $o.dlgAddExpenses.find("#form-add-expenses");
        $o.formAdd.fldDate = $o.formAdd.find("#form-add-expenses-date");
        $o.formAdd.btnNewType = $o.formAdd.find("#form-add-expenses-button-new-type");
        $o.formAdd.lblTotalAmount = $o.formAdd.find("#form-add-expenses-total-ammount");
        $o.formAdd.detail = $o.formAdd.find("#form-add-expenses-detail");
        $o.formAdd.btnOk = $o.dlgAddExpenses.find("#form-add-expenses-ok");
        $o.formAdd.btnCancel = $o.dlgAddExpenses.find("#form-add-expenses-cancel");
        $o.dlgNewType = $("#exp-type-new-dialog");
        $o.dlgNewType.fldName = $o.dlgNewType.find("#exp-type-new-dialog-input-name");
        $o.dlgNewType.btnOk = $o.dlgNewType.find("#exp-type-new-dialog-button-ok");
        $o.table = $("#expenses-table");
        $o.dlgDeleteOper = $("#confirm-delete");
        $o.dlgDeleteOper.btnDelete= $o.dlgDeleteOper.find("#conf-del-ok-button");
        $o.dlgEditExpenses = $("#dialog-edit-expenses");
        $o.formEdit = $o.dlgEditExpenses.find("#form-edit-expenses");
        $o.formEdit.btnNewType = $o.formEdit.find("#form-edit-expenses-button-new-type");
        $o.formEdit.fldDate = $o.formEdit.find("#form-edit-expenses-date");
        $o.formEdit.fldDescr = $o.formEdit.find("#form-edit-expenses-descr");
        $o.formEdit.fldType = $o.formEdit.find("#form-edit-expenses-type");
        $o.formEdit.fldQuant = $o.formEdit.find("#form-edit-expenses-quant");
        $o.formEdit.fldAmount = $o.formEdit.find("#form-edit-expenses-ammount");
        $o.formEdit.btnOk = $o.dlgEditExpenses.find("#form-edit-expenses-ok");
        $o.formEdit.btnCancel = $o.dlgEditExpenses.find("#form-edit-expenses-cancel");

        // Ajax запрос шаблона строки затарат
        $.get("/expenses/rowtemplate").done(function (data) {
            rowTemplate = data;
        });

        // Ajax запрос списка категорий расходов
        $.getJSON("/expenses/types").done(function (data) {
            expTypes = data;
        });

        initPageEvents();
        initDlgAddEvents();
        initDlgEditEvents();
        initDlgNewType();
        initTable();
    });

    // Инициализация таблицы
    function initTable() {
        window.rowOperateEvents = {
            'click .del-expense': /**
             * Обработчик клика ссылке "Удалить расход"
             * @param e
             * @param value
             * @param {Object} row
             * @param {number} row.rowid
             */
                function (e, value, row) {
                $o.dlgDeleteOper.btnDelete.attr("del-exp-id", row.rowid);
                $o.dlgDeleteOper.modal('show');
            },
            'click .edit-expense': /**
             * Обработчик клика ссылке "Исправить расход"
             * @param e
             * @param value
             * @param {Object} row
             * @param {number} row.rowid
             */
                function (e, value, row) {
                $o.formEdit.record = row;
                $o.dlgEditExpenses.modal('show');
                console.log("todo: исправление расхода");
                console.log(row);
                // todo: исправление расхода
            }

        };
        var operCell = [
            '<a class="edit-expense btn btn-primary btn-xs" href="javascript:void(0)" title="Исправить">',
            '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>',
            '</a>',
            '<a class="del-expense btn btn-danger btn-xs ml5" href="javascript:void(0)" title="Удалить">',
            '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>',
            '</a>'
        ].join('');

        $o.dlgDeleteOper.btnDelete.on("click",function(e){
            e.preventDefault();
            $.ajax({
                type: 'DELETE',
                url: '/expenses/' + $(this).attr("del-exp-id")
            }).done(function () {
                $o.dlgDeleteOper.modal('hide');
                $o.table.bootstrapTable('refresh');
            });
        });

        $o.table.bootstrapTable({
            url: "/expenses/list",
            columns: [{
                field: "exp_date",
                halign: "center",
                title: "Дата",
                sortable: true,
                formatter: d2s
            }, {
                field: "exp_type_name",
                halign: "center",
                title: "Категория",
                sortable: true
            },{
                field: "exp_descr",
                halign: "center",
                title: "Описание",
                sortable: true
            },{
                field: "exp_quant",
                halign: "center",
                title: "Кол-во",
                formatter:n2q,
                align: "right"
            },{
                field: "exp_amount",
                halign: "center",
                title: "Сумма",
                formatter:n2c,
                align: "right",
                sortable: true
            },{
                align: 'center',
                events: 'rowOperateEvents',
                formatter: function () {return operCell;}
            }]
        });


    }

    // События страницы
    function initPageEvents() {
        // Обработка нажатия кнопки добавления расходов
        $o.btnNewExpenses.on("click", function (event) {
            event.preventDefault();
            $o.dlgAddExpenses.modal('show');
        });
    }

    // заполнение комбика с категориями
    function refreshTypeSelect(fld) {
        var oldVal = fld.val();
        fld.find("option").remove().end().append("<option value=0></option>");
        $.each(expTypes, function (index, value) {
            //noinspection JSUnresolvedVariable
            fld.append($("<option></option>")
                .attr("value", value.rowid)
                .text(value.name));
        });
        fld.val(oldVal ? oldVal : "");
    }

    //События диалога редактирования расхода
    function initDlgEditEvents () {
        
        // Обработка нажатия кнопки добавления новой категории
        $o.formEdit.btnNewType.on('click', function (event) {
            event.preventDefault();
            $o.dlgNewType.modal('show');
        });

        // Обработка нажатия кнопки Отмена формы
        $o.formEdit.btnCancel.on('click', function (event) {
            event.preventDefault();
            $o.dlgEditExpenses.modal('hide');
        });

        // Обработка нажатия кнопки OK формы
        $o.formEdit.btnOk.on('click', function (event) {
            event.preventDefault();
            $o.formEdit.validator('destroy');
            $o.formEdit.validator('validate');
            if ($o.formEdit.find(".has-error").length > 0) return;
            var items = [];
            var date = new Date($o.formAdd.fldDate.val()).yyyymmdd();

            $o.formAdd.detail.getRows().each(function () {
                items.push({
                    exp_date: date,
                    exp_type: this.type.val(),
                    exp_quant: this.quant.val(),
                    exp_amount: this.ammount.val(),
                    exp_descr: this.descr.val()
                });
            });
            $.ajax({
                method: "PUT",
                url: "/expenses/"+ $o.formEdit.record.rowid,
                data: {
                    exp_date: $o.formEdit.fldDate.val(),
                    exp_type: $o.formEdit.fldType.val(),
                    exp_quant: $o.formEdit.fldQuant.val(),
                    exp_amount: $o.formEdit.fldAmount.val(),
                    exp_descr: $o.formEdit.fldDescr.val()
                }/*,
                dataType: 'JSON',
                success : function () {console.log("success")}*/
            }).done(function () {
                $o.dlgEditExpenses.modal('hide');
                $o.table.bootstrapTable('refresh');
            });
        });

        $o.formEdit.fldAmount.closest(".input-group").find(".input-group-addon").on("click", function (e) {
            $o.formEdit.fldAmount.val($o.formEdit.fldAmount.val() * $o.formEdit.fldQuant.val()).trigger("change");
        });

        // Обработка закрытия модальной формы исправления
        $o.dlgEditExpenses.on('hidden.bs.modal', function () {
            $o.formEdit.validator('destroy');
            $o.formEdit.fldDate.val("");
            $o.formEdit.fldAmount.val("");
            $o.formEdit.fldDescr.val("");
            $o.formEdit.fldQuant.val("");
            $o.formEdit.fldType.val("");
        });
        // Обработка открытия модальной формы исправления
        $o.dlgEditExpenses.on('show.bs.modal', function () {
            refreshTypeSelect($o.formEdit.fldType);
            $o.formEdit.fldDate.val($o.formEdit.record.exp_date);
            $o.formEdit.fldAmount.val($o.formEdit.record.exp_amount);
            $o.formEdit.fldDescr.val($o.formEdit.record.exp_descr);
            $o.formEdit.fldQuant.val($o.formEdit.record.exp_quant).trigger("change");
            $o.formEdit.fldType.val($o.formEdit.record.exp_type);
        });


    }


    // События диалога добавления
    function initDlgAddEvents() {

        // Добавление строки формы расходов
        $o.formAdd.detail.addRow = function (e) {

            var row, needFocus;

            if (e) {
                $(this).closest(rowSelectors.row).before(rowTemplate);
                row = $(this).closest(rowSelectors.row).prev();
                needFocus = true;
            } else {
                $o.formAdd.detail.prepend(rowTemplate);
                row = $($o.formAdd.detail.find(rowSelectors.row)[0]);
                needFocus = false;
            }
            initDetailRow(row[0]);
            $o.formAdd.detail.hideShowLastMinus();
            if (needFocus) row.find(rowSelectors.type)[0].focus();
        };

        // Скрытие показ кноки удаления
        $o.formAdd.detail.hideShowLastMinus = function () {
            if (($o.formAdd.detail.find(rowSelectors.row)).length > 1) {
                $o.formAdd.detail.find(rowSelectors.buttonMinus).show();
            } else {
                $o.formAdd.detail.find(rowSelectors.buttonMinus).hide();
            }
        };

        $o.formAdd.detail.getRows = function () {
            return $o.formAdd.detail.find(rowSelectors.row)
        };

        // Обработка нажатия кнопки добавления новой категории
        $o.formAdd.btnNewType.on('click', function (event) {
            event.preventDefault();
            $o.dlgNewType.modal('show');
        });

        // Обработка нажатия кнопки ОК формы
        $o.formAdd.btnOk.on('mousedown', function (event) {
            event.preventDefault();
        });
        $o.formAdd.btnOk.on('click', function (event) {
            event.preventDefault();
            $o.formAdd.validator('destroy');
            $o.formAdd.validator('validate');
            if ($o.formAdd.find(".has-error").length > 0) return;
            var items = [];
            var date = new Date($o.formAdd.fldDate.val()).yyyymmdd();

            $o.formAdd.detail.getRows().each(function () {
                items.push({
                    exp_date: date,
                    exp_type: this.type.val(),
                    exp_quant: this.quant.val(),
                    exp_amount: this.ammount.val(),
                    exp_descr: this.descr.val()
                });
            });
            $.post({
                url: "/expenses",
                data: {items: JSON.stringify(items)},
                dataType: 'JSON'
            }).done(function (result) {
                $o.dlgAddExpenses.modal('hide');
                $o.table.bootstrapTable('refresh');
            });
        });

        // Обработка нажатия кнопки Отмена формы
        $o.formAdd.btnCancel.on('click', function (event) {
            event.preventDefault();
            $o.dlgAddExpenses.modal('hide');
        });

        // Обработка закрытия модальной формы добавления
        $o.dlgAddExpenses.on('hidden.bs.modal', function () {
            $o.formAdd.validator('destroy');
            $o.formAdd.lblTotalAmount.text("");
            $o.formAdd.fldDate.val("");
            $o.formAdd.detail.html("");
        });

        $o.dlgAddExpenses.on('show.bs.modal', function () {
            $o.formAdd.detail.addRow();
            //$o.formAdd.detail.find(rowSelectors.buttonMinus).hide();
        });
    }

    // Инициализация строки добавления расходов
    function initDetailRow(row) {
        var lRow = $(row);
        // todo: автопоиск в расходах
        // http://plugins.upbootstrap.com/bootstrap-ajax-typeahead/
        row.type = lRow.find(rowSelectors.type);
        row.descr = lRow.find(rowSelectors.descr);
        row.quant = lRow.find(rowSelectors.quant);
        row.ammount = lRow.find(rowSelectors.ammount);
        row.buttonPlus = lRow.find(rowSelectors.buttonPlus);
        row.buttonMinus = lRow.find(rowSelectors.buttonMinus);

        row.refreshTypes = function () {
            refreshTypeSelect(row.type);
        };
        // Заполнение select списка категорий расходов
        row.refreshTypes();
        row.buttonPlus.on("click", $o.formAdd.detail.addRow);
        row.buttonMinus.on("click", function () {
            $(this).closest(rowSelectors.row).remove();
            $o.formAdd.detail.hideShowLastMinus();
        });
        row.ammount.on("change", function () {
            if (this.value == 0) $(this).val("");
            else this.value = parseFloat(this.value).toFixed(2);
            var ttl = 0;
            $o.formAdd.detail.find(rowSelectors.ammount).each(function () {
                ttl += $(this).val() * 1;
            });
            $o.formAdd.lblTotalAmount.text(ttl.formatMoney(2, '₴'));
        });
        row.ammount.closest(".input-group").find(".input-group-addon").on("click", function (e) {
            row.ammount.val(row.ammount.val() * row.quant.val()).trigger("change");
        });
    }

    // События диалога новой категории
    function initDlgNewType() {
        // Обработка нажатия кнопки ОК диалога добавления новой категории
        $o.dlgNewType.btnOk.on('click', function (event) {
            event.preventDefault();
            $o.dlgNewType.validator('validate');
            if ($o.dlgNewType.find(".has-error").length > 0) return;
            $.post({
                url: "/expenses/types",
                data: {name: $o.dlgNewType.fldName.val()},
                dataType: 'JSON'
            }).done(function (result) {
                console.log(expTypes);
                expTypes = result.list;
                console.log(expTypes);
                $o.formAdd.detail.getRows().each(function () {
                    this.refreshTypes();
                });
                refreshTypeSelect($o.formEdit.fldType);
                $o.dlgNewType.modal("hide");
            });
        });
        $o.dlgNewType.on('hidden.bs.modal', function () {
            $o.dlgNewType.validator('destroy');
            $o.dlgNewType.fldName.val("");
        });
    }


});
