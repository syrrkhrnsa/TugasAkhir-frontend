import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaDownload,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";
import axios from "axios";
import config from "../config";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";

// Konfigurasi worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js`;

// Styled Components untuk Document Viewer
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background: white;
  width: 95%;
  height: 95%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 8px;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #d32f2f;
`;

const Controls = styled.div`
  padding: 8px;
  background: #f5f5f5;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

const ControlButton = styled.button`
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PdfContainer = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageContainer = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const UnsupportedFormat = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const PopupListDokumen = ({ idSertifikat, onClose }) => {
  const [dokumenList, setDokumenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState(null);

  // Fetch dokumen list ketika komponen mount atau idSertifikat berubah
  useEffect(() => {
    const fetchDokumenList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_URL}/sertifikat/${idSertifikat}/dokumen-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDokumenList(response.data.data || []);
      } catch (err) {
        setError("Gagal memuat daftar dokumen");
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDokumenList();
  }, [idSertifikat]);

  const handleViewDocument = async (dokumen) => {
    try {
      setCurrentDocument(dokumen);
      setDocLoading(true);
      setViewerOpen(true);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.API_URL}/dokumen-legalitas/${dokumen.id}/view`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const file = new File([blob], dokumen.name, { type: blob.type });
      setDocumentData(file);
    } catch (err) {
      setDocError("Gagal memuat dokumen");
      console.error("Error viewing document:", err);
    } finally {
      setDocLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setDocLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading document:", error);
    setDocError("Gagal memuat dokumen");
    setDocLoading(false);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) =>
      Math.max(1, Math.min(prevPageNumber + offset, numPages))
    );
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  }

  const closeViewer = () => {
    setViewerOpen(false);
    setCurrentDocument(null);
    setDocumentData(null);
    setPageNumber(1);
    setScale(1);
    setDocError(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <p>Memuat daftar dokumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Daftar Dokumen Legalitas</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {dokumenList.length === 0 ? (
              <p className="text-center py-4">Tidak ada dokumen</p>
            ) : (
              dokumenList.map((dokumen) => (
                <div
                  key={dokumen.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 mb-2"
                >
                  <div className="flex-1 truncate">
                    <p className="font-medium">{dokumen.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(dokumen.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDocument(dokumen)}
                      className="text-blue-500 hover:text-blue-700 p-2"
                      title="Lihat Dokumen"
                    >
                      <FaEye className="text-lg" />
                    </button>
                    <a
                      href={`${config.API_URL}/dokumen-legalitas/${dokumen.id}/download`}
                      download
                      className="text-green-500 hover:text-green-700 p-2"
                      title="Download Dokumen"
                    >
                      <FaDownload className="text-lg" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && (
        <ModalOverlay onClick={closeViewer}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{currentDocument?.name}</ModalTitle>
              <CloseButton onClick={closeViewer}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {docLoading && (
                <LoadingIndicator>Memuat dokumen...</LoadingIndicator>
              )}
              {docError && <ErrorMessage>{docError}</ErrorMessage>}

              {documentData && !docError && (
                <>
                  {documentData.type === "application/pdf" ? (
                    <>
                      <Controls>
                        <ControlButton
                          onClick={() => changePage(-1)}
                          disabled={pageNumber <= 1}
                        >
                          <FaChevronLeft /> Sebelumnya
                        </ControlButton>
                        <span>
                          Halaman {pageNumber} dari {numPages || "--"}
                        </span>
                        <ControlButton
                          onClick={() => changePage(1)}
                          disabled={pageNumber >= numPages}
                        >
                          Selanjutnya <FaChevronRight />
                        </ControlButton>
                        <ControlButton
                          onClick={zoomOut}
                          disabled={scale <= 0.5}
                        >
                          <FaSearchMinus /> Zoom Out
                        </ControlButton>
                        <span>{Math.round(scale * 100)}%</span>
                        <ControlButton onClick={zoomIn} disabled={scale >= 3}>
                          <FaSearchPlus /> Zoom In
                        </ControlButton>
                      </Controls>

                      <PdfContainer>
                        <Document
                          file={documentData}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          loading={
                            <LoadingIndicator>Memuat PDF...</LoadingIndicator>
                          }
                        >
                          <Page pageNumber={pageNumber} scale={scale} />
                        </Document>
                      </PdfContainer>
                    </>
                  ) : ["image/jpeg", "image/png", "image/gif"].includes(
                      documentData.type
                    ) ? (
                    <ImageContainer>
                      <img
                        src={URL.createObjectURL(documentData)}
                        alt={currentDocument.name}
                        onLoad={() => setDocLoading(false)}
                        onError={() => {
                          setDocError("Gagal memuat gambar");
                          setDocLoading(false);
                        }}
                        style={{
                          transform: `scale(${scale})`,
                          maxWidth: "100%",
                        }}
                      />
                      <Controls>
                        <ControlButton
                          onClick={zoomOut}
                          disabled={scale <= 0.5}
                        >
                          <FaSearchMinus /> Zoom Out
                        </ControlButton>
                        <span>{Math.round(scale * 100)}%</span>
                        <ControlButton onClick={zoomIn} disabled={scale >= 3}>
                          <FaSearchPlus /> Zoom In
                        </ControlButton>
                      </Controls>
                    </ImageContainer>
                  ) : (
                    <UnsupportedFormat>
                      Format file tidak didukung. Hanya PDF dan gambar (JPG,
                      PNG, GIF) yang bisa ditampilkan.
                    </UnsupportedFormat>
                  )}
                </>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default PopupListDokumen;
