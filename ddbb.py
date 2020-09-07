import sqlite3
from threading import Lock
import time

db = sqlite3.connect('friendspot.db', check_same_thread=False)
ldb = Lock()

cursor = db.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS user (id integer PRIMARY KEY, username text NOT NULL, name text NOT NULL, url text NOT NULL, img text NOT NULL, session text NOT NULL, access text NOT NULL, refresh text NOT NULL, valid int NOT NULL);")
cursor.execute("CREATE TABLE IF NOT EXISTS friends (user integer NOT NULL, friend integer NOT NULL, FOREIGN KEY (user) REFERENCES user(id), FOREIGN KEY (friend) REFERENCES user(id));")
db.commit()


def query(sql, *param):
    with ldb:
        cursor = db.cursor()
        cursor.execute(sql, param)
        result = cursor.fetchall()
        db.commit()
        return result


def queryone(sql, *param):
    with ldb:
        cursor = db.cursor()
        cursor.execute(sql, param)
        result = cursor.fetchone()
        db.commit()
        return result


def insert(sql, *param):
    with ldb:
        cursor = db.cursor()
        cursor.execute(sql, param)
        id = cursor.lastrowid
        db.commit()
        return id
