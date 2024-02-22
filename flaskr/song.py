from flask import (
    Blueprint, flash, g, redirect, render_template, request, jsonify, url_for, make_response, session
)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db
bp = Blueprint('song', __name__)

def get_song(id):
    song = get_db().execute(
        'SELECT s.song_id, s.title AS stitle, a.title AS atitle, s.created, s.creator_id'
        ' FROM Song s'
        ' INNER JOIN Album a ON s.album_id = a.album_id'
        ' WHERE s.song_id = ?',
        (id,)
    ).fetchone()

    if song is None:
        abort(404, f"Song id {id} doesn't exist.")

    # if check_author and post['author_id'] != g.user['id']:
    #     abort(403)

    return song

# searching for song with title, artist, genre, rating, lyrics


@bp.route('/')
def index():
    # search_word=request.args.get('search')
    # songs=None
    # if search_word:
    #     db = get_db()
    #     songs = db.execute(
    #         "SELECT s.title, s.song_id, s.created, s.username, s.creator_id"
    #         " FROM Song s"
    #         " LEFT JOIN Album a ON s.album_id = a.album_id"
    #         " LEFT JOIN Like l ON s.song_id = l.song_id"
    #         " WHERE s.title LIKE :search_word"
    #         " OR s.username LIKE :search_word"
    #         " OR s.lyrics LIKE :search_word"
    #         " OR a.genre LIKE :search_word"
    #         " OR l.rate LIKE :search_word",
    #         {"search_word": f"%{search_word}%"}
    #     ).fetchall()
    # else:
    #     db = get_db()
    #     songs = db.execute(
    #         'SELECT title, song_id, created, username, creator_id'
    #         ' FROM Song'
    #         ' ORDER BY created DESC'
    #     ).fetchall()
    return render_template('index.html')

# @login_required
@bp.route('/api/add/song', methods=('GET', 'POST'))
def create():
    db = get_db()
    if request.method == 'POST':
        title = request.form.get('title')
        audio_file = request.files.get('audio_file')
        print(audio_file, type(audio_file))
        if audio_file:
            audio_data = audio_file.read()
            audio_type = audio_file.filename.split('.')[-1]  # Extract the file extension
        lyrics = request.form.get('lyrics')
        album_id = request.form.get('album_id')
        error = None

        if not title:
            error = 'Title is required.'
        if not audio_file:
            error = 'audio_file is required.'
        if not album_id:
            error = 'album_id is required.'

        if error is not None:
            return jsonify({"message": "Something went wrong"}), 400
        else:
            if lyrics:
                db.execute(
                    'INSERT INTO Song (title, audio_data, audio_type, creator_id, username, album_id, lyrics)'
                    ' VALUES (?, ?, ?, ?, ?, ?, ?)',
                    (title, audio_data, audio_type, g.creator['id'],g.creator['username'] , album_id, lyrics)
                )
                db.commit()
            else:
                db.execute(
                    'INSERT INTO Song (title, audio_data, audio_type, creator_id, username, album_id)'
                    ' VALUES (?, ?, ?, ?, ?, ?)',
                    (title, audio_data, audio_type, g.creator['id'],g.creator['username'] , album_id)
                )
                db.commit()
            return jsonify({"message": "Song uploaded successfully"}), 200

@bp.route('/api/current/song/<int:song_id>')
def current_song(song_id):
    db = get_db()
    like=None
    song = db.execute(
        'SELECT title, song_id, album_id, created, lyrics, u.username, u.id'
        ' FROM Song p JOIN creator u ON p.creator_id = u.id AND song_id=?',
        (song_id,)
    ).fetchone()
    if g.user:
        like= db.execute(
            'SELECT * FROM Like'
            ' WHERE song_id=? AND user_id=?',
            (song_id, g.user['id'])
        ).fetchone()
    if g.creator:
        like= db.execute(
            'SELECT * FROM Like'
            ' WHERE song_id=? AND creator_id=?',
            (song_id, g.creator['id'])
        ).fetchone()
    song = {
        'title':song['title'],
        'song_id':song['song_id'],
        'album_id':song['album_id'],
        'created':song['created'],
        'lyrics':song['lyrics'],
        'username':song['username'],
        'id':song['id']
    }
    if like:
        like={
            'like_id':like['like_id'],
            'user_id':like['user_id'],
            'creator_id':like['creator_id'],
            'song_id':like['song_id'],
            'rate':like['rate']
        }
    data={'song':song, 'like':like }
    return jsonify(data), 200

@bp.route('/api/play/<int:song_id>')
def play_audio(song_id):
    db = get_db()
    audio_data, audio_type=db.execute("SELECT audio_data, audio_type FROM Song WHERE song_id=?", (song_id,)).fetchone()
    response = make_response(audio_data)
    response.headers['Content-Type'] = f'audio/{audio_type}'
    return response

@bp.route('/api/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    song = get_song(id)
    db = get_db()

    try:
        if request.method == 'POST':
            title = request.form.get('title')
            audio_file = request.files.get('audio_file')
            print(audio_file, type(audio_file))
            if audio_file:
                audio_data = audio_file.read()
                audio_type = audio_file.filename.split('.')[-1]  # Extract the file extension
            lyrics = request.form.get('lyrics')
            album_id = request.form.get('album_id')
            error = None

            if not title:
                error = 'Title is required.'
            if not audio_file:
                error = 'audio_file is required.'
            if not album_id:
                error = 'album_id is required.'

            if error is not None:
                return jsonify({"error": error}), 400

            if lyrics:
                db.execute(
                    'UPDATE Song SET title=?, audio_data=?, audio_type=?, lyrics=?'
                    ' WHERE song_id=?',
                    (title, audio_data, audio_type, lyrics, id)
                )
                db.commit()
            else:
                db.execute(
                    'UPDATE Song SET title=?, audio_data=?, audio_type=?'
                    ' WHERE song_id=?',
                    (title, audio_data, audio_type, id)
                )
                db.commit()
            
            return jsonify({"message": "Song updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Error updating song: {str(e)}"}), 500

@bp.route('/api/<int:id>/delete', methods=('GET', 'POST'))
@login_required
def delete(id):
    db = get_db()

    try:
        db.execute('DELETE FROM FlaggedContent WHERE song_id=?', (id,))
        db.commit()

        db.execute('DELETE FROM PlaylistSong WHERE song_id=?', (id,))
        db.commit()

        db.execute('DELETE FROM Like WHERE song_id=?', (id,))
        db.commit()

        db.execute('DELETE FROM Song WHERE song_id = ?', (id,))
        db.commit()

        return jsonify({"message": "Song deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Error deleting song: {str(e)}"}), 500

@bp.route('/api/<int:id>/like')
@login_required
def like(id):
    db = get_db()

    if g.user:
        db.execute(
            'INSERT INTO like (song_id, user_id)'
            ' VALUES(?, ?)',
            (id, g.user['id'])
        )
        db.commit()
        return jsonify({"message": "Song liked successfully"}), 200

    elif g.creator:
        db.execute(
            'INSERT INTO like (song_id, creator_id)'
            ' VALUES(?, ?)',
            (id, g.creator['id'])
        )
        db.commit()
        return jsonify({"message": "Song liked successfully"}), 200

    return jsonify({"message": "Error: User or creator not found"}), 404

@bp.route('/<int:id>/add/to/playlist', methods=('GET',))
@login_required
def add_to_playlist(id):
    db = get_db()
    playlists1=None
    playlists2=None
    if g.creator:
        playlists1 = db.execute(
            'SELECT title, creator_id, playlist_id'
            ' FROM Playlist'
            ' WHERE creator_id = ?'
            ' ORDER BY created DESC',
            (session.get('creator_id'),)
        ).fetchall()
    elif g.user:
        playlists2 = db.execute(
            'SELECT title, user_id, playlist_id'
            ' FROM Playlist'
            ' WHERE user_id = ?'
            ' ORDER BY created DESC',
            (session.get('user_id'),)
        ).fetchall()
    song = db.execute(
        'SELECT song_id, title'
        ' FROM Song'
        ' WHERE song_id = ?',
        (id,)
    ).fetchone()
    song={
        'title':song['title'],
        'song_id':song['song_id']
    }
    playlists=None
    if playlists1:
        playlists = [
            {'title':playlist['title'],
            'creator_id': playlist['creator_id'],
            'playlist_id':playlist['playlist_id']
            }
            for playlist in playlists1
        ]
    if playlists2:
        playlists = [
            {'title':playlist['title'],
            'creator_id': playlist['user_id'],
            'playlist_id':playlist['playlist_id']
            }
            for playlist in playlists2
        ]
    data={'song':song, 'playlists':playlists}
    return jsonify(data), 200