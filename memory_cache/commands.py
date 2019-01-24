from memory_cache.extensions import db
import click


def register_command(app):
    @app.cli.command()
    @click.option('--drop', is_flag=True, help='Create after drop.')
    def initdb(drop):
        if drop:
            db.drop_all()
            click.echo('Database droped.')
        db.create_all()
        click.echo('Database initialized.')
