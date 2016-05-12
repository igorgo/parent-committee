/**
 * Created by igorgo on 08.05.2016.
 */
jQuery(function ($) {
    // TODO: Пересчеты кол-во/цена/сумма
    // TODO: Инициализация комбобокса категорий #expense-form-combo-type
    // TODO: Автоподстановка затрат
    // TODO: При выборе затрат последняя кол-во/цена/сумма
    // TODO: Грид с затратами

    var $o = {};

    /**
     * Инициализация объектов страницы
     */
    function initObjects() {
        $o.form = $("#expense-form");
        $o.form.fldType =   $o.form.find("#expense-form-combo-type");
        $o.form.fldDescr =  $o.form.find("#expense-form-input-descr");
        $o.form.fldDate =   $o.form.find("#expense-form-input-date");
        $o.form.fldQuant =  $o.form.find("#expense-form-input-quant");
        $o.form.fldAmount = $o.form.find("#expense-form-input-amount");
        $o.form.fldPrice =  $o.form.find("#expense-form-input-price");
        $o.form.btnNewType = $o.form.find("#expense-form-button-new-type");
        $o.form.btnOk = $o.form.find("#expense-form-button-ok");
        $o.form.btnCancel = $o.form.find("#expense-form-button-cancel");
        $o.dlgNewType = $("#exp-type-new-dialog");
        $o.dlgNewType.fldName = $o.dlgNewType.find("#exp-type-new-dialog-input-name");
        $o.dlgNewType.btnOk = $o.dlgNewType.find("#exp-type-new-dialog-button-ok");
    }

    /**
     * Инициализация событий страницы
     */
    function initEvents(){
        $o.form.btnNewType.on('click', onFormNewExpTypeClick);
        $o.form.btnOk.on('click', onFormOkClick);
        $o.form.btnCancel.on('click', onFormCancelClick);
        $o.dlgNewType.btnOk.on('click', onNewExpTypeOkClick);
    }

    /**
     * Обработка нажатия кнопки добавления новой категории
     * @param event
     */
    function onFormNewExpTypeClick(event) {
        event.preventDefault();
        $o.dlgNewType.modal('show');
    }

    /**
     * Обработка нажатия кнопки ОК диалога добавления новой категории
     * @param event
     */
    function onNewExpTypeOkClick(event) {
        event.preventDefault();
        console.info("TODO: вызов rest добавления новой категории расходов (новое значение в комбо после его обновления)");
        // TODO: вызов rest добавления новой категории расходов (новое значение в комбо после его обновления)
    }

    /**
     * Очистка полей формы
     */
    function clearFormFields() {
        var clearingInputs = [$o.form.fldType, $o.form.fldDescr, $o.form.fldDate, $o.form.fldQuant, $o.form.fldAmount, $o.form.fldPrice];
        clearingInputs.forEach(function (input) {
            input.val("");
        });
    }

    /**
     * Обработка нажатия кнопки Отмена формы
     * @param event
     */
    function onFormCancelClick(event) {
        event.preventDefault();
        clearFormFields();
        $o.form.validator('destroy');
    }

    /**
     * Обработка нажатия кнопки ОК формы
     * @param event
     */
    function onFormOkClick(event) {
        event.preventDefault();
        $o.form.validator('validate');
        console.info("TODO: вызов rest добавления расхода");
        // TODO: валидация формы
        // TODO: вызов rest добавления расхода
        // TODO: вызов clearFormFields() после добавления
        // TODO: вызов обновления таблицы после добавления
    }

    /**
     * Инициализация страницы
     */
    $(function () {
        initObjects();
        initEvents();
    });
});
