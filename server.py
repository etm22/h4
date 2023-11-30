from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    # Read the raw binary data from the request
    file_data = request.data

    if not file_data:
        return 'No file data received', 400

    # Define a filename (for example purposes, using a fixed filename here)
    filename = 'uploaded_file.zip'

    # Save the file
    with open(os.path.join('uploads', filename), 'wb') as file:
        file.write(file_data)

    return f'File {filename} uploaded successfully', 200

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(debug=True)
