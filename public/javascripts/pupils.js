/**
 * Created by igorgo on 19.04.2016.
 */

jQuery(function ($) {

    var currentPupil;

    function clearPupilsiditFields() {
        $('#pupils-edit-panel fieldset input').val('');
        $('#inputGender').selectedIndex = 0;
    }

    function populateDetailPanel() {
        $("#pupils-detail dd").text("");
        if (currentPupil) {
            $("#pupil-upd-button").removeClass("hidden");
            $('#pupil-last-name').text(currentPupil.name.last);
            $('#pupil-first-name').text(currentPupil.name.first);
            $('#pupil-middle-name').text(currentPupil.name.middle);
            if (currentPupil.birthday) {
                var d = new Date(currentPupil.birthday);
                $('#pupil-birthday').text(d.ddmmyyyy());
            }
            $('#pupil-email').text(currentPupil.email);
            if (currentPupil.address) {
                $('#pupil-home-address').text(currentPupil.address.live);
                $('#pupil-reg-address').text(currentPupil.address.reg);
            }
            if (currentPupil.phone) {
                $('#pupil-cell-phone').text(currentPupil.phone.cell);
                $('#pupil-home-phone').text(currentPupil.phone.home);
            }
            if (currentPupil.mother) {
                if (currentPupil.mother.name) {
                    $('#mother-last-name').text(currentPupil.mother.name.last);
                    $('#mother-first-name').text(currentPupil.mother.name.first);
                    $('#mother-middle-name').text(currentPupil.mother.name.middle);
                }
                if (currentPupil.mother.birthday) {
                    d = new Date(currentPupil.mother.birthday);
                    $('#mother-birthday').text(d.ddmmyyyy());
                }
                $('#mother-cell-phone').text(currentPupil.mother.phone);
                $('#mother-email').text(currentPupil.mother.email);
                if (currentPupil.mother.work) {
                    $('#mother-work-place').text(currentPupil.mother.work.place);
                    $('#mother-work-post').text(currentPupil.mother.work.post);
                    $('#mother-work-phone').text(currentPupil.mother.work.phone);
                }
            }
            if (currentPupil.father) {
                if (currentPupil.father.name) {
                    $('#father-last-name').text(currentPupil.father.name.last);
                    $('#father-first-name').text(currentPupil.father.name.first);
                    $('#father-middle-name').text(currentPupil.father.name.middle);
                }
                if (currentPupil.father.birthday) {
                    d = new Date(currentPupil.father.birthday);
                    $('#father-birthday').text(d.ddmmyyyy());
                }
                $('#father-cell-phone').text(currentPupil.father.phone);
                $('#father-email').text(currentPupil.father.email);
                if (currentPupil.father.work) {
                    $('#father-work-place').text(currentPupil.father.work.place);
                    $('#father-work-post').text(currentPupil.father.work.post);
                    $('#father-work-phone').text(currentPupil.father.work.phone);
                }
            }
        } else {
            $("#pupil-upd-button").addClass("hidden");
        }
    }

    function populateEditForm() {
        if (currentPupil) {
            $('#inputLastName').val(currentPupil.name.last);
            $('#inputFirstName').val(currentPupil.name.first);
            $('#inputMiddleName').val(currentPupil.name.middle);
            $('#inputBirthday').val(currentPupil.birthday);
/*
            if (currentPupil.birthday) {
                var d = new Date(currentPupil.birthday);
                $('#inputBirthday').val(d.ddmmyyyy());
            }
*/
            /*$('#pupil-email').text(currentPupil.email);
            if (currentPupil.address) {
                $('#pupil-home-address').text(currentPupil.address.live);
                $('#pupil-reg-address').text(currentPupil.address.reg);
            }
            if (currentPupil.phone) {
                $('#pupil-cell-phone').text(currentPupil.phone.cell);
                $('#pupil-home-phone').text(currentPupil.phone.home);
            }
            if (currentPupil.mother) {
                if (currentPupil.mother.name) {
                    $('#mother-last-name').text(currentPupil.mother.name.last);
                    $('#mother-first-name').text(currentPupil.mother.name.first);
                    $('#mother-middle-name').text(currentPupil.mother.name.middle);
                }
                if (currentPupil.mother.birthday) {
                    d = new Date(currentPupil.mother.birthday);
                    $('#mother-birthday').text(d.ddmmyyyy());
                }
                $('#mother-cell-phone').text(currentPupil.mother.phone);
                $('#mother-email').text(currentPupil.mother.email);
                if (currentPupil.mother.work) {
                    $('#mother-work-place').text(currentPupil.mother.work.place);
                    $('#mother-work-post').text(currentPupil.mother.work.post);
                    $('#mother-work-phone').text(currentPupil.mother.work.phone);
                }
            }
            if (currentPupil.father) {
                if (currentPupil.father.name) {
                    $('#father-last-name').text(currentPupil.father.name.last);
                    $('#father-first-name').text(currentPupil.father.name.first);
                    $('#father-middle-name').text(currentPupil.father.name.middle);
                }
                if (currentPupil.father.birthday) {
                    d = new Date(currentPupil.father.birthday);
                    $('#father-birthday').text(d.ddmmyyyy());
                }
                $('#father-cell-phone').text(currentPupil.father.phone);
                $('#father-email').text(currentPupil.father.email);
                if (currentPupil.father.work) {
                    $('#father-work-place').text(currentPupil.father.work.place);
                    $('#father-work-post').text(currentPupil.father.work.post);
                    $('#father-work-phone').text(currentPupil.father.work.phone);
                }
            }*/
        }
    }

    function getPupilInfo(pupilRn) {
        $.getJSON('/pupils/pupilinfo/' + pupilRn, function (data) {
            currentPupil = data[0];
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

        var g = ['', 'M', 'F'];

        var pupil = new Object();
        pupil.name = new Object();
        pupil.name.first = firstName;
        pupil.name.middle = es($('#inputMiddleName').val());
        pupil.name.last = lastName;
        pupil.birthday = es($('#inputBirthday').val());
        pupil.gender = es(g[$('#inputGender')[0].selectedIndex]);
        pupil.email = es($('#inputEmail').val());
        pupil.address = new Object();
        pupil.address.live = es($('#inputLiveAddress').val());
        pupil.address.reg = es($('#inputRegAddress').val());
        pupil.phone = new Object();
        pupil.phone.home = es($('#inputHomePhone').val());
        pupil.phone.cell = es($('#inputCellPhone').val());
        pupil.studied = new Object();
        pupil.studied.from = es($('#inputStudyFrom').val());
        pupil.studied.till = es($('#inputStudyTill').val());
        pupil.mother = new Object();
        pupil.mother.name = new Object();
        pupil.mother.name.first = es($('#inputMotherFirstName').val());
        pupil.mother.name.middle = es($('#inputMotherMiddleName').val());
        pupil.mother.name.last = es($('#inputMotherLastName').val());
        pupil.mother.birthday = es($('#inputMotherBirthday').val());
        pupil.mother.email = es($('#inputMotherEmail').val());
        pupil.mother.phone = es($('#inputMotherCellPhone').val());
        pupil.mother.work = new Object();
        pupil.mother.work.place = es($('#inputMotherWorkplace').val());
        pupil.mother.work.post = es($('#inputMotherPost').val());
        pupil.mother.work.phone = es($('#inputMotherWorkPhone').val());
        pupil.father = new Object();
        pupil.father.name = new Object();
        pupil.father.name.first = es($('#inputFatherFirstName').val());
        pupil.father.name.middle = es($('#inputFatherMiddleName').val());
        pupil.father.name.last = es($('#inputFatherLastName').val());
        pupil.father.birthday = es($('#inputFatherBirthday').val());
        pupil.father.email = es($('#inputFatherEmail').val());
        pupil.father.phone = es($('#inputFatherCellPhone').val());
        pupil.father.work = new Object();
        pupil.father.work.place = es($('#inputFatherWorkplace').val());
        pupil.father.work.post = es($('#inputFatherPost').val());
        pupil.father.work.phone = es($('#inputFatherWorkPhone').val());

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
                    data: {json_string: JSON.stringify(pupil)},
                    url: '/pupils/addpupil',
                    dataType: 'JSON'
                }).done(finishEdit);
            }
        });

        $("#pupil-add-cancel-button").on("click", function () {
            $("#pupils-edit-panel").addClass("hidden");
            $("#pupils-detail").removeClass("hidden");
        });

        $('#pupils-table').on('check.bs.table', function (row, $element) {
            getPupilInfo($element.rn)
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