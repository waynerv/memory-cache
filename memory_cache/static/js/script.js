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

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader('X-CSRFToken', csrf_token);
        }
    }
});

$(document).ajaxError(function (event, request, settings) {
    var message = null;
    if (request.responseJSON && request.responseJSON.hasOwnProperty('message')) {
        message = request.responseJSON.message
    } else if (request.responseText) {
        var IS_JSON = true;
        try {
            var data = JSON.parse(request.responseText); // 作为JSON解析
        }
        catch(err) {
            IS_JSON = false
        }

        if (IS_JSON && data != undefined && data.hasOwnProperty('message')) {
            message = JSON.parse(request.responseText).message;
        } else {
            message = default_error_message; // 使用默认错误消息
        }
    } else {
        message = default_error_message; // 使用默认错误消息
    }
    toast(message, 'error'); // 弹出提示消息
});

var flash =null;
function toast(body, category) {
    clearTimeout(flash);
    var $toast = $('#toast');
    if (category === 'error') {
        $toast.css('background-color', 'red') // 错误类型消息
    } else {
        $toast.css('background-color', '#333') // 普通类型消息
    }
    $toast.text(body).fadeIn();
    flash = setTimeout(function () {
        $toast.fadeOut();
    }, 3000)
}

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

function follow(e) {
    var $el = $(e.target);
    var id = $el.data('id');

    $.ajax({
        type: 'POST',
        url: $el.data('href'),
        success: function (data) {
            $el.prev().show();
            $el.hide();
            update_followers_count(id);
            toast(data.message);
        }
    });
}

function unfollow(e) {
    var $el = $(e.target);
    var id = $el.data('id');

    $.ajax({
        type: 'POST',
        url: $el.data('href'),
        success: function (data) {
            $el.next().show();
            $el.hide();
            update_followers_count(id);
            toast(data.message);
        }
    });
}

$(document).on('click', '.follow-btn', follow.bind(this));
$(document).on('click', '.unfollow-btn', unfollow.bind(this));

function update_followers_count(id) {
    var $el = $('#followers-count-' + id)
    $.ajax({
        type: 'GET',
        url: $el.data('href'),
        success: function (data) {
            $el.text(data.count); // 根据返回的JSON数据更新数字，注意对象的读取方式
        }
    })
}

function update_notifications_count() {
    var $el = $('#notification-badge');
    $.ajax({
        type: 'GET',
        url: $el.data('href'),
        success: function (data) {
            if (data.count === 0) {
                $el.hide();
            } else {
                $el.show();
                $el.text(data.count)
            }
        }
    });
}

if (is_authenticated) { setInterval(update_notifications_count, 30000)}

