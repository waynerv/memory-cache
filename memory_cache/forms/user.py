from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, TextAreaField, BooleanField, SubmitField, HiddenField, PasswordField
from wtforms.validators import DataRequired, Length, Regexp, Optional, URL, EqualTo, ValidationError, Email
from flask_login import current_user

from memory_cache.models import User


class EditProfileForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(1, 30)])
    username = StringField('Username', validators=[DataRequired(), Length(1, 20),
                                                   Regexp('^[a-zA-Z0-9]*$',
                                                          message='The username should contain only a-z, A-Z, 0-9.')])
    website = StringField('Website', validators=[Optional(), URL(), Length(0, 255)])
    bio = TextAreaField('Bio', validators=[Optional(), Length(0, 120)])
    location = StringField('Location', validators=[Optional(), Length(0, 30)])
    submit = SubmitField()

    def validate_username(self, field):
        if field.data != current_user.username and User.query.filter(User.username == field.data).first():
            raise ValidationError('The username is already in use.')


class UploadAvatarForm(FlaskForm):
    image = FileField('Upload', validators=[
        FileRequired(), FileAllowed(['jpg', 'png'], message='The file format should be .jpg or.png.')
    ])
    submit = SubmitField()


class CropAvatarForm(FlaskForm):
    x = HiddenField()
    y = HiddenField()
    w = HiddenField()
    h = HiddenField()
    submit = SubmitField('Crop and Update')


class NotificationSettingForm(FlaskForm):
    receive_comment_notification = BooleanField('New comment')
    receive_follow_notification = BooleanField('New Follower')
    receive_collect_notification = BooleanField('New Collector')
    submit = SubmitField()


class ChangePasswordForm(FlaskForm):
    old_password = PasswordField('Old password', validators=[DataRequired(), Length(6, 128)])
    password = PasswordField('New password', validators=[DataRequired(), Length(6, 128), EqualTo('password2')])
    password2 = PasswordField('Confirm password', validators=[DataRequired()])
    submit = SubmitField()


class ChangeEmailForm(FlaskForm):
    email = StringField('New email', validators=[DataRequired(), Length(1, 254), Email()])
    submit = SubmitField()


class DeleteAccountForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(1, 20)])
    submit = SubmitField()

    def validate_username(self, field):
        if field.data != current_user.username:
            raise ValidationError('Wrong username.')
