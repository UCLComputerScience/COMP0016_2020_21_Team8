# The file acts as the entry point to the API

from app.app import app
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000, threaded=True)
    
