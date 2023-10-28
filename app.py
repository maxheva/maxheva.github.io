from flask import Flask, request, jsonify, render_template
import requests
from datetime import datetime

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

    # Get the current date
    current_date = datetime.now().strftime('%Y-%m-%d')

    data = {
        'RecordType': 'FacialRecognition',
        'UserType': 'All',
        'Area': 'Test',
        'StartDate': current_date,
        'EndDate': current_date
    }

    response = requests.post(api_url, data=data, headers=headers, verify=False)

    try:
        response_json = response.json()
    except ValueError:
        return jsonify({"error": "Invalid JSON response"}), 500
    print(f"API Response: {response_json}")
    print(f"Using current date: {current_date}")
    return jsonify(response_json), response.status_code



if __name__ == "__main__":
    app.run(debug=True)
