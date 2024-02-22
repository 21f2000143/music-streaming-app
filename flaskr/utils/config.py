import os
import secrets
basedir = os.path.abspath(os.path.dirname(__file__))
class LocalDevelopmentConfig():
    DEBUG = True
    SQLITE_DB_DIR = os.path.join(basedir, "../../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "project.db")
    SECRET_KEY = secrets.token_urlsafe() #os.environ.get("SECRET_KEY", 'pf9Wkove4IKEAXvy-cQkeDPhv9Cb3Ag-wyJILbq_dFw')
    SECURITY_PASSWORD_SALT = os.environ.get("SECURITY_PASSWORD_SALT", 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?')
    SECURITY_TRACKABLE = True
    SECURITY_LOGIN_WITHOUT_CONFIRMATION = True
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_FLASH_MESSAGES = False
    SECURITY_RECOVERABLE = True
    SECURITY_TRACKABLE = True
    SECURITY_CHANGEABLE = True
    SECURITY_CONFIRMABLE = True
    SECURITY_UNIFIED_SIGNIN = False
    
    CORS_ALLOW_ALL_ORIGINS = True

    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_HOST = 'localhost'
    CACHE_REDIS_PORT = 6379

    SECURITY_POST_CONFIRM_VIEW = "/confirmed"
    SECURITY_CONFIRM_ERROR_VIEW = "/confirm-error"
    SECURITY_RESET_VIEW = "/reset-password"
    SECURITY_RESET_ERROR_VIEW = "/reset-password-error"
    SECURITY_REDIRECT_BEHAVIOR = "spa"
    SECURITY_CSRF_PROTECT_MECHANISMS = ["session", "basic"]
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True

    SECURITY_CSRF_COOKIE_NAME = "XSRF-TOKEN"
    WTF_CSRF_CHECK_DEFAULT = False
    WTF_CSRF_TIME_LIMIT = None

    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    CELERY_TIMEZONE="Asia/Kolkata"
    REDIS_URL = "redis://localhost:6379"
    BROKER_CONNECTION_RETRY_ON_STARTUP = True
