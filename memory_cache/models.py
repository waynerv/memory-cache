from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from memory_cache.extensions import db

tagging = db.Table('tagging',
                   db.Column('photo_id', db.Integer, db.ForeignKey('photo.id')),
                   db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'))
                   )


class Collect(db.Model):
    collector_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    collected_id = db.Column(db.Integer, db.ForeignKey('photo.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow())
    collector = db.relationship('User', back_populates='collections', lazy='joined')
    collected = db.relationship('Photo', back_populates='collectors', lazy='joined')


class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow())
    follower = db.relationship('User', foreign_keys=[follower_id], back_populates='following', lazy='joined')
    followed = db.relationship('User', foreign_keys=[followed_id], back_populates='followers', lazy='joined')


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    username = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(128))
    email = db.Column(db.String(254))
    website = db.Column(db.String(255))
    bio = db.Column(db.Text)
    location = db.Column(db.String(30))
    member_since = db.Column(db.DateTime, default=datetime.utcnow())
    confirmed = db.Column(db.Boolean)
    photos = db.relationship('Photo', back_populates='author', cascade='all, delete')
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete')
    collections = db.relationship('Collect', back_populates='collector', cascade='all')
    following = db.relationship('Follow', foreign_keys=[Follow.follower_id], back_populates='follower', lazy='dynamic',
                                cascade='all')
    followers = db.relationship('Follow', foreign_keys=[Follow.followed_id], back_populates='followed', lazy='dynamic',
                                cascade='all')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def validate_password(self, password):
        return check_password_hash(self.password_hash, password)


class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text)
    filename = db.Column(db.String(64))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow())
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship('User', back_populates='photos')
    comments = db.relationship('Comment', back_populates='photo', cascade='all, delete')
    tags = db.relationship('Tag', secondary='tag_table', back_populates='photos')
    collectors = db.relationship('Collect', back_populates='collected', cascade='all')


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow())
    photo_id = db.Column(db.Integer, db.ForeignKey('photo.id'))
    photo = db.relationship('Photo', back_populates='comments')


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    photos = db.relationship('Photo', secondary='tag_table', back_populates='tags')


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='notifications')


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))


class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
