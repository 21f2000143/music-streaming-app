import functools
from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)
from werkzeug.security import check_password_hash, generate_password_hash

from flaskr.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/api/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        json_data = request.get_json()

        username = json_data.get('username')
        password = json_data.get('password')
        email = json_data.get('email')
        print("email", email)
        print("password", password)
        print("username", username)

        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif not email:
            error = 'email is required.'
        if error is None:
            try:
                creator = db.execute(
                    'SELECT username FROM Creator'
                    ' WHERE username=? OR email=?',
                    (username,email)
                ).fetchone()
                user = db.execute(
                    'SELECT username FROM User' 
                    ' WHERE username=? OR email=?',
                    (username,email)
                ).fetchone()

                admin = db.execute(
                    'SELECT username FROM Owner' 
                    ' WHERE username=? OR email=?',
                    (username,email)
                ).fetchone()
                if user or creator or admin:
                    raise db.IntegrityError
                db.execute(
                    'INSERT INTO User (username, password, isblocked, email) VALUES (?, ?, ?, ?)',
                    (username, generate_password_hash(password), 0, email)
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} or {email} is already registered."
            else:
                return jsonify({'data': 'success'}), 200
            return jsonify({'error': error}), 404
        else:
            return jsonify({'error': error}), 404


@bp.route('/api/creator', methods=('GET', 'POST'))
def creator():
    if request.method == 'POST':
        try:
            json_data = request.get_json()

            username = json_data.get('username')
            password = json_data.get('password')
            email = json_data.get('email')

            db = get_db()
            error = None

            if not username:
                error = 'Username is required.'
            elif not password:
                error = 'Password is required.'
            elif not email:
                error = 'email is required.'
            if error is None:
                try:
                    creator = db.execute(
                        'SELECT username FROM Creator'
                        ' WHERE username=? OR email=?',
                        (username,email)
                    ).fetchone()
                    user = db.execute(
                        'SELECT username FROM User' 
                        ' WHERE username=? OR email=?',
                        (username,email)
                    ).fetchone()

                    admin = db.execute(
                        'SELECT username FROM Owner' 
                        ' WHERE username=? OR email=?',
                        (username,email)
                    ).fetchone()
                    if user or creator or admin:
                        raise db.IntegrityError
                    db.execute(
                        "INSERT INTO creator (username, password, isblocked, email) VALUES (?, ?, ?, ?)",
                        (username, generate_password_hash(password), 0, email)
                    )
                    db.commit()
                except db.IntegrityError:
                    error = f"Creator {username} or {email} is already registered."
                else:
                    return jsonify({'data': 'success'}), 200
            return jsonify({'error': error}), 404
        except Exception as e:
            # Handle exceptions, log errors, etc.
            return jsonify({'error': error}), 500

@bp.route('/api/switch/to/creator', methods=('GET', 'POST'))
def switch_creator():
    db = get_db()
    error = None
    user = db.execute(
            'SELECT username, password, email FROM User'
            ' WHERE id=?',
            (g.user['id'],)
        ).fetchone()
    db.execute(
        "INSERT INTO Creator (username, password, email) VALUES (?, ?, ?)",
        (user['username'], user['password'], user['email']),
    )
    db.commit()
    creator = db.execute(
        'SELECT id, username, password FROM Creator'
        ' WHERE username=?',
        (user['username'],)
    ).fetchone()

    playlists = db.execute(
        'SELECT playlist_id, user_id, creator_id FROM Playlist'
        ' WHERE user_id=?',
        (g.user['id'],)
    ).fetchall()

    for playlist in playlists:
        db.execute(
            'UPDATE Playlist SET creator_id=?, user_id=?'
            ' WHERE playlist_id=?',
            (creator['id'], '', playlist['playlist_id'])
        )
        db.commit()
    db.execute('DELETE FROM User WHERE id = ?', (g.user['id'],))
    db.commit()
    error = 'You are now a creator, login with the same username and password'
    return jsonify({"message": "success", "error": error}), 200



@bp.route('/api/creator/block/<int:id>')
def creator_block(id):
    db = get_db()
    db.execute(
        'UPDATE Creator SET isblocked=?'
        ' WHERE id=?',
        (1,id)
    )
    db.commit()
    return jsonify({"message":"blocked the user"}),200

@bp.route('/api/creator/unblock/<int:id>')
def creator_unblock(id):
    db = get_db()
    db.execute(
        'UPDATE Creator SET isblocked=?'
        ' WHERE id=?',
        (0,id)
    )
    db.commit()
    flash("")
    return jsonify({"message":"unblocked the user"})

@bp.route('/api/user/remove/<int:id>')
def user_remove(id):
    db = get_db()
    playlists = db.execute(
        'SELECT playlist_id, user_id'
        ' FROM Playlist'
        ' WHERE user_id=?',
        (id,)
    ).fetchall()
    for playlist in playlists:
        db.execute('DELETE FROM PlaylistSong WHERE playlist_id = ?',
                    (playlist['playlist_id'],))
        db.commit()
    db.execute('DELETE FROM Playlist WHERE user_id = ?',
                (id,))
    db.commit()
    db.execute('DELETE FROM Like WHERE user_id = ?',
                (id,))
    db.commit()
    
    db.execute('DELETE FROM User WHERE id = ?', (id,))
    db.commit()
    return jsonify({"message":"removed the user"})

@bp.route('/api/user/block/<int:id>')
def user_block(id):
    db = get_db()
    db.execute(
        'UPDATE User SET isblocked=?'
        ' WHERE id=?',
        (1,id)
    )
    db.commit()
    return jsonify({"message":"blocked the user"})

@bp.route('/api/user/unblock/<int:id>')
def user_unblock(id):
    db = get_db()
    db.execute(
        'UPDATE User SET isblocked=?'
        ' WHERE id=?',
        (0,id)
    )
    db.commit()
    return jsonify({"message":"unblocked the user"})

@bp.route('/api/login', methods=('GET', 'POST'))
def login():
    print("inside /api/login")
    if request.method == 'POST':
        json_data = request.get_json()

        username = json_data.get('username')
        password = json_data.get('password')            
        db = get_db()
        error = None
        user, creator = None, None
        user = db.execute(
            'SELECT * FROM User WHERE username = ?', (username,)
        ).fetchone()

        creator = db.execute(
            'SELECT * FROM Creator WHERE username = ?', (username,)
        ).fetchone()

        if user or creator:
            print("user exist")
            if user:
                print("inside user verify")
                if user['isblocked']==1:
                    error = 'You have been blocked.'
                    return jsonify({'error': error}), 403
                elif check_password_hash(user['password'], password):
                    session.clear()
                    session['user_id'] = user['id']
                    db.execute(
                        'UPDATE User'
                        ' SET loginAt = CURRENT_TIMESTAMP'
                        ' WHERE id = ?',(user['id'],)
                    )
                    db.commit()
                    print("update current time")
                    return jsonify({'data': 'success', 'type':'user', 'id':user['id'], 'email':user['email']}), 200
                else:
                    error = 'Incorrect password.'
                    return jsonify({'error': error}), 401
            elif creator:
                print("inside creator")
                if creator['isblocked']==1:
                    error = 'You have been blocked.'
                    return jsonify({'error': error}), 404
                elif check_password_hash(creator['password'], password):
                    session.clear()
                    session['creator_id'] = creator['id']
                    db.execute(
                        'UPDATE Creator'
                        ' SET loginAt = CURRENT_TIMESTAMP'
                        ' WHERE id = ?',(creator['id'],)
                    )
                    db.commit()
                    print("update current time")
                    return jsonify({'data': 'success', 'type':'creator', 'id':creator['id'], 'email':creator['email']}), 200
                else:
                    error = 'Incorrect password.'
                    return jsonify({'error': error}), 404
        else:
            print("user doesn't exist")
            error = 'Incorrect username.'
            print("returning error")
            return jsonify({'error': error}), 404

@bp.route('/api/admin/login', methods=('GET', 'POST'))
def admin_login():
    if request.method == 'POST':
        json_data = request.get_json()

        username = json_data.get('username')
        password = json_data.get('password')            
        db = get_db()
        error = None
        admin = None
        admin = db.execute(
            'SELECT * FROM Owner WHERE username = ?', (username,)
        ).fetchone()
        if admin:
            if check_password_hash(admin['password'], password):
                session.clear()
                session['admin_id'] = admin['id']
                db.execute(
                    'UPDATE Owner'
                    ' SET loginAt = CURRENT_TIMESTAMP'
                    ' WHERE username = ?',(admin['id'],)
                )
                return jsonify({'message': 'success', 'type':'admin', 'username':admin['id'], 'email':admin['email']}), 200
            else:
                error = 'Incorrect password.'
                return jsonify({'error': error}), 404
        else:
            error = 'Incorrect username.'
            return jsonify({'error': error}), 404

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    creator_id = session.get('creator_id')
    admin_id = session.get('admin_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()

    if creator_id is None:
        g.creator = None
    else:
        g.creator = get_db().execute(
            'SELECT * FROM creator WHERE id = ?', (creator_id,)
        ).fetchone()

    if admin_id is None:
        g.owner = None
    else:
        g.owner = get_db().execute(
            'SELECT * FROM owner WHERE id = ?', (admin_id,)
        ).fetchone()

@bp.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "success"}), 200

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None and g.creator is None and g.owner is None :
            return jsonify({"message":"You are not authenticated, Please login"}), 401
        return view(**kwargs)

    return wrapped_view