import os
import random
from datetime import datetime

from PIL import Image
from faker import Faker
from flask import current_app
from sqlalchemy.exc import IntegrityError

from memory_cache.extensions import db
from memory_cache.models import User, Photo, Tag, Comment

fake = Faker('zh-CN')


def fake_admin():
    user = User(
        name='Waynerv',
        username='ampedee',
        email='ampedee@163.com',
        website='shallwecode.top',
        bio=fake.sentence(),
        location='Chongqing',
        member_since=datetime.utcnow(),
        confirmed=True,
    )
    user.set_password('123456789')
    db.session.add(user)
    db.session.commit()


def fake_user(count=10):
    for i in range(count):
        user = User(
            name=fake.name(),
            username=fake.user_name(),
            email=fake.email(),
            website=fake.url(),
            bio=fake.sentence(),
            location=fake.city(),
            member_since=fake.date_this_year(),
            confirmed=True
        )
        user.set_password('123456')
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()


def fake_tag(count=20):
    for i in range(count):
        tag = Tag(name=fake.word())
        db.session.add(tag)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()


def fake_photo(count=50):
    # photo
    upload_path = current_app.config['APP_UPLOAD_PATH']
    for i in range(count):
        print(i)

        filename = f'random_{i}.jpg'
        img = Image.new(mode='RGB', size=(800, 800),
                        color=(random.randint(128, 255), random.randint(64, 255), random.randint(64, 196)))
        img.save(os.path.join(upload_path, filename))

        photo = Photo(
            description=fake.sentence(),
            filename=filename,
            filename_m=filename,
            filename_s=filename,
            author_id=random.randint(1, User.query.count()),
            timestamp=fake.date_this_year()
        )

        # tag
        for j in range(random.randint(1, 5)):
            tag = Tag.query.get(random.randint(1, Tag.query.count()))
            if tag not in photo.tags:
                photo.tags.append(tag)

        db.session.add(photo)
    db.session.commit()


def fake_comment(count=100):
    for i in range(count):
        comment = Comment(
            author_id=random.randint(1, User.query.count()),
            body=fake.sentence(),
            timestamp=fake.date_this_year(),
            photo_id=random.randint(1, Photo.query.count())
        )
        db.session.add(comment)
    db.session.commit()
