from flask import current_app as app
from flask_mail import Mail

# Flask app configuration for MailHog
# http://localhost:8025/
app.config['MAIL_SERVER'] = 'localhost'
app.config['MAIL_PORT'] = 1025
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEFAULT_SENDER'] = "me@example.com"
mail = Mail(app)
app.app_context().push()
