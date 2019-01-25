import os
from flask import Flask, render_template

from memory_cache.settings import config

from memory_cache.extensions import db, bootstrap, moment, login_manager
from memory_cache.commands import register_command


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('memory_cache')
    app.config.from_object(config[config_name])

    @app.route('/')
    def hello():
        return render_template('base.html')

    register_extensions(app)
    register_shell_context(app)
    register_command(app)

    return app


def register_blueprints(app):
    app.register_blueprint()


def register_extensions(app):
    db.init_app(app)
    bootstrap.init_app(app)
    moment.init_app(app)
    login_manager.init_app(app)


def register_error_handler(app):
    pass


def register_template_context(app):
    @app.context_processor
    def make_template_context():
        pass


def register_shell_context(app):
    @app.shell_context_processor
    def make_shell_context():
        return dict(db=db)