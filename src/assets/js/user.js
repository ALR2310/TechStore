
// Sự kiện đặt class cho profile menu
$(document).ready(function () {
    $('.profile-menu-left').on('click', function (event) {
        const href = $(this).attr('href');

        if (href !== '/auth/logout') {
            event.preventDefault();
            var target = $(this).attr('href');

            $('.tab-pane').removeClass('show active');
            $(target).addClass('show active');

            $('.profile-menu-left').removeClass('active');
            $(this).addClass('active');

            if (history.pushState) history.pushState(null, null, target);
            else location.hash = target;
        }
    });

    var hash = window.location.hash || '#profile';
    $('.profile-menu-left[href="' + hash + '"]').trigger('click');
});
