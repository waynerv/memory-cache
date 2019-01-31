from flask import Blueprint, request, current_app, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from memory_cache.decorators import confirm_required, permission_required
from memory_cache.models import User, Photo, Collect, Follow
from memory_cache.utils import redirect_back

user_bp = Blueprint('user', __name__)


@user_bp.route('/<username>')
def index(username):
    user = User.query.filter(User.username == username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_PHOTO_PER_PAGE']
    pagination = Photo.query.with_parent(user).order_by(Photo.timestamp.desc()).paginate(page, per_page)
    photos = pagination.items
    return render_template('user/index.html', user=user, pagination=pagination, photos=photos)


@user_bp.route('/<username>/collections')
def show_collections(username):
    user = User.query.filter(User.username == username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_PHOTO_PER_PAGE']
    pagination = Collect.query.with_parent(user).order_by(Collect.timestamp.desc()).paginate(page, per_page)
    collects = pagination.items
    return render_template('user/collections.html', user=user, pagination=pagination, collects=collects)


@user_bp.route('/follow/<username>', methods=['POST'])
@login_required
@confirm_required
@permission_required('FOLLOW')
def follow(username):
    user = User.query.filter_by(username=username).first_or_404()
    if current_user.is_following(user):
        flash('Already followed.', 'info')
        return redirect_back()

    current_user.follow(user)
    flash('User followed.', 'success')
    return redirect_back()


@user_bp.route('/unfollow/<username>', methods=['POST'])
@login_required
@confirm_required
@permission_required('FOLLOW')
def unfollow(username):
    user = User.query.filter_by(username=username).first_or_404()
    if not current_user.is_following(user):
        flash('Not follow yet.', 'info')
        return redirect_back()

    current_user.unfollow(user)
    flash('User unfollowed.', 'success')
    return redirect_back()


@user_bp.route('/<username>/followers')
def show_followers(username):
    user = User.query.filter(User.username == username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_USER_PER_PAGE']
    pagination = user.followers.order_by(Follow.timestamp.desc()).paginate(page, per_page)
    follows = pagination.items
    return render_template('user/followers.html', user=user, pagination=pagination, follows=follows)


@user_bp.route('/<username>/following')
def show_following(username):
    user = User.query.filter(User.username == username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_USER_PER_PAGE']
    pagination = user.following.order_by(Follow.timestamp.desc()).paginate(page, per_page)
    follows = pagination.items
    return render_template('user/following.html', user=user, pagination=pagination, follows=follows)
