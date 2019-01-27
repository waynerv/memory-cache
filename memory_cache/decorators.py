import functools
from flask import redirect, url_for, Markup, flash, abort
from flask_login import current_user


def confirm_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        if not current_user.confirmed:
            message = Markup(
                'Please confirm your account first.'
                'Not receive the email?'
                '<a class="alert-link" href="%s">Resend Confirm Email</a>' % url_for('auth.resend_confirm_email')
            )
            flash(message, 'warning')
            return redirect(url_for('auth.login'))
        return view(*args, **kwargs)
    return wrapped_view


def permission_required(permission_name):
    def decorator(func):
        @functools.wraps(func)
        def wrapped_func(*args, **kwargs):
            if not current_user.can(permission_name):
                abort(403)
            return func(*args, **kwargs)
        return wrapped_func
    return decorator


def admin_required(func):
    return permission_required('ADMINISTER')(func)