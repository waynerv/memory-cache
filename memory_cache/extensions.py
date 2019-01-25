from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap
from flask_moment import Moment
from flask_login import LoginManager

db = SQLAlchemy()
bootstrap = Bootstrap()
moment = Moment()
login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id):
    from memory_cache.models import User
    user = User.query.get(int(user_id))
    return user