import os
import uuid

from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_statement(file, upload_folder):
    """
    Save uploaded bank statement PDF.

    Returns:
        {
            "filename": "...",
            "original_filename": "...",
            "file_path": "...",
            "file_size": 12345
        }
    """

    if file is None:
        raise ValueError("No file uploaded.")

    if file.filename == "":
        raise ValueError("No file selected.")

    if not allowed_file(file.filename):
        raise ValueError("Only PDF files are allowed.")

    # Create upload directory if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)

    filename = (
        f"{uuid.uuid4()}_"
        f"{secure_filename(file.filename)}"
    )

    file_path = os.path.join(
        upload_folder,
        filename
    )

    file.save(file_path)

    return {
        "filename": filename,
        "original_filename": file.filename,
        "file_path": file_path,
        "file_size": os.path.getsize(file_path)
    }