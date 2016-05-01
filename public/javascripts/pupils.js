/**
 * Created by igorgo on 19.04.2016.
 */

jQuery(function ($) {

    var genders = ['', 'M', 'F'];
    var currentPupil;
    var needUpdate;

    function clearPupilsiditFields() {
        $('#pupils-edit-panel fieldset input').val('');
        $('#inputGender').selectedIndex = 0;
    }

    function populateDetailPanel() {
        $("#pupils-detail dd").text("");
        if (currentPupil) {
            $("#pupil-upd-button").removeClass("hidden");
            $('#pupil-last-name').text(currentPupil.name_last);
            $('#pupil-first-name').text(currentPupil.name_first);
            $('#pupil-middle-name').text(currentPupil.name_middle);
            $('#pupil-birthday').text(d2s(currentPupil.birthday));
            $('#pupil-email').text(currentPupil.email);
            $('#pupil-home-address').text(currentPupil.address_live);
            $('#pupil-reg-address').text(currentPupil.address_reg);
            $('#pupil-cell-phone').text(currentPupil.phone_cell);
            $('#pupil-home-phone').text(currentPupil.phone_home);
            $('#mother-last-name').text(currentPupil.mother_name_last);
            $('#mother-first-name').text(currentPupil.mother_name_first);
            $('#mother-middle-name').text(currentPupil.mother_name_middle);
            $('#mother-birthday').text(d2s(currentPupil.mother_birthday));
            $('#mother-cell-phone').text(currentPupil.mother_phone);
            $('#mother-email').text(currentPupil.mother_email);
            $('#mother-work-place').text(currentPupil.mother_work_place);
            $('#mother-work-post').text(currentPupil.mother_work_post);
            $('#mother-work-phone').text(currentPupil.mother_work_phone);
            $('#father-last-name').text(currentPupil.father_name_last);
            $('#father-first-name').text(currentPupil.father_name_first);
            $('#father-middle-name').text(currentPupil.father_name_middle);
            $('#father-birthday').text(d2s(currentPupil.father_birthday));
            $('#father-cell-phone').text(currentPupil.father_phone);
            $('#father-email').text(currentPupil.father_email);
            $('#father-work-place').text(currentPupil.father_work_place);
            $('#father-work-post').text(currentPupil.father_work_post);
            $('#father-work-phone').text(currentPupil.father_work_phone);
        } else {
            $("#pupil-upd-button").addClass("hidden");
        }
    }

    function populateEditForm() {
        if (currentPupil) {
            $('#inputLastName').val(currentPupil.name_last);
            $('#inputFirstName').val(currentPupil.name_first);
            $('#inputMiddleName').val(currentPupil.name_middle);
            $('#inputBirthday').val(currentPupil.birthday);
            $('#inputGender')[0].selectedIndex = genders.indexOf(currentPupil.gender);
            $('#inputEmail').val(currentPupil.email);
            $('#inputLiveAddress').val(currentPupil.address_live);
            $('#inputRegAddress').val(currentPupil.address_reg);
            $('#inputCellPhone').val(currentPupil.phone_cell);
            $('#inputHomePhone').val(currentPupil.phone_home);
            $('#inputStudyFrom').val(currentPupil.studied_from);
            $('#inputStudyTill').val(currentPupil.studied_till);
            $('#inputMotherLastName').val(currentPupil.mother_name_last);
            $('#inputMotherFirstName').val(currentPupil.mother_name_first);
            $('#inputMotherMiddleName').val(currentPupil.mother_name_middle);
            $('#inputMotherBirthday').val(currentPupil.mother_birthday);
            $('#inputMotherCellPhone').val(currentPupil.mother_phone);
            $('#inputMotherEmail').val(currentPupil.mother_email);
            $('#inputMotherWorkplace').val(currentPupil.mother_work_place);
            $('#inputMotherPost').val(currentPupil.mother_work_post);
            $('#inputMotherWorkPhone').val(currentPupil.mother_work_phone);
            $('#inputFatherLastName').val(currentPupil.father_name_last);
            $('#inputFatherFirstName').val(currentPupil.father_name_first);
            $('#inputFatherMiddleName').val(currentPupil.father_name_middle);
            $('#inputFatherBirthday').val(currentPupil.father_birthday);
            $('#inputFatherCellPhone').val(currentPupil.father_phone);
            $('#inputFatherEmail').val(currentPupil.father_email);
            $('#inputFatherWorkplace').val(currentPupil.father_work_place);
            $('#inputFatherPost').val(currentPupil.father_work_post);
            $('#inputFatherWorkPhone').val(currentPupil.father_work_phone);
        }
    }

    function getPupilInfo(pupilRn) {
        $.getJSON('/pupils/pupilinfo/' + pupilRn, function (data) {
            currentPupil = data;
            populateDetailPanel();
        });
    }

    function validatePupil() {
        var lastName = $('#inputLastName').val();
        var firstName = $('#inputFirstName').val();

        if ((lastName === '') || (firstName === '')) {
            alert('Необходимо указать фамилию и имя ученика');
            return false;
        }
        if ($('#inputGender')[0].selectedIndex === 0) {
            alert('Необходимо указать пол ученика');
            return false;
        }
        if ($('#inputStudyFrom').val() === '') {
            alert('Необходимо указать начало обучения ученика');
            return false;
        }
        return true;
    }


    function assemblePupil() {
        var lastName = $('#inputLastName').val();
        var firstName = $('#inputFirstName').val();

        function es(s) {
            if (s) {
                return s;
            } else {
                return;
            }
        }

        var pupil = new Object();
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

    function hideEditPanel() {
        // Clear the form inputs
        $("#pupils-edit-form")[0].reset();
        $('#pupils-table').bootstrapTable('refresh');
        $("#pupils-edit-panel").addClass("hidden");
        $("#pupils-detail").removeClass("hidden");
    }

    // action: 'a' - добавить, 'u'-исправить
    function showEditPanel(action) {
        $("#pupils-edit-panel").removeClass("hidden");
        $("#pupils-detail").addClass("hidden");
        var ab = $("#pupil-add-do-button");
        var ub = $("#pupil-upd-do-button");
        ab.addClass("hidden");
        ub.addClass("hidden");
        if (action === "a") ab.removeClass("hidden");
        if (action === "u") ub.removeClass("hidden");
    }

    function finishEdit(response) {
        var msg = response;
        if (msg.status === 'success') {
            hideEditPanel();
            getPupilInfo(msg.rn);
        }
        else {
            alert('Error:' + msg.error);
        }
    }

// Your jQuery code here, using the $
    $(function () {
        $("#pupil-add-button").on("click", function (event) {
            event.preventDefault();
            showEditPanel("a");
        });

        $("#pupil-upd-button").on("click", function (event) {
            event.preventDefault();
            showEditPanel("u");
            populateEditForm();
        });

        $("#pupil-add-do-button").on("click", function (event) {
            event.preventDefault();

            if (validatePupil()) {
                var pupil = assemblePupil();
                // Ajax to post the object to our adduser service
                $.ajax({
                    type: 'POST',
                    //data: pupil,
                    data: {json_string: JSON.stringify(pupil)},
                    url: '/pupils/addpupil',
                    dataType: 'JSON'
                }).done(finishEdit);
            }
        });


        $("#pupil-upd-do-button").on("click", function (event) {
            event.preventDefault();

            if (validatePupil()) {
                var pupil = assemblePupil();
                pupil.$rn = currentPupil.rowid;
                // Ajax to post the object to our adduser service
                $.ajax({
                    type: 'POST',
                    //data: pupil,
                    data: {json_string: JSON.stringify(pupil)},
                    url: '/pupils/updpupil',
                    dataType: 'JSON'
                }).done(finishEdit);
            }
        });

        $("#pupil-add-cancel-button").on("click", function () {
            $("#pupils-edit-panel").addClass("hidden");
            $("#pupils-detail").removeClass("hidden");
        });

        $('#pupils-table').on('check.bs.table', function (row, $element) {
            getPupilInfo($element.rn);
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
})
;