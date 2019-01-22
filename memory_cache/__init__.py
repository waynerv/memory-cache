import os
from flask import Flask

from memory_cache.settings import config


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('memory_cache')
    app.config.from_object(config[config_name])

    return app


def register_blueprints(app):
    app.register_blueprint()


def register_extensions(app):
    pass
