import os

from flask import Flask
from flask_login import current_user

from memory_cache.blueprints.admin import admin_bp
from memory_cache.blueprints.ajax import ajax_bp
from memory_cache.blueprints.auth import auth_bp
from memory_cache.blueprints.main import main_bp
from memory_cache.blueprints.user import user_bp
from memory_cache.commands import register_command
from memory_cache.extensions import db, bootstrap, moment, login_manager, mail, dropzone, csrf, avatars, whooshee
from memory_cache.settings import config
from memory_cache.models import User, Notification


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('memory_cache')
    app.config.from_object(config[config_name])

    register_extensions(app)
    register_shell_context(app)
    register_command(app)
    register_blueprints(app)

    return app


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(ajax_bp, url_prefix='/ajax')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_bp, url_prefix='/admin')


def register_extensions(app):
    db.init_app(app)
    bootstrap.init_app(app)
    moment.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    dropzone.init_app(app)
    csrf.init_app(app)
    avatars.init_app(app)
    whooshee.init_app(app)


def register_error_handler(app):
    pass


def register_template_context(app):
    @app.context_processor
    def make_template_context():
        if current_user.is_authenticated:
            notification_count = Notification.query.with_parent(current_user).filter_by(is_read=False).count()
        else:
            notification_count = None
        return dict(notification_count=notification_count)

def register_shell_context(app):
    @app.shell_context_processor
    def make_shell_context():
        return dict(db=db, User=User)
