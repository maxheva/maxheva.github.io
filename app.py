from flask import Flask, request, jsonify, render_template
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/api/proxy', methods=['POST'])
def proxy_endpoint():
    logging.info("Proxy endpoint called.")
    
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
    
    try:
        logging.info("Sending request to external API.")
        response = requests.post(api_url, data=data, headers=headers, verify=False)
        response.raise_for_status()  # This will raise an error for HTTP error responses
        logging.info("Received response from external API.")
    except requests.RequestException as e:
        logging.error(f"Error occurred while fetching data from API: {e}")
        return jsonify({"error": "Error fetching data from API"}), 500

    try:
        response_json = response.json()
    except ValueError:
        logging.error("Invalid JSON response from API.")
        return jsonify({"error": "Invalid JSON response from API"}), 500

    unique_users = list({user['UserName']: user for user in response_json}.values())

    return jsonify(unique_users), response.status_code

if __name__ == "__main__":
    app.run(debug=True)
