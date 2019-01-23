import os
from flask import Flask

from memory_cache.settings import config

from memory_cache.extensions import db


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('memory_cache')
    app.config.from_object(config[config_name])

    @app.route('/')
    def hello():
        return 'Hello, World!'

    register_extensions(app)

    return app


def register_blueprints(app):
    app.register_blueprint()


def register_extensions(app):
    db.init_app(app)


def register_error_handler(app):
    pass


def register_template_context(app):
    pass
