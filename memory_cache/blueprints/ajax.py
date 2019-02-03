from flask import Blueprint, render_template, jsonify
from flask_login import current_user

from memory_cache.models import User, Notification, Photo
from memory_cache.notifications import push_follow_notification, push_collect_notification

ajax_bp = Blueprint('ajax', __name__)


@ajax_bp.route('/profile/<int:user_id>')
def get_profile(user_id):
    user = User.query.get_or_404(user_id)
    return render_template('main/profile_popup.html', user=user)


@ajax_bp.route('/follow/<username>', methods=['POST'])
def follow(username):
    if not current_user.is_authenticated:  # 验证登录状态
        return jsonify(message='Login required.'), 403
    if not current_user.confirmed:  # 验证账号确认状态
        return jsonify(message='Confirmed account required.'), 400
    if not current_user.can('FOLLOW'):  # 验证账号关注权限状态
        return jsonify(message='No permission.'), 403

    user = User.query.filter_by(username=username).first_or_404()
    if current_user.is_following(user):
        return jsonify(message='Already followed.'), 400

    current_user.follow(user)
    if user.receive_follow_notification:
        push_follow_notification(follower=current_user, receiver=user)
    return jsonify(message='User followed')


@ajax_bp.route('/unfollow/<username>', methods=['POST'])
def unfollow(username):
    if not current_user.is_authenticated:  # 验证登录状态
        return jsonify(message='Login required.'), 403

    user = User.query.filter_by(username=username).first_or_404()
    if not current_user.is_following(user):
        return jsonify(message='Not follow yet.'), 400

    current_user.unfollow(user)
    return jsonify(message='Follow canceled.')


@ajax_bp.route('/followers-count/<int:user_id>')
def followers_count(user_id):
    user = User.query.get_or_404(user_id)
    count = user.followers.count() - 1  # 减去自己
    return jsonify(count=count)


@ajax_bp.route('/notifications-count')
def notifications_count():
    if not current_user.is_authenticated:
        return jsonify(message='Login required.'), 403

    count = Notification.query.with_parent(current_user).filter_by(is_read=False).count()  # 减去自己
    return jsonify(count=count)


@ajax_bp.route('/collect/<int:photo_id>', methods=['POST'])
def collect(photo_id):
    if not current_user.is_authenticated:  # 验证登录状态
        return jsonify(message='Login required.'), 403
    if not current_user.confirmed:  # 验证账号确认状态
        return jsonify(message='Confirmed account required.'), 400
    if not current_user.can('COLLECT'):  # 验证账号关注权限状态
        return jsonify(message='No permission.'), 403

    photo = Photo.query.get_or_404(photo_id)
    if current_user.is_collecting(photo):
        return jsonify(message='Already collected.'), 400

    current_user.collect(photo)
    if photo.author.receive_collect_notification:
        push_collect_notification(collector=current_user, photo_id=photo_id, receiver=photo.author)
    return jsonify(message='User collected')


@ajax_bp.route('/uncollect/<int:photo_id>', methods=['POST'])
def uncollect(photo_id):
    if not current_user.is_authenticated:  # 验证登录状态
        return jsonify(message='Login required.'), 403

    photo = Photo.query.get_or_404(photo_id)
    if not current_user.is_collecting(photo):
        return jsonify(message='Not collect yet.'), 400

    current_user.uncollect(photo)
    return jsonify(message='Collect canceled.')


@ajax_bp.route('/collecters-count/<int:photo_id>')
def collectors_count(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    count = photo.collectors.count()
    return jsonify(count=count)