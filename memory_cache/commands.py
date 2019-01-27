import click

from memory_cache.extensions import db
from memory_cache.models import Role


def register_command(app):
    @app.cli.command()
    @click.option('--user', default=10, help='Quantity of users, default is 10')
    @click.option('--photo', default=50, help='Quantity of photos, default is 50')
    @click.option('--tag', default=20, help='Quantity of tags, default is 20')
    @click.option('--comment', default=100, help='Quantity of comments, default is 100')
    def forge(user, photo, tag, comment):
        '''Forge data'''
        from memory_cache.fakes import fake_admin, fake_comment, fake_photo, fake_user, fake_tag

        db.drop_all()
        db.create_all()

        click.echo('Initializing the roles and permissions...')
        Role.init_role()

        click.echo('Generating the administrator...')
        fake_admin()

        click.echo(f'Generating {user} users...')
        fake_user(user)

        click.echo(f'Generating {tag} tags...')
        fake_tag(tag)

        click.echo(f'Generating {photo} photos...')
        fake_photo(photo)

        click.echo(f'Generating {comment} comments...')
        fake_comment(comment)

        click.echo('Done.')

    @app.cli.command()
    @click.option('--drop', is_flag=True, help='Create after drop.')
    def initdb(drop):
        '''Initialized database.'''
        if drop:
            click.confirm('Are you sure to drop the database?', abort=True)
            db.drop_all()
            click.echo('Database droped.')
        db.create_all()
        click.echo('Database initialized.')

    @app.cli.command()
    def init():
        '''Initialized MemoryCache'''
        click.echo('Initializing the roles and permissions...')
        Role.init_role()
        click.echo('Done')

