from flask import Blueprint, request, current_app, render_template
from memory_cache.models import User, Photo, Collect

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