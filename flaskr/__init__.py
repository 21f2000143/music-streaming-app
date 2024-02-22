import os

from flask import Flask
from jobs import workers
from flask_sse import sse
from flask_caching import Cache
import time
from flask import (
    request, jsonify
)
from werkzeug.exceptions import abort

from flaskr.db import get_db

app, celery, cache= None, None, None
def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
        CACHE_TYPE="RedisCache",
        CACHE_REDIS_HOST="localhost",
        CACHE_REDIS_PORT=6379,
        BROKER_CONNECTION_RETRY_ON_STARTUP = True,
        CELERY_BROKER_URL = "redis://localhost:6379/1",
        CELERY_RESULT_BACKEND = "redis://localhost:6379/2",
        CELERY_TIMEZONE="Asia/Kolkata",
        REDIS_URL = "redis://localhost:6379",
        GMAIL_CREDS_FILE='GamilApi/appdev2-391904-167712a96be2.json',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    from . import db
    db.init_app(app)

    celery = workers.celery
    
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone = app.config["CELERY_TIMEZONE"],
        broker_connection_retry_on_startup=app.config["BROKER_CONNECTION_RETRY_ON_STARTUP"]
    )
    celery.conf.timezone = 'Asia/Kolkata' 


    celery.Task = workers.ContextTask
    app.app_context().push()


    cache=Cache(app)

    app.app_context().push()
    
    from . import auth
    app.register_blueprint(auth.bp)

    from . import song
    app.register_blueprint(song.bp)
    app.add_url_rule('/', endpoint='index')

    from . import album
    app.register_blueprint(album.bp)

    from . import playlist
    app.register_blueprint(playlist.bp)

    from . import admin
    app.register_blueprint(admin.bp)
    
    return app, celery, cache
app, celery, cache = create_app()
@cache.cached(timeout=50, key_prefix="get_all_songs")
def get_all_songs():
    db = get_db()
    songs = db.execute(
    'SELECT title, song_id, created, username, creator_id'
    ' FROM Song'
    ' ORDER BY created DESC'
        ).fetchall()
    songs = [
        {
            'title': song['title'],
            'song_id': song['song_id'],
            'created': song['created'],
            'username': song['username'],
            'creator_id': song['creator_id'],
        }
        for song in songs
    ]
    return songs

@app.route('/api/songs')
def get_songs():
    search_word=request.args.get('search') 
    songs=None
    if search_word:
        db = get_db()
        songs = db.execute(
            "SELECT DISTINCT s.title, s.song_id, s.created, s.username, s.creator_id"
            " FROM Song s"
            " LEFT JOIN Album a ON s.album_id = a.album_id"
            " LEFT JOIN Like l ON s.song_id = l.song_id"
            " WHERE s.title LIKE :search_word"
            " OR s.username LIKE :search_word"
            " OR s.lyrics LIKE :search_word"
            " OR a.genre LIKE :search_word"
            " OR l.rate LIKE :search_word",
            {"search_word": f"%{search_word}%"}
        ).fetchall()
    else:
        db = get_db()
        print(time.perf_counter_ns(), "before")
        songs = get_all_songs()
        print(time.perf_counter_ns(), "after")
    songs = [
        {
            'title': song['title'],
            'song_id': song['song_id'],
            'created': song['created'],
            'username': song['username'],
            'creator_id': song['creator_id'],
        }
        for song in songs
    ]
    return jsonify(songs), 200
app.register_blueprint(sse, url_prefix='/stream')