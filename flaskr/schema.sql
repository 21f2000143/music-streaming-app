DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Creator;
DROP TABLE IF EXISTS Owner;
DROP TABLE IF EXISTS Playlist;
DROP TABLE IF EXISTS PlaylistSong;
DROP TABLE IF EXISTS Song;
DROP TABLE IF EXISTS Album;
DROP TABLE IF EXISTS Like;
DROP TABLE IF EXISTS Comment;
DROP TABLE IF EXISTS FlaggedContent;

CREATE TABLE User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  isblocked INTEGER ,
  password TEXT NOT NULL,
  loginAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Creator (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  isblocked INTEGER ,
  password TEXT NOT NULL,
  loginAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Owner (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  loginAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Playlist (
    playlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    user_id INTEGER,
    creator_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (creator_id) REFERENCES Creator(id)
);

CREATE TABLE PlaylistSong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER,
    song_id INTEGER,
    FOREIGN KEY (playlist_id) REFERENCES Playlist(playlist_id),
    FOREIGN KEY (song_id) REFERENCES Song(song_id)
);

CREATE TABLE Song (
    song_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creator_id INTEGER,
    username TEXT NOT NULL,
    audio_data BLOB,
    audio_type TEXT,
    album_id INTEGER,
    lyrics TEXT,
    FOREIGN KEY (creator_id) REFERENCES Creator(creator_id),
    FOREIGN KEY (album_id) REFERENCES Album(album_id)
);

CREATE TABLE Album (
    album_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255),
    genre VARCHAR(255),
    creator_id INTEGER,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES Creator(creator_id) 
);

CREATE TABLE Like (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    creator_id INTEGER,
    song_id INTEGER,
    rate INTEGER,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (creator_id) REFERENCES Creator(creator_id),
    FOREIGN KEY (song_id) REFERENCES Song(song_id)
);

CREATE TABLE Comment (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    song_id INTEGER,
    content TEXT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (song_id) REFERENCES Song(song_id)
);

CREATE TABLE FlaggedContent (
    flag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER,
    type TEXT,
    creator_id INTEGER,
    reason TEXT,
    FOREIGN KEY (song_id) REFERENCES Song(song_id),
    FOREIGN KEY (creator_id) REFERENCES Creator(id)
);