import os
from PIL import Image
from urllib.parse import urlparse, urljoin

from flask import request, redirect, url_for, current_app, flash
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from itsdangerous import BadTimeSignature, SignatureExpired
from memory_cache.settings import Operations
from memory_cache.extensions import db


def redirect_back(default='main.index', **kwargs):
    for target in request.args.get('next'), request.referrer:
        if not target:
            continue
        elif is_safe_url(target):
            return redirect(target)
    return redirect(url_for(default, **kwargs))


def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


def generate_token(user, operation, expire_in=None, **kwargs):
    s = Serializer(current_app.config['SECRET_KEY'], expire_in)
    data = {'id': user.id, 'operation': operation}
    data.update(**kwargs)
    return s.dumps(data)


def validate_token(user, token, operation, new_password=None):
    s = Serializer(current_app.config['SECRET_KEY'])

    try:
        data = s.loads(token)
    except (BadTimeSignature, SignatureExpired):
        return False

    if operation != data.get('operation') or user.id != data.get('id'):
        return False

    if operation == Operations.CONFIRM:
        user.confirmed = True
    elif operation == Operations.RESET_PASSWORD:
        user.set_password(new_password)
    elif operation == Operations.CHANGE_EMAIL:
        user.email = data.get('new_email')
    else:
        return False

    db.session.commit()
    return True


def resize_image(image, filename, base_width):
    filename, ext = os.path.splitext(filename)
    img = Image.open(image)
    if img.size[0] <= base_width:
        return filename + ext
    w_percent = base_width / float(img.size[0])
    h_size = int(float(img.size[1]) * w_percent)
    img = img.resize((base_width, h_size), Image.ANTIALIAS)

    filename += current_app.config['APP_PHOTO_SUFFIX'][base_width] + ext
    img.save(os.path.join(current_app.config['APP_UPLOAD_PATH'], filename), optimize=True, quality=85)
    return filename


def flash_errors(form):
    # form.errors以字典形式保存表单的字段以及字段对应的错误信息（均为字符串）
    for field, errors in form.errors.items():
        for error in errors:
            flash("Error in the %s field - %s" % (getattr(form, field).label.text, error))
