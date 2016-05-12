/**
 * Created by igorgo on 19.04.2016.
 */

jQuery(function ($) {

    var genders = ['', 'M', 'F'];
    var currentPupil,editedPupilId;

    $(function () {
        $("#pupil-add-button").on("click", function (event) {
            event.preventDefault();
            clearEditPanel();
            showEditPanel("a");
        });

        $("#pupil-upd-button").on("click", function (event) {
            event.preventDefault();
            //noinspection JSUnresolvedVariable
            editedPupilId = currentPupil.rowid;
            clearEditPanel();
            populateEditForm(currentPupil);
            showEditPanel("u");
        });

        $("#pupil-add-do-button").on("click", function (event) {
            event.preventDefault();
            var f = $("#pupils-edit-form");
            f.validator('validate');
            if (f.find(".has-error").length > 0)return;
            var pupil = assemblePupil();
            // Ajax to post the object to our adduser service
            $.ajax({
                type: 'POST',
                //data: pupil,
                data: {pipilData: JSON.stringify(pupil)},
                url: '/pupils/addpupil',
                dataType: 'JSON'
            }).done(finishEdit);
        });


        $("#pupil-upd-do-button").on("click", function (event) {
            event.preventDefault();
            var f = $("#pupils-edit-form");
            f.validator('validate');
            if (f.find(".has-error").length > 0)return;
            var pupil = assemblePupil();
            pupil.$rn = editedPupilId;
            // Ajax to post the object to our adduser service
            $.ajax({
                type: 'POST',
                //data: pupil,
                data: {pipilData: JSON.stringify(pupil)},
                url: '/pupils/updpupil',
                dataType: 'JSON'
            }).done(finishEdit);
        });

        $("#pupil-add-cancel-button").on("click", function (event) {
            event.preventDefault();
            $("#pupils-edit-form").validator('destroy');
            hideEditPanel(false);
        });

        var pt = $('#pupils-table');
        pt.on('check.bs.table', function (row, $element) {
            getPupilInfo($element.rn);
        });

        pt.on('uncheck.bs.table', function () {
            populateDetailPanel(undefined);
        });

        $('#pupil-del-conf-button').on('click', function() {
            $.ajax({
                type: 'DELETE',
                //data: pupil,
                url: '/pupils/delpupil/' + editedPupilId
            }).done(function(){
                $("#confirm-delete").modal('hide');
                hideEditPanel(true);
            });
        });

        var detailPanel = $('#pupils-detail');
        detailPanel.on('affix.bs.affix', function (a) {
            var cv = a.target.clientWidth + 2;
            a.target.style.width = cv + "px";
        });

        detailPanel.on('affix-top.bs.affix', function (a) {
            //console.info('affix-top.bs.affix');
            a.target.style.width = "";
        });
    });

    /**
     * Вписывание данных в поля информационной панели   
     */
    function populateDetailPanel(pupilInfo) {
        $("#pupils-detail").find("dd").text("");
        if (pupilInfo) {
            $("#pupils-detail-hint").addClass("hidden");
            $("#pupils-detail-body").removeClass("hidden");
            $("#pupils-detail-footer").removeClass("hidden");
            $("#pupil-upd-button").removeClass("hidden");
            $('#pupil-last-name').text(pupilInfo.name_last);
            $('#pupil-first-name').text(pupilInfo.name_first);
            $('#pupil-middle-name').text(pupilInfo.name_middle);
            $('#pupil-birthday').text(d2s(pupilInfo.birthday));
            $('#pupil-email').text(pupilInfo.email);
            $('#pupil-home-address').text(pupilInfo.address_live);
            $('#pupil-reg-address').text(pupilInfo.address_reg);
            $('#pupil-cell-phone').text(pupilInfo.phone_cell);
            $('#pupil-home-phone').text(pupilInfo.phone_home);
            $('#mother-last-name').text(pupilInfo.mother_name_last);
            $('#mother-first-name').text(pupilInfo.mother_name_first);
            $('#mother-middle-name').text(pupilInfo.mother_name_middle);
            $('#mother-birthday').text(d2s(pupilInfo.mother_birthday));
            $('#mother-cell-phone').text(pupilInfo.mother_phone);
            $('#mother-email').text(pupilInfo.mother_email);
            $('#mother-work-place').text(pupilInfo.mother_work_place);
            $('#mother-work-post').text(pupilInfo.mother_work_post);
            $('#mother-work-phone').text(pupilInfo.mother_work_phone);
            $('#father-last-name').text(pupilInfo.father_name_last);
            $('#father-first-name').text(pupilInfo.father_name_first);
            $('#father-middle-name').text(pupilInfo.father_name_middle);
            $('#father-birthday').text(d2s(pupilInfo.father_birthday));
            $('#father-cell-phone').text(pupilInfo.father_phone);
            $('#father-email').text(pupilInfo.father_email);
            $('#father-work-place').text(pupilInfo.father_work_place);
            $('#father-work-post').text(pupilInfo.father_work_post);
            $('#father-work-phone').text(pupilInfo.father_work_phone);
        } else {
            $("#pupils-detail-hint").removeClass("hidden");
            $("#pupils-detail-body").addClass("hidden");
            $("#pupils-detail-footer").addClass("hidden");
            $("#pupil-upd-button").addClass("hidden");
        }
    }

    /**
     * Вписывание данных в поля формы редактирования
     * @param pupilInfo
     * @param pupilInfo.name_last
     * @param pupilInfo.name_first
     * @param pupilInfo.name_middle
     * @param pupilInfo.birthday
     * @param pupilInfo.gender
     * @param pupilInfo.email
     * @param pupilInfo.address_live
     * @param pupilInfo.address_reg
     * @param pupilInfo.phone_cell
     * @param pupilInfo.phone_home
     * @param pupilInfo.studied_from
     * @param pupilInfo.studied_till
     * @param pupilInfo.mother_name_last
     * @param pupilInfo.mother_name_first
     * @param pupilInfo.mother_name_middle
     * @param pupilInfo.mother_birthday
     * @param pupilInfo.mother_phone
     * @param pupilInfo.mother_email
     * @param pupilInfo.mother_work_place
     * @param pupilInfo.mother_work_post
     * @param pupilInfo.mother_work_phone
     * @param pupilInfo.father_name_last
     * @param pupilInfo.father_name_first
     * @param pupilInfo.father_name_middle
     * @param pupilInfo.father_birthday
     * @param pupilInfo.father_phone
     * @param pupilInfo.father_email
     * @param pupilInfo.father_work_place
     * @param pupilInfo.father_work_post
     * @param pupilInfo.father_work_phone
     */
    function populateEditForm(pupilInfo) {
        if (pupilInfo) {
            $('#inputLastName').val(pupilInfo.name_last);
            $('#inputFirstName').val(pupilInfo.name_first);
            $('#inputMiddleName').val(pupilInfo.name_middle);
            $('#inputBirthday').val(pupilInfo.birthday);
            $('#inputGender')[0].selectedIndex = genders.indexOf(pupilInfo.gender);
            $('#inputEmail').val(pupilInfo.email);
            $('#inputLiveAddress').val(pupilInfo.address_live);
            $('#inputRegAddress').val(pupilInfo.address_reg);
            $('#inputCellPhone').val(pupilInfo.phone_cell);
            $('#inputHomePhone').val(pupilInfo.phone_home);
            $('#inputStudyFrom').val(pupilInfo.studied_from);
            $('#inputStudyTill').val(pupilInfo.studied_till);
            $('#inputMotherLastName').val(pupilInfo.mother_name_last);
            $('#inputMotherFirstName').val(pupilInfo.mother_name_first);
            $('#inputMotherMiddleName').val(pupilInfo.mother_name_middle);
            $('#inputMotherBirthday').val(pupilInfo.mother_birthday);
            $('#inputMotherCellPhone').val(pupilInfo.mother_phone);
            $('#inputMotherEmail').val(pupilInfo.mother_email);
            $('#inputMotherWorkplace').val(pupilInfo.mother_work_place);
            $('#inputMotherPost').val(pupilInfo.mother_work_post);
            $('#inputMotherWorkPhone').val(pupilInfo.mother_work_phone);
            $('#inputFatherLastName').val(pupilInfo.father_name_last);
            $('#inputFatherFirstName').val(pupilInfo.father_name_first);
            $('#inputFatherMiddleName').val(pupilInfo.father_name_middle);
            $('#inputFatherBirthday').val(pupilInfo.father_birthday);
            $('#inputFatherCellPhone').val(pupilInfo.father_phone);
            $('#inputFatherEmail').val(pupilInfo.father_email);
            $('#inputFatherWorkplace').val(pupilInfo.father_work_place);
            $('#inputFatherPost').val(pupilInfo.father_work_post);
            $('#inputFatherWorkPhone').val(pupilInfo.father_work_phone);
        }
    }

    function getPupilInfo(pupilRn) {
        $.getJSON('/pupils/pupilinfo/' + pupilRn, function (data) {
            currentPupil = data;
            populateDetailPanel(data);
        });
    }


    function assemblePupil() {
        var lastName = $('#inputLastName').val();
        var firstName = $('#inputFirstName').val();

        function es(s) {
            if (s) {
                return s;
            }
        }

        var pupil = {};
        pupil.$name_first = firstName;
        pupil.$name_middle = es($('#inputMiddleName').val());
        pupil.$name_last = lastName;
        pupil.$birthday = es(s2d($('#inputBirthday').val()));
        pupil.$gender = es(genders[$('#inputGender')[0].selectedIndex]);
        pupil.$email = es($('#inputEmail').val());
        pupil.$address_live = es($('#inputLiveAddress').val());
        pupil.$address_reg = es($('#inputRegAddress').val());
        pupil.$phone_home = es($('#inputHomePhone').val());
        pupil.$phone_cell = es($('#inputCellPhone').val());
        pupil.$studied_from = es(s2d($('#inputStudyFrom').val()));
        pupil.$studied_till = es(s2d($('#inputStudyTill').val()));
        pupil.$mother_name_first = es($('#inputMotherFirstName').val());
        pupil.$mother_name_middle = es($('#inputMotherMiddleName').val());
        pupil.$mother_name_last = es($('#inputMotherLastName').val());
        pupil.$mother_birthday = es(s2d($('#inputMotherBirthday').val()));
        pupil.$mother_email = es($('#inputMotherEmail').val());
        pupil.$mother_phone = es($('#inputMotherCellPhone').val());
        pupil.$mother_work_place = es($('#inputMotherWorkplace').val());
        pupil.$mother_work_post = es($('#inputMotherPost').val());
        pupil.$mother_work_phone = es($('#inputMotherWorkPhone').val());
        pupil.$father_name_first = es($('#inputFatherFirstName').val());
        pupil.$father_name_middle = es($('#inputFatherMiddleName').val());
        pupil.$father_name_last = es($('#inputFatherLastName').val());
        pupil.$father_birthday = es(s2d($('#inputFatherBirthday').val()));
        pupil.$father_email = es($('#inputFatherEmail').val());
        pupil.$father_phone = es($('#inputFatherCellPhone').val());
        pupil.$father_work_place = es($('#inputFatherWorkplace').val());
        pupil.$father_work_post = es($('#inputFatherPost').val());
        pupil.$father_work_phone = es($('#inputFatherWorkPhone').val());
        return pupil;
    }

    function clearEditPanel(){
        $("#pupils-edit-form")[0].reset();
}
    function hideEditPanel(isNeedRefreshTable) {
        clearEditPanel();
        $("#pupils-form-modal").modal('hide');
        // Clear the form inputs
        /*$("#pupils-edit-panel").addClass("hidden");
        $("#pupils-detail").removeClass("hidden");
        $("#table-cover").addClass("hidden");*/
        if (isNeedRefreshTable)
            $('#pupils-table').bootstrapTable('refresh');

    }

    // action: 'a' - добавить, 'u'-исправить
    function showEditPanel(action) {
        var ab = $("#pupil-add-do-button");
        var ub = $("#pupil-upd-do-button");
        var db = $("#pupil-del-do-button");
        var ttl = $("#pupils-form-modal-title");
        ab.addClass("hidden");
        ub.addClass("hidden");
        db.addClass("hidden");
        if (action === "a") {
            ab.removeClass("hidden");
            ttl.text("Добавление ученика");
        }
        if (action === "u") {
            ub.removeClass("hidden");
            db.removeClass("hidden");
            ttl.text("Исправление ученика");
        }

        $("#pupils-form-modal").modal('show');


        /*$("#pupils-edit-panel").removeClass("hidden");
        $("#pupils-detail").addClass("hidden");
        $("#table-cover").removeClass("hidden");*/


    }

    function finishEdit(response) {
            hideEditPanel(true);
            getPupilInfo(response.pupilId);
    }

// Your jQuery code here, using the $
});