import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";

const CONVERT_API_SECRET = "GQuCzJgN4pjvfQFTXooMKGoFLHNKnt8Y";

const PDFToDOCXConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadUrl(null);
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setDownloadUrl(null);
    setError(null);
    (document.getElementById("formFile") as HTMLInputElement).value = "";
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append("File", file);

      const response = await axios.post(
        `https://v2.convertapi.com/convert/pdf/to/docx`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            Secret: CONVERT_API_SECRET,
          },
        }
      );

      const convertedFile = response.data?.Files?.[0];

      if (convertedFile?.Url) {
        setDownloadUrl(convertedFile.Url);
      } else if (convertedFile?.FileData && convertedFile?.FileName) {
        const byteCharacters = atob(convertedFile.FileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const blobUrl = URL.createObjectURL(blob);
        setDownloadUrl(blobUrl);
      } else {
        setError("Failed to retrieve file.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Conversion failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg p-4">
              <h2 className="text-center mb-4 text-primary fw-bold">
                Convert PDF to DOCX
              </h2>

              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload your PDF file</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-between gap-2">
                <Button
                  variant="primary"
                  onClick={handleConvert}
                  disabled={!file || loading}
                  className="flex-fill"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Convert"
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-fill"
                >
                  Reset
                </Button>
              </div>

              {downloadUrl && (
                <Alert variant="success" className="mt-3 text-center">
                  ✅ Conversion successful!{" "}
                  <Alert.Link
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download DOCX
                  </Alert.Link>
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mt-3 text-center">
                  ❌ {error}
                </Alert>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PDFToDOCXConverter;
