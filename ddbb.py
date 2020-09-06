import pymysql as mysql
from DBUtils.PooledDB import PooledDB

db = PooledDB(creator=mysql, user="web", password="Edilizia5!",
              host="192.168.0.3", database="friendspot")


def query(sql, *param):
    conn = db.connection()
    cursor = conn.cursor()
    cursor.execute(sql, param)
    result = cursor.fetchall()
    conn.commit()
    if result is None:
        raise Exception("Error fetching query result: is of None type")
    return result


def queryone(sql, *param):
    conn = db.connection()
    cursor = conn.cursor()
    cursor.execute(sql, param)
    result = cursor.fetchone()
    conn.commit()
    if result is None:
        raise Exception("Error fetching query result: is of None type")
    return result


def insert(sql, *param):
    conn = db.connection()
    cursor = conn.cursor()
    cursor.execute(sql, param)
    id = cursor.lastrowid
    conn.commit()
    if id is None:
        raise Exception("Insert id returned None")
    return id
