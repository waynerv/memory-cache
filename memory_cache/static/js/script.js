$('#confirm-delete').on('show.bs.modal', function (e) {
    $('.delete-form').attr('action', $(e.relatedTarget).data('href'));
});
$('#description-btn').click(function () {
    $('#description').hide();
    $('#description-form').show();
});
$('#cancel-description').click(function () {
    $('#description-form').hide();
    $('#description').show();
});
$('#tag-btn').click(function () {
    $('#tags').hide();
    $('#tag-form').show();
});
$('#cancel-tag').click(function () {
    $('#tag-form').hide();
    $('#tags').show();
});
$(function () {
    function render_time() {
        return moment($(this).data('timestamp')).format('lll')
    }
    $('[data-toggle="tooltip"]').tooltip(
        {title: render_time}
    );
});
var hover_timer = null;
function show_profile_popover(e) {
    var $el = $(e.target);

    hover_timer = setTimeout(function () {
        hover_timer = null;
        $.ajax({
            type: 'GET',
            url: $el.data('href'),
            success: function (data) {
                $el.popover({
                    html: true,
                    content: data,
                    trigger: 'manual',
                    animation: false
                }); // 弹窗初始化方法
                $el.popover('show');
                $('.popover').on('mouseleave', function () {
                    setTimeout(function () {
                        $el.popover('hide');
                    }, 200)
                });
            },
            error: function (error) {
                toast('Server error, please try again later.');
            }
        });
    }, 500)
}
function hide_profile_popover(e) {
    var $el = $(e.target);

    if (hover_timer) {
        clearTimeout(hover_timer);
        hover_timer = null;
    } else {
        setTimeout(function () {
            if (!$('.popover:hover').length) {
                $el.popover('hide');
            }
        }, 200);
    }
}
$('.profile-popover').hover(show_profile_popover.bind(this), hide_profile_popover.bind(this));
var flash =bull;
function toast(body) {
    clearTimeout(flash)
    var $toast = $('#toast');
    $toast.text(body).fadeIn();
    flash = setTimeout(function () {
        $toast.fadeOut();
    }, 3000)
}