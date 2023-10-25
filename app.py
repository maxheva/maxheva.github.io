from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/api/proxy', methods=['POST'])
def proxy_endpoint():
    api_url = "http://125.228.254.121:8350/api/Record/RecordSearch"
    headers = {
        'UTCTimeZone': 'Los_Angeles',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {
        'RecordType': 'FacialRecognition',
        'UserType': 'All',
        'Area': 'Test',
        'StartDate': '2023-10-25',
        'EndDate': '2023-10-25'
    }
    response = requests.post(api_url, data=data, headers=headers)

    try:
        response_json = response.json()
    except ValueError:
        return jsonify({"error": "Invalid JSON response"}), 500

    return jsonify(response_json), response.status_code

if __name__ == "__main__":
    app.run(debug=True)
