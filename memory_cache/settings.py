import os

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class BaseConfig(object):
    SECRET_KEY = os.getenv('SECRET_KEY', 'dfjeoiuoesxzmmcz')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    APP_UPLOAD_PATH = os.path.join(basedir, 'uploads')


class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


class TestingConfig(BaseConfig):
    pass


class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


config = {
    'development': DevelopmentConfig,
    'test': TestingConfig,
    'production': ProductionConfig
}
