/**
 * Created by igorgo on 17.04.2016.
 */
jQuery(function($){
    // Your jQuery code here, using the $
    $(function() {
        $(".nav a").on("click", function(){
            $(".nav").find(".active").removeClass("active");
            $(this).parent().addClass("active");
            $(".page-container").addClass("hidden");
            $($(this).attr("target-c")).removeClass("hidden");
            //console.log($($(this).attr("target-c")));
            //console.log($(".page-container"));
        });
        $(".phone-mask").inputmask({"mask": "+38 (099) 999-9999"});
        $("#pupil-add-button").on("click", function(){
            $("#pupils-edit-panel").removeClass("hidden");
            $("#pupils-detail").addClass("hidden");
        });
        $("#pupil-add-do-button").on("click", function(){
            $("#pupils-edit-panel").addClass("hidden");
            $("#pupils-detail").removeClass("hidden");
        });
//        console.log($('a[target-c="#pupils-container"]'));
        $('a[target-c="#pupils-container"]').trigger( "click" );
    });
});