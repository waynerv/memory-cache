from flask import url_for

from memory_cache.models import Notification
from memory_cache.extensions import db


def push_follow_notification(follower, receiver):
    user_index = url_for('user.index', username=follower.username)
    message = f'User <a href="{user_index}">{follower.username}</a> followed you.'
    notification = Notification(message=message, receiver=receiver)
    db.session.add(notification)
    db.session.commit()


def push_comment_notification(photo_id, receiver, page=1):
    photo_page = url_for('main.show_photo', photi_id=photo_id, page=page)
    message = f'<a href="{photo_page}">This photo</a> has new comment/reply.'
    notification = Notification(message=message, receiver=receiver)
    db.session.add(notification)
    db.session.commit()


def push_collect_notification(collector, photo_id, receiver):
    user_index = url_for('user.index', username=collector.username)
    photo_page = url_for('main.show_photo', photo_id=photo_id)
    message = f'User <a href="{user_index}">{collector.username}</a> collected your <a href="{photo_page}">photo</a>.'
    notification = Notification(message=message, receiver=receiver)
    db.session.add(notification)
    db.session.commit()
