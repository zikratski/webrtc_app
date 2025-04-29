# from flask import Flask, render_template, redirect, url_for, request
# from flask_socketio import SocketIO, join_room, leave_room, emit
# import uuid

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'webrtc-secret-key'
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')



# # Хранилище комнат
# rooms = {}

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/create')
# def create():
#     room_id = str(uuid.uuid4())[:8]
#     rooms[room_id] = []  # создаём новую комнату
#     return redirect(url_for('room', room_id=room_id))

# @app.route('/room/<room_id>')
# def room(room_id):
#     if room_id not in rooms:
#         return "Комната не найдена", 404
#     return render_template('room.html', room_id=room_id)

# @socketio.on('join')
# def handle_join(data):
#     room = data['room']
#     if room not in rooms:
#         emit('room-not-found')  # отправим событие клиенту
#         return

#     join_room(room)
#     rooms[room].append(request.sid)  # добавляем ID сокета
#     emit('joined')  # подтвердим вход
#     emit('user-joined', data, room=room, include_self=False)

# @socketio.on('disconnect')
# def handle_disconnect():
#     for room, users in list(rooms.items()):
#         if request.sid in users:
#             users.remove(request.sid)
#             if not users:
#                 del rooms[room]  # удаляем комнату, если в ней никого не осталось
#             break


# # @app.route('/')
# # def index():
# #     return render_template('index.html')

# # @app.route('/create')
# # def create():
# #     room_id = str(uuid.uuid4())[:8]
# #     return redirect(url_for('room', room_id=room_id))

# # @app.route('/room/<room_id>')
# # def room(room_id):
# #     return render_template('room.html', room_id=room_id)

# # # --- WebSocket события ---
# # @socketio.on('join')
# # def handle_join(data):
# #     room = data['room']
# #     join_room(room)
# #     emit('user-joined', data, room=room, include_self=False)

# @socketio.on('signal')
# def handle_signal(data):
#     emit('signal', data, room=data['room'], include_self=False)

# @socketio.on('disconnect')
# def handle_disconnect():
#     print('User disconnected')

# @socketio.on('offer')
# def handle_offer(data):
#     emit('offer', data, room=data['room'], include_self=False)

# @socketio.on('answer')
# def handle_answer(data):
#     emit('answer', data, room=data['room'], include_self=False)

# @socketio.on('ice-candidate')
# def handle_ice_candidate(data):
#     emit('ice-candidate', data, room=data['room'], include_self=False)


# if __name__ == '__main__':
#     socketio.run(app, debug=True)


from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, join_room, leave_room, emit
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'webrtc-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Хранилище комнат
rooms = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create')
def create():
    room_id = str(uuid.uuid4())[:8]
    rooms[room_id] = []  # создаём новую комнату
    return redirect(url_for('room', room_id=room_id))

@app.route('/room/<room_id>')
def room(room_id):
    if room_id not in rooms:
        return "Комната не найдена", 404
    return render_template('room.html', room_id=room_id)

@socketio.on('join')
def handle_join(data):
    room = data['room']
    if room not in rooms:
        emit('room-not-found')  # отправим событие клиенту
        return

    join_room(room)
    rooms[room].append(request.sid)  # добавляем ID сокета
    emit('joined')  # подтвердим вход
    emit('user-joined', data, room=room, include_self=False)

@socketio.on('disconnect')
def handle_disconnect():
    for room, users in list(rooms.items()):
        if request.sid in users:
            users.remove(request.sid)
            if not users:
                del rooms[room]  # удаляем комнату, если в ней никого не осталось
            break


@socketio.on('signal')
def handle_signal(data):
    emit('signal', data, room=data['room'], include_self=False)


@socketio.on('offer')
def handle_offer(data):
    emit('offer', data, room=data['room'], include_self=False)

@socketio.on('answer')
def handle_answer(data):
    emit('answer', data, room=data['room'], include_self=False)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    emit('ice-candidate', data, room=data['room'], include_self=False)


if __name__ == '__main__':
    socketio.run(app, debug=True)


