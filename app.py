from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

'''
Homepage.
Self explanatory.
'''
@app.route('/')
def hello():
	return 'HELLO'
    
'''
Loads talking PNGTuber avatar
'''
@app.route('/pngtuber')
def pngtuber_avatar():
    return render_template('pngtuber.html', title="PNGTuber Avatar")
