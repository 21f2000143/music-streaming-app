from jobs.workers import celery
from datetime import datetime
from flask import current_app as app
from flaskr.db import get_db, close_db
from flask_sse import sse
from celery.schedules import crontab
from flask import render_template
from flask_mail import Message
from flaskr.send_mail import mail
import csv


def remider_body():
    template='''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Streaming App</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Your Favorite Song Notification</h2>
        <p>Hello [User's Name],</p>
        <p>We are excited to let you know that your favorite song is now available on our Music Streaming app!</p>
        <p>Details of the song:</p>
        <ul>
            <li><strong>Song Title:</strong> [Song Title]</li>
            <li><strong>Artist:</strong> [Artist Name]</li>
            <li><strong>Album:</strong> [Album Name]</li>
        </ul>
        <p>Click the link below to log in and start listening:</p>
        <a href="[Your App Login URL]" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Log In to Music Streaming</a>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,<br>
        The Music Streaming Team</p>
    </div>
</body>
</html>
'''
    return template

# scheduled task

@celery.task()
def monthly_entertainment_report_to_users():
    db=get_db()
        # Fetching creators
    
    creators = db.execute('SELECT * FROM Creator').fetchall()

    for creator in creators:
        # Fetch relevant data for the creator
        
        creator_albums = db.execute('SELECT * FROM Album WHERE creator_id = ?', (creator['id'],)).fetchall()
        creator_albums = [{
            'title': album['title']
        } for album in creator_albums]
        
        creator_songs = db.execute('SELECT * FROM Song WHERE creator_id = ?', (creator['id'],)).fetchall()
        creator_songs = [{
            'title': song['title']
        } for song in creator_songs]
        
        creator_likes = db.execute('SELECT * FROM Like WHERE creator_id = ?', (creator['id'],)).fetchall()
        creator_likes = [{
            'song_id': like['song_id'],
            'user_id':like['user_id']
        } for like in creator_likes]
        
        creator_flagged_songs = db.execute('SELECT * FROM FlaggedContent WHERE creator_id = ?', (creator['id'],)).fetchall()
        creator_flagged_songs = [{
            'song_id': flag['song_id'],
            'reason':flag['user_id']
        } for flag in creator_flagged_songs]
        # Sending mail report to the creator
        body = mail_report(creator, creator_albums, creator_songs, creator_likes, creator_flagged_songs)
        
        if body is not None:
            with mail.connect() as conn:
                subject = "Monthly Entertainment Report"
                msg = Message(recipients=[creator['email']], html=body, subject=subject)
                conn.send(msg)
    close_db(db)
    sse.publish({"message": "Sent monthly reports to all creators successfully", "color": "alert alert-info"}, type='notifyadmin')
    print('monthly reminder to users executed')
    return {"status": "success"}

def mail_report(creator, creator_albums, creator_songs, creator_likes, creator_flagged_songs):
    # Create the email body using the fetched data
    # You can customize the format of the email report as needed
    body = f"""
    <html>
    <head></head>
    <body>
        <p>Hello {creator['username']},</p>
        <p>Here is your monthly entertainment report:</p>

        <p>Albums created:</p>
        <ul>
            {"".join([f"<li>{album['title']}</li>" for album in creator_albums])}
        </ul>

        <p>Songs created:</p>
        <ul>
            {"".join([f"<li>{song['title']}</li>" for song in creator_songs])}
        </ul>

        <p>Likes received for your songs:</p>
        <ul>
            {"".join([f"<li>User {like['user_id']} liked your song: {like['song_id']}</li>" for like in creator_likes])}
        </ul>

        <p>Flagged/reported songs:</p>
        <ul>
            {"".join([f"<li>Your song {flagged_song['song_id']} has been flagged/reported for {flagged_song['reason']}</li>" for flagged_song in creator_flagged_songs])}
        </ul>

        <p>Best regards,<br>The Music Team</p>
    </body>
    </html>
    """
    return body


@celery.task()
def daily_reminder_to_user():
    db = get_db()
    users = db.execute(
        'SELECT *'
        ' FROM User'
    ).fetchall()
    creators = db.execute(
        'SELECT *'
        ' FROM Creator'
    ).fetchall()
    users = [{
        'loginAt': user['loginAt'],
        'email': user['email']
    } for user in users ]
    creators = [{
        'loginAt': creator['loginAt'],
        'email': creator['email']
    } for creator in creators ]
    for user in users:
        print(user['loginAt'])
        if user['loginAt'].strftime("%Y-%m-%d")!=datetime.now().strftime("%Y-%m-%d"):
            with mail.connect() as conn:
                subject= "Music streaming"
                message = remider_body()
                print("sent email success")
                msg = Message(recipients=[user['email']],html=message, subject=subject)
                conn.send(msg)
            sse.publish({"message": "login now to listen your favorite song!", "color":"alert alert-primary" },type=user['email'])
    for creator in creators:
        print(creator['loginAt'])
        if creator['loginAt'].strftime("%Y-%m-%d")!=datetime.now().strftime("%Y-%m-%d"):
            with mail.connect() as conn:
                subject= "Music streaming"
                message = remider_body()
                print("sent email success")
                msg = Message(recipients=[creator['email']],html=message, subject=subject)
                conn.send(msg)
            sse.publish({"message": "login now to listen your favorite song!", "color":"alert alert-primary" },type=creator['email'])
    print('daily remider to users executed')
    return {"status": "success"}

@celery.task()
def user_triggered_async_job(): 
    db = get_db()
    # Fetch total counts
    
    total_songs = db.execute('SELECT COUNT(*) FROM Song').fetchone()[0]

    
    total_albums = db.execute('SELECT COUNT(*) FROM Album').fetchone()[0]

    
    total_users = db.execute('SELECT COUNT(*) FROM User').fetchone()[0]

    
    total_creators = db.execute('SELECT COUNT(*) FROM Creator').fetchone()[0]

    # Write to CSV file
    header = ["Total Songs", "Total Albums", "Total Users", "Total Creators"]
    data = [total_songs, total_albums, total_users, total_creators]

    f = open('flaskr/total_report.csv', 'w')
    csvwriter = csv.writer(f)
    csvwriter.writerow(header)
    csvwriter.writerow(data)
    f.close()
    owner = db.execute('SELECT email FROM Owner').fetchone()
    # Send the report via email
    with mail.connect() as conn:
        subject = "Total Report"
        msg = Message(recipients=[owner['email']],  # Replace with the actual recipient email
                        html="Attached is the total report.", subject=subject)
        with app.open_resource("total_report.csv") as report_file:
            msg.attach("total_report.csv", "text/csv", report_file.read())
        conn.send(msg)

    sse.publish({"message": "Sent total report successfully", "color": "alert alert-info"}, type='notifyadmin')
    print('user triggered reminder to user executed')
    return {"message": "Your report will send on your mail in some time."}

            
        
celery.conf.beat_schedule = {
    'my_monthly_task': {
        'task': "jobs.tasks.monthly_entertainment_report_to_users",
        'schedule': crontab(hour=20, minute=0, day_of_month=1, month_of_year='*/1'),  # Sending report to users on first day of each month at 6pm
    },
    'my_daily_task': {
        'task': "jobs.tasks.daily_reminder_to_user",
        'schedule': crontab(hour=11, minute=46),  # Sending email and notification for inactive users
    }
    # Add more scheduled tasks as neede
}