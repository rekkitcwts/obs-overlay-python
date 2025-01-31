from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
current_volume = 0
current_emotion = 'neutral'

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
PNGTuber v2 Helper Functions
'''
@app.route('/pngtuber/v2/update-volume', methods=['POST'])
def update_volume():
    global current_volume
    data = request.json
    current_volume = data.get('volume')
    return jsonify({'status': 'success', 'volume': current_volume})

@app.route('/pngtuber/v2/get-pngtuber-attrs', methods=['GET'])
def get_volume():
    return jsonify({'volume': current_volume, 'emotion': current_emotion})

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
@app.route('/pngtuber/v2/display', methods=['GET'])
def pngtuber_v2_display():
    return render_template('pngtuberv2/display.html', title="PNGTuber Microphone")

'''
DEBUG - checks audio devices
'''
@app.route('/debug/audio')
def debug_audio_devices():
    return render_template('debug_audio.html', title="Audio Devices Debugger")
