from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, session, jsonify
)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db

bp = Blueprint('playlist', __name__)

# helpful functions
def get_playlist(id):
    playlist = get_db().execute(
        'SELECT playlist_id, title'
        ' FROM playlist'
        ' WHERE playlist_id = ?',
        (id,)
    ).fetchone()

    if playlist is None:
        abort(404, f"playlist id {id} doesn't exist.")
    # if check_author and playlist['creator_id'] != g.creator['id']:
    #     abort(403)
    return playlist

@bp.route('/api/playlist')
@login_required
def index_playlist():
    db = get_db()
    playlists = None

    if g.creator:
        playlists = db.execute(
            'SELECT title, creator_id, playlist_id'
            ' FROM playlist'
            ' WHERE creator_id=?'
            ' ORDER BY created DESC',
            (g.creator['id'],)
        ).fetchall()

    if g.user:
        playlists = db.execute(
            'SELECT title, creator_id, playlist_id'
            ' FROM playlist'
            ' WHERE user_id=?'
            ' ORDER BY created DESC',
            (g.user['id'],)
        ).fetchall()

    # Convert playlists to a list of dictionaries
    playlists_list = [{'title': playlist['title'], 'creator_id': playlist['creator_id'], 'playlist_id': playlist['playlist_id']}
                      for playlist in playlists]

    # Return JSON response
    return jsonify(playlists=playlists_list)


@bp.route('/api/<int:id>/songs/playlist')
@login_required
def songs_playlist(id):
    db = get_db()
    print("inside the controller")
    playlist = get_playlist(id)
    songs = db.execute(
        'SELECT s.title, s.song_id, s.created, s.username, s.creator_id, p.Playlist_id'
        ' FROM PlaylistSong p'
        ' JOIN Song s ON s.song_id = p.song_id'
        ' WHERE p.playlist_id = ?',
        (playlist['playlist_id'],)
    ).fetchall()

    # Prepare the data for JSON response
    songs_data = []
    for song in songs:
        song_data = {
            'title': song['title'],
            'song_id': song['song_id'],
            'created': song['created'],
            'username': song['username'],
            'creator_id': song['creator_id'],
            'Playlist_id': song['Playlist_id']
        }
        songs_data.append(song_data)
    playlist = {'title':playlist['title'], 'playlist_id': playlist['playlist_id']}
    # Return a JSON response
    return jsonify({'songs': songs_data, 'playlist': playlist})


@bp.route('/api/songs/<int:song_id>/add/here/<int:playlist_id>')
@login_required
def add_here(song_id, playlist_id):
    db = get_db()
    already_added = db.execute(
        'SELECT id FROM PlaylistSong'
        ' WHERE song_id=? AND playlist_id=?',
        (song_id, playlist_id)
    ).fetchone()
    if not already_added:
        db.execute(
            'INSERT INTO PlaylistSong (song_id, playlist_id)'
            ' VALUES (?, ?)',
            (song_id, playlist_id)
        )
        db.commit()
        flash("Song added to your playlist.")
        return jsonify({"message": "success"}), 200
    else:
        flash('Song is already added.')
        return jsonify({"message": "already_added"}), 400


@bp.route('/api/songs/<int:song_id>/remove/from/<int:playlist_id>')
@login_required
def remove_from(song_id, playlist_id):
    print(song_id, playlist_id, "both item here")
    db = get_db()
    db.execute(
        'DELETE FROM PlaylistSong'
        ' WHERE song_id=? AND playlist_id=?',
        (song_id, playlist_id)
    )
    db.commit()    
    # Return a JSON response
    return jsonify({"message": "Song removed successfully"}), 200

@bp.route('/api/create/playlist', methods=('GET', 'POST'))
@login_required
def create_playlist():
    if request.method == 'POST':
        json_data = request.get_json()
        title = json_data.get('title')
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            return jsonify({"message": "Error: Title is required"}), 400

        else:
            db = get_db()
            if g.creator:
                db.execute(
                    'INSERT INTO playlist (title, creator_id)'
                    ' VALUES (?, ?)',
                    (title, g.creator['id'])
                )
                db.commit()
            if g.user:
                db.execute(
                    'INSERT INTO playlist (title, user_id)'
                    ' VALUES (?, ?)',
                    (title, g.user['id'])
                )
                db.commit()
        return jsonify({"message": "Playlist added successfully"}), 200

@bp.route('/api/<int:id>/update/playlist', methods=('GET', 'POST'))
@login_required
def update_playlist(id):
    playlist = get_playlist(id)
    if request.method == 'POST':
        json_data = request.get_json()
        title = json_data['title']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
            return jsonify({"message": "Error: Title is required"}), 400

        else:
            db = get_db()
            if g.creator:
                db.execute(
                    'UPDATE playlist SET title = ?'
                    ' WHERE playlist_id = ? AND creator_id = ?',
                    (title, id, g.creator['id'])
                )
                db.commit()
            if g.user:
                db.execute(
                    'UPDATE playlist SET title = ?'
                    ' WHERE playlist_id = ? AND user_id = ?',
                    (title, id, g.user['id'])
                )
                db.commit()
            flash('updated playlist')
            return jsonify({"message": "Playlist updated successfully"}), 200
    if request.method=='GET':
        playlist={"playlist_id": playlist['playlist_id'], "title":playlist['title']}
        return jsonify(playlist), 200
        
@bp.route('/api/<int:id>/delete/playlist', methods=('DELETE',))
@login_required
def delete_playlist(id):
    db = get_db()
    
    if g.creator:
        db.execute('DELETE FROM PlaylistSong WHERE playlist_id=?',(id,))
        db.commit()
        db.execute(
            'DELETE FROM playlist WHERE playlist_id = ? AND creator_id = ?',
            (id, g.creator['id'])
        )
        db.commit()
        return jsonify({"message": "Playlist deleted successfully"}), 200

    if g.user:
        db.execute('DELETE FROM PlaylistSong WHERE playlist_id=?',(id,))
        db.commit()
        db.execute(
            'DELETE FROM playlist WHERE playlist_id = ? AND user_id = ?',
            (id, g.user['id'])
        )
        db.commit()
        return jsonify({"message": "Playlist deleted successfully"}), 200

    return jsonify({"message": "Error: Playlist not found"}), 404