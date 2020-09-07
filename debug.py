import subprocess
import threading
from termcolor import colored
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from livereload import Server

command = ["python", "app.py"]

app = subprocess.Popen(command)


class changesListener(FileSystemEventHandler):
    def __init__(self, app):
        self.t = 0.0
        self.mutex = threading.Lock()
        self.app = app

    def on_any_event(self, event):
        if event.src_path.endswith(".min.js"):
            return
        py = event.src_path.endswith(".py")
        if py and (time.time() - self.t) > 5 and not self.mutex.locked():
            self.mutex.acquire()
            print(colored("\nReloading app...\n\n", "red"))
            self.t = time.time()
            time.sleep(1)
            self.app.kill()
            self.app = subprocess.Popen(command)
            self.mutex.release()


event_handler = changesListener(app)
observer = Observer()
observer.schedule(event_handler, path=os.getcwd(), recursive=True)
observer.start()

server = Server()
server.watch('static/index.html', delay=2)
server.serve(liveport=35729, debug=False)
