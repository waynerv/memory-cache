import os

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class BaseConfig(object):
    SECRET_KEY = os.getenv('SECRET_KEY', 'dfjeoiuoesxzmmcz')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 3 * 1024 * 1024

    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_DEFAULT_SENDER = ('MemoryCache Admin', 'noreply@shallwecode.top')

    APP_UPLOAD_PATH = os.path.join(basedir, 'uploads')
    APP_MAIL_SUBJECT_PREFIX = '[MemoryCache]'
    APP_ADMIN_EMAIL = 'ampedee@163.com'
    APP_PHOTO_SIZE = {'small': 400, 'medium': 800}
    APP_PHOTO_SUFFIX = {
        APP_PHOTO_SIZE['small']: '_s',
        APP_PHOTO_SIZE['medium']: '_m',
    }
    APP_PHOTO_PER_PAGE = 12

    DROPZONE_MAX_FILE_SIZE = 3
    DROPZONE_MAX_FILES = 30
    DROPZONE_ALLOWED_FILE_TYPE = 'image'
    DROPZONE_ENABLE_CSRF = True

    AVATARS_SAVE_PATH = os.path.join(APP_UPLOAD_PATH, 'avatars')
    AVATARS_SIZE_TUPLE = (30, 100, 200)


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


class Operations:
    CONFIRM = 'confirm'
    RESET_PASSWORD = 'reset-password'
    CHANGE_EMAIL = 'change-email'
