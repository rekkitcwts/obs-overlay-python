from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'I change the thongs two times a day'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent', engineio_logger=True)

global_volume = 0
global_emotion = "Neutral"

@socketio.on('message', namespace='/microphone')
def handle_message(data):
    global global_volume
    print(f"Received WebSocket message: {data}")
    global_volume = data.get('volume', 0)  # Extract volume from data
    socketio.emit('volume_update', {'volume': global_volume}, namespace='/display')

@socketio.on('connect', namespace='/display')
def on_connect_display():
    print('Client connected to /display namespace')

@socketio.on('disconnect', namespace='/display')
def on_disconnect_display():
    print('Client disconnected from /display namespace')

'''
Homepage.
Self explanatory.
'''
@app.route('/')
def hello():
	return 'HELLO'
    
'''
PNGTuber v1 based on original code (credits indicated in README)
Loads talking PNGTuber avatar
'''
@app.route('/pngtuber')
def pngtuber_avatar():
    return render_template('pngtuber.html', title="PNGTuber Avatar")

'''
PNGTuber v2 Function - Microphone
This is where the microphone detects the volume and stuff then sends
the output to the display page.
Recommended use: Browser Source in OBS, hidden under an existing layer
such as a Twitch overlay.
'''
@app.route('/pngtuber/v2/microphone')
def pngtuber_v2_microphone():
    return render_template('pngtuberv2/microphone.html', title="PNGTuber Microphone")

'''
PNGTuber v2 Function - Emotion
Allows setting the PNGTuber emotion, then sends the selection to the 
display page.
Recommended use: Opened as a browser window on a separate device, or
on something like an Elgato Streamdeck or Deckboard.
'''
@app.route('/pngtuber/v2/emotion')
def pngtuber_v2_emotion():
    pass

'''
PNGTuber v2 Function - Display
The actual PNGTuber that everyone is supposed to see.
Recommended use: Browser Source in OBS.
'''
@app.route('/pngtuber/v2/display')
def pngtuber_v2_display():
    return render_template('pngtuberv2/display.html', title="PNGTuber Microphone")

'''
DEBUG - checks audio devices
'''
@app.route('/debug/audio')
def debug_audio_devices():
    return render_template('debug_audio.html', title="Audio Devices Debugger")
