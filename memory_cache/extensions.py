from flask_bootstrap import Bootstrap
from flask_login import LoginManager, AnonymousUserMixin
from flask_mail import Mail
from flask_moment import Moment
from flask_sqlalchemy import SQLAlchemy
from flask_dropzone import Dropzone
from flask_wtf.csrf import CSRFProtect
from flask_avatars import Avatars

db = SQLAlchemy()
bootstrap = Bootstrap()
moment = Moment()
login_manager = LoginManager()
mail = Mail()
dropzone = Dropzone()
csrf = CSRFProtect()
avatars = Avatars()


@login_manager.user_loader
def load_user(user_id):
    from memory_cache.models import User
    user = User.query.get(int(user_id))
    return user


class Guest(AnonymousUserMixin):
    @property
    def is_admin(self):
        return False

    def can(self, permission_name):
        return False


login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to continue.'
login_manager.login_message_category = 'warning'
login_manager.anonymous_user = Guest
