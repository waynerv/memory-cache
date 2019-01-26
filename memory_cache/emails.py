from threading import Thread

from flask import current_app, render_template
from flask_mail import Message

from memory_cache.extensions import mail


def _send_async_mail(message, app):
    with app.app_context():
        mail.send(message)


def send_mail(subject, to, template, **kwargs):
    message = Message(subject=current_app.config['APP_MAIL_SUBJECT_PREFIX'] + subject, recipients=[to])
    message.body = render_template(template + '.txt', **kwargs)
    message.html = render_template(template + '.html', **kwargs)
    app = current_app._get_current_object()
    thr = Thread(target=_send_async_mail, args=(message, app))
    thr.start()
    return thr


def send_confirm_email(user, token, to=None):
    send_mail(subject='Email Confirm', to=to or user.email, template='emails/confirm', user=user, token=token)
