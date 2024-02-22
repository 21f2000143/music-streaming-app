from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db
from jobs import tasks

bp = Blueprint('admin', __name__)

@bp.route('/get/report/data')
@login_required
def get_report():
    job = tasks.user_triggered_async_job.delay()
    result=job.get()
    return result, 200

@bp.route('/api/users')
def index_users():
    try:
        db = get_db()
        search = request.args.get('search')
        users=None
        query = f"SELECT * FROM User WHERE username LIKE '%{search}%' OR email LIKE '%{search}%'"
        if search:
            users = db.execute(query).fetchall()
        else:
            users = db.execute(
                'SELECT *'
                ' FROM User'
            ).fetchall()

        users = [{
            "id": user['id'],
            "username": user['username'],
            "isblocked": user['isblocked'],
        } for user in users
        ]
        return jsonify(users), 200

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400


@bp.route('/api/creators')
def index_creators():
    try:
        db = get_db()
        search = request.args.get('search')
        creators=None
        query = f"SELECT * FROM Creator WHERE username LIKE '%{search}%' OR email LIKE '%{search}%'"
        if search:
            creators = db.execute(query).fetchall()
        else:
            creators = db.execute(
                'SELECT *'
                ' FROM Creator'
            ).fetchall()

        creators = [{
            "id": creator['id'],
            "username": creator['username'],
            "isblocked": creator['isblocked'],
        } for creator in creators
        ]
        return jsonify(creators), 200

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400


@bp.route('/api/albums')
def index_albums():
    try:
        db = get_db()
        search = request.args.get('search')
        albums=None
        query = f"""
            SELECT title, album_id, created, username, creator_id
            FROM Album p JOIN creator u ON p.creator_id = u.id
            WHERE title LIKE '%{search}%'
            ORDER BY created DESC
        """  
        if search:
            albums = db.execute(query).fetchall()
        else:            
            albums = db.execute(
                'SELECT title, album_id, created, username, creator_id'
                ' FROM Album p JOIN creator u ON p.creator_id = u.id'
                ' ORDER BY created DESC'
            ).fetchall()
        albums = [{
            'title': album['title'],
            'album_id': album['album_id'],
            'created': album['created'],
            'username': album['username'],
            'creator_id': album['creator_id']
        } for album in albums ]
        return jsonify(albums), 200

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400

# songs per album
@bp.route('/api/admin/songs')
def index_songs():
    try:
        db = get_db()
        search = request.args.get('search')
        songs=None
        query = f"""
            SELECT title, song_id, created, username, lyrics
            FROM Song
            WHERE title LIKE '%{search}%'
            ORDER BY created DESC
        """  
        if search:
            songs = db.execute(query).fetchall()
        else:            
            songs = db.execute(
                'SELECT title, song_id, created, username, lyrics'
                ' FROM Song'
            ).fetchall()
        songs = [{
            'title': song['title'],
            'song_id': song['song_id'],
            'created': song['created'],
            'username': song['username'],
            'lyrics': song['lyrics']
        } for song in songs ]
        return jsonify(songs), 200

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400


# flaged content per album
@bp.route('/api/flags')
def index_flags():
    try:
        db = get_db()
        search = request.args.get('search')
        flags=None
        query = f"""
            SELECT flag_id, song_id, type, creator_id, reason
            FROM FlaggedContent
            WHERE reason LIKE '%{search}%'
        """  
        if search:
            flags = db.execute(query).fetchall()
        else:            
            flags = db.execute(
                'SELECT flag_id, song_id, type, creator_id, reason'
                ' FROM FlaggedContent'
            ).fetchall()
        flags = [{
            'flag_id': flag['flag_id'],
            'song_id': flag['song_id'],
            'type': flag['type'],
            'creator_id': flag['creator_id'],
            'reason': flag['reason']
        } for flag in flags ]
        return jsonify(flags), 200

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400

@bp.route('/api/report/content/<int:id>', methods=('GET', 'POST'))
@login_required
def report_content(id):
    if request.method == 'POST':
        json_data = request.get_json()

        title = json_data.get('title')
        reason = json_data.get('reason')              
        error = None

        if not title:
            error = 'Title is required.'
        if not reason:
            error = 'Reason is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO FlaggedContent (song_id, type, reason)'
                ' VALUES (?, ?, ?)',
                (id, "content", reason)
            )
            db.commit()
            return jsonify({'message':'Reported successfully.'})

@bp.route('/report/creator/<int:id>', methods=('GET', 'POST'))
@login_required
def report_creator(id):
    try:
        if request.method == 'POST':
            title = request.form['title']
            reason = request.form['reason']
            error = None

            if not title:
                error = 'Title is required.'
            if not reason:
                error = 'Reason is required.'

            if error is not None:
                raise Exception(error)
            else:
                db = get_db()
                db.execute(
                    'INSERT INTO FlaggedContent (creator_id, type, title, reason)'
                    ' VALUES (?, ?, ?, ?)',
                    (id, "creator", title, reason)
                )
                db.commit()
                return jsonify({"message": "success"}), 200

        return render_template('admin/report_creator.html', id=id)

    except Exception as e:
        error_message = str(e)
        return jsonify({"message": "error", "error": error_message}), 400


@bp.route('/remove/flag/<int:id>', methods=('GET', 'POST'))
@login_required
def remove_flag(id):
    db = get_db()
    flag = db.execute(
        'SELECT flag_id FROM FlaggedContent WHERE flag_id=?',
        (id,)
    )
    if flag:
        db.execute(
            'DELETE FROM FlaggedContent WHERE flag_id=?',
            (id,)
        )
        db.commit()
        return jsonify({"message": 'Deleted successfully.'}), 200
    else:
        return jsonify({"message": 'Not found.'}), 404