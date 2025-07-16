import os
import json
from pdf2docx import Converter
from tempfile import NamedTemporaryFile

def handler(event, context):
    try:
        # Decode the base64 file from POST body
        body = json.loads(event['body'])
        pdf_data = body['file']
        pdf_bytes = bytes(pdf_data.encode("latin1"))

        with NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_file:
            pdf_file.write(pdf_bytes)
            pdf_path = pdf_file.name

        docx_path = pdf_path.replace('.pdf', '.docx')
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        with open(docx_path, 'rb') as docx_file:
            docx_content = docx_file.read()

        # Clean up temp files
        os.remove(pdf_path)
        os.remove(docx_path)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": "attachment; filename=converted.docx"
            },
            "body": docx_content.decode("latin1"),
            "isBase64Encoded": False
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
