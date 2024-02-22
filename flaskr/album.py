
from flask import (
    Blueprint, flash, g, redirect, render_template, jsonify, request, url_for, make_response
)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db

bp = Blueprint('album', __name__)

# helpful functions
def get_album(id):
    album = get_db().execute(
        'SELECT album_id, title, genre, creator_id'
        ' FROM Album'
        ' WHERE album_id = ?',
        (id,)
    ).fetchone()

    if album is None:
        abort(404, f"Album id {id} doesn't exist.")
    # if check_author and album['creator_id'] != g.creator['id']:
    #     abort(403)
    return album

# showing all the ablums available
@bp.route('/api/album')
def index_album():
    search_word = request.args.get('search')
    albums = None

    if search_word:
        db = get_db()
        albums = db.execute(
            "SELECT title, album_id, created, username, creator_id"
            " FROM Album p JOIN creator u ON p.creator_id = u.id"
            " WHERE p.title LIKE :search_word"
            " OR u.username LIKE :search_word",
            {"search_word": f"%{search_word}%"}
        ).fetchall()
    else:
        db = get_db()
        albums = db.execute(
            'SELECT title, album_id, created, username, creator_id'
            ' FROM Album p JOIN creator u ON p.creator_id = u.id'
            ' ORDER BY created DESC'
        ).fetchall()

    # Convert Row objects to a dictionary
    albums_data = [
        {
            'title': album['title'],
            'album_id': album['album_id'],
            'created': album['created'],
            'username': album['username'],
            'creator_id': album['creator_id'],
        }
        for album in albums
    ]

    return jsonify(albums_data), 200

# songs per album
@bp.route('/api/<int:id>/songs/album')
def songs_album(id):
    db = get_db()
    album = db.execute(
        'SELECT album_id, title, genre, username, creator_id, created'
        ' FROM Album p JOIN creator u ON p.creator_id = u.id'
        ' WHERE album_id = ?',
        (id,)
    ).fetchone()

    if not album:
        raise Exception("Album not found")

    songs = db.execute(
        'SELECT p.title, song_id, p.created, p.username, p.creator_id'
        ' FROM Song p'
        ' JOIN Album v ON p.album_id = v.album_id'
        ' WHERE v.album_id = ?',
        (id,)
    ).fetchall()
    if songs:
        response_data = {
            "album": {
                "album_id": album['album_id'],
                "title": album['title'],
                "genre": album['genre'],
                "username": album['username'],
                "creator_id": album['creator_id'],
                "created": album['created'],
            },
            "songs": [
                {
                    "title": song['title'],
                    "song_id": song['song_id'],
                    "created": song['created'],
                    "username": song['username'],
                    "creator_id": song['creator_id'],
                }
                for song in songs
            ],
        }

        return jsonify(response_data), 200
    else:
        response_data = {
            "album": {
                "album_id": album['album_id'],
                "title": album['title'],
                "genre": album['genre'],
                "username": album['username'],
                "creator_id": album['creator_id'],
                "created": album['created'],
            },
            "songs": [],
        }

        return jsonify(response_data), 200




# @login_required
@bp.route('/api/create', methods=('GET', 'POST'))
def create_album():
    if request.method == 'POST':
        try:
            json_data = request.get_json()

            title = json_data.get('title')
            genre = json_data.get('genre')              
            error = None

            if not title:
                error = 'Title is required.'
            if not genre:
                error = 'genre is required.'

            if error is not None:
                return jsonify({'error': error}), 404
            else:
                db = get_db()
                db.execute(
                    'INSERT INTO Album (title, genre, creator_id)'
                    ' VALUES (?, ?, ?)',
                    (title, genre, g.creator['id'])
                )
                db.commit()
                return jsonify({'data': 'success'}), 200
        except Exception as e:
            # Handle exceptions, log errors, etc.
            return jsonify({'error': error}), 500
    return "hello I am there to create the album"

@bp.route('/api/<int:id>/update/album', methods=('GET', 'POST'))
@login_required
def update_album(id):
    album = get_album(id)
    if request.method == 'POST':
        try:
            json_data = request.get_json()

            title = json_data.get('title')
            genre = json_data.get('genre')              
            error = None

            if not title:
                error = 'Title is required.'
            if not genre:
                error = 'genre is required.'

            if error is not None:
                return jsonify({'error': error}), 404
            else:
                db = get_db()
                db.execute(
                    'UPDATE Album SET title = ?, genre = ?'
                    ' WHERE album_id = ?',
                    (title, genre, id)
                )
                db.commit()
                flash('updated album')
                return jsonify({'data': 'success'}), 200
        except Exception as e:
            # Handle exceptions, log errors, etc.
            return jsonify({'error': error}), 500
    else:
        album={
            'title': album['title'],
            'album_id': album['album_id'],
            'genre': album['genre'],
            'creator_id': album['creator_id'],
        }
        return jsonify(album), 200

@bp.route('/api/<int:id>/delete/album', methods=('DELETE',))
@login_required
def delete_album(id):
    if request.method=='DELETE':
        try:
            get_album(id)
            db = get_db()
            songs = db.execute('SELECT * FROM Song WHERE album_id=?', (id,)).fetchall()
            for song in songs:
                db.execute('DELETE FROM Like WHERE song_id=?',(song['song_id'],))
                db.commit()
                db.execute('DELETE FROM FlaggedContent WHERE song_id=?',(song['song_id'],))
                db.commit()
                db.execute('DELETE FROM PlaylistSong WHERE song_id=?',(song['song_id'],))
                db.commit()
            db.execute('DELETE FROM Song WHERE album_id = ?', (id,))
            db.execute('DELETE FROM Album WHERE album_id = ?', (id,))
            db.commit()
            return jsonify({'message': 'Deleted successfully'}), 200
        except Exception as e:
            # Handle exceptions, log errors, etc.
            return jsonify({'error': "something went wrong"}), 500