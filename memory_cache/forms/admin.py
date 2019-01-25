from wtforms import StringField, BooleanField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Email, ValidationError

from memory_cache.forms.user import EditProfileForm
from memory_cache.models import Role, User


class EditProfileAdminForm(EditProfileForm):
    email = StringField('Email', validators=[DataRequired(), Length(1, 254), Email()])
    role = SelectField('Role', coerce=int)
    confirmed = BooleanField('Confirmed')
    active = BooleanField('Active')
    submit = SubmitField()

    def __init__(self, user, *args, **kwargs):
        super(EditProfileAdminForm, self).__init__(*args, **kwargs)
        self.role.choices = [(role.id, role.name) for role in Role.query.order_by(Role.name).all()]
        self.user = user

    def validate_email(self, field):
        if field.data != self.user.email and User.query.filter(User.email == field.data).first():
            raise ValidationError('The email already in user.')

    def validate_username(self, field):
        if field.data != self.user.username and User.query.filter(User.username == field.data).first():
            raise ValidationError('The email already in user.')
