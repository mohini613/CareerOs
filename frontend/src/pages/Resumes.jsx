import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const TYPE_META = {
  "application/pdf": { label: "PDF", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)", icon: "📄" },
  "application/msword": { label: "DOC", color: "#4B8BFF", bg: "rgba(75,139,255,0.1)", icon: "📝" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "DOCX", color: "#4B8BFF", bg: "rgba(75,139,255,0.1)", icon: "📝" },
};

function getTypeMeta(contentType) {
  return TYPE_META[contentType] || { label: "FILE", color: "#A0A0A0", bg: "rgba(160,160,160,0.1)", icon: "📎" };
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Drag & Drop Uploader ────────────────────────────────────────────────────
function ResumeUploader({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setError("Only PDF or Word documents (.pdf, .doc, .docx) are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <>
      <style>{`
        .ru-zone{border:2px dashed rgba(125,249,194,0.25);border-radius:16px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .2s ease;background:rgba(125,249,194,0.02);position:relative;overflow:hidden;}
        .ru-zone::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(125,249,194,0.05) 0%,transparent 70%);pointer-events:none;}
        .ru-zone.drag{border-color:#7DF9C2;background:rgba(125,249,194,0.06);transform:scale(1.01);box-shadow:0 0 32px rgba(125,249,194,0.1);}
        .ru-zone.upl{cursor:default;opacity:0.8;}
        .ru-icon{font-size:40px;margin-bottom:14px;display:block;}
        .ru-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#F0EDE8;margin-bottom:6px;}
        .ru-sub{font-size:13px;color:rgba(240,237,232,0.4);margin-bottom:18px;}
        .ru-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 22px;border-radius:9px;background:rgba(125,249,194,0.1);border:1px solid rgba(125,249,194,0.3);color:#7DF9C2;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;}
        .ru-btn:hover{background:rgba(125,249,194,0.18);border-color:rgba(125,249,194,0.5);}
        .ru-limit{font-size:11px;color:rgba(240,237,232,0.25);margin-top:10px;}
        .ru-error{color:#FF6B6B;font-size:12px;margin-top:10px;font-weight:500;}
        .ru-spinner{display:inline-block;width:20px;height:20px;border:2px solid rgba(125,249,194,0.2);border-top-color:#7DF9C2;border-radius:50%;animation:ruspin .7s linear infinite;margin-bottom:10px;}
        @keyframes ruspin{to{transform:rotate(360deg)}}
        .ru-upl-text{font-size:14px;color:#7DF9C2;font-weight:600;font-family:'Syne',sans-serif;}
      `}</style>
      <div
        className={`ru-zone${dragging ? " drag" : ""}${uploading ? " upl" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <div className="ru-spinner" />
            <div className="ru-upl-text">Uploading to S3…</div>
          </>
        ) : (
          <>
            <span className="ru-icon">📄</span>
            <div className="ru-title">Drop your resume here</div>
            <div className="ru-sub">PDF or Word document · max 5 MB</div>
            <button className="ru-btn" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
              ↑ Browse Files
            </button>
            <div className="ru-limit">Supported: .pdf · .doc · .docx</div>
            {error && <div className="ru-error">⚠ {error}</div>}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
        style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
    </>
  );
}

// ── Resume Row ──────────────────────────────────────────────────────────────
function ResumeRow({ resume, onDelete, onView }) {
  const meta = getTypeMeta(resume.contentType);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resume.filename}"?`)) return;
    setDeleting(true);
    await onDelete(resume.id);
  };

  return (
    <>
      <style>{`
        .rr-row{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 18px;transition:all .15s;font-family:'DM Sans',sans-serif;}
        .rr-row:hover{border-color:rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);}
        .rr-icon{font-size:28px;flex-shrink:0;}
        .rr-info{flex:1;min-width:0;}
        .rr-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#F0EDE8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
        .rr-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
        .rr-badge{font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px;}
        .rr-date{font-family:'DM Mono',monospace;font-size:11px;color:rgba(240,237,232,0.35);}
        .rr-size{font-size:11px;color:rgba(240,237,232,0.35);}
        .rr-actions{display:flex;gap:6px;flex-shrink:0;}
        .rr-btn{padding:5px 11px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid;font-family:'Syne',sans-serif;transition:all .15s;}
        .rr-btn-view{background:rgba(75,139,255,0.07);border-color:rgba(75,139,255,0.2);color:#7EB5FF;}
        .rr-btn-view:hover{background:rgba(75,139,255,0.15);border-color:rgba(75,139,255,0.4);}
        .rr-btn-del{background:rgba(255,107,107,0.06);border-color:rgba(255,107,107,0.15);color:rgba(255,107,107,0.6);}
        .rr-btn-del:hover:not(:disabled){background:rgba(255,107,107,0.15);border-color:rgba(255,107,107,0.35);color:#FF6B6B;}
        .rr-btn-del:disabled{opacity:0.4;cursor:not-allowed;}
      `}</style>
      <div className="rr-row">
        <div className="rr-icon">{meta.icon}</div>
        <div className="rr-info">
          <div className="rr-name">{resume.filename}</div>
          <div className="rr-meta">
            <span className="rr-badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
            <span className="rr-size">{formatSize(resume.fileSize)}</span>
            <span className="rr-date">{formatDate(resume.uploadedAt)}</span>
          </div>
        </div>
        <div className="rr-actions">
          {resume.url && (
            <a href={resume.url} target="_blank" rel="noreferrer">
              <button className="rr-btn rr-btn-view">View</button>
            </a>
          )}
          <button className="rr-btn rr-btn-del" onClick={handleDelete} disabled={deleting}>
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Resumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Autofill states
  const [showAutofillPrompt, setShowAutofillPrompt] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/resumes");
      setResumes(res.data);
    } catch (e) {
      setError("Failed to load resumes. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (newResume) => {
    setResumes(prev => [newResume, ...prev]);
    setUploadedResume({ id: newResume.id, filename: newResume.filename });
    setShowAutofillPrompt(true);
  };

  const handleAutofill = async () => {
    if (!uploadedResume?.id) return;
    setShowAutofillPrompt(false);
    setAutofilling(true);
    try {
      await api.post(`/profile/autofill?resumeId=${uploadedResume.id}`, null, {
        timeout: 200000,
      });
      setAutofillSuccess(true);
    } catch (e) {
      if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
        alert("Failed to extract profile details from resume: request timed out. The AI service is taking longer than expected. Please try again.");
      } else {
        alert(e.response?.data?.message || "Autofill failed. Please try again.");
      }
    } finally {
      setAutofilling(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert("Failed to delete resume.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');
        .rp{min-height:100vh;background:#0C0C14;padding:80px 24px 40px;font-family:'DM Sans',sans-serif;}
        .rp-inner{max-width:760px;margin:0 auto;}
        .rp-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:4px;}
        .rp-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#F0EDE8;letter-spacing:-0.5px;}
        .rp-sub{font-size:13px;color:rgba(240,237,232,0.4);margin-bottom:28px;}
        .rp-section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:rgba(240,237,232,0.4);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
        .rp-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
        .rp-list{display:flex;flex-direction:column;gap:10px;}
        .rp-empty{text-align:center;padding:40px;color:rgba(240,237,232,0.25);font-size:14px;}
        .rp-loading{text-align:center;padding:40px;color:rgba(240,237,232,0.4);font-size:14px;}
        .rp-error{padding:16px 18px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:12px;color:#FF6B6B;font-size:13px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
        .rp-retry{background:none;border:1px solid rgba(255,107,107,0.4);color:#FF6B6B;padding:5px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-family:'Syne',sans-serif;font-weight:700;}
        .rp-count{font-family:'DM Mono',monospace;font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,0.07);color:rgba(240,237,232,0.4);}
        .rp-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(125,249,194,0.2);border-top-color:#7DF9C2;border-radius:50%;animation:rpspin .7s linear infinite;margin-right:8px;}
        @keyframes rpspin{to{transform:rotate(360deg)}}

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(12, 12, 20, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          animation: fadeIn 0.25s ease-out;
        }
        .modal-content {
          background: #13131F;
          border: 1px solid rgba(125, 249, 194, 0.15);
          box-shadow: 0 0 40px rgba(125, 249, 194, 0.05), 0 20px 40px rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          padding: 32px;
          width: 90%;
          max-width: 440px;
          text-align: center;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #7DF9C2, #4B8BFF);
        }
        .modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: inline-block;
          animation: float 2s ease-in-out infinite;
        }
        .modal-icon-success {
          font-size: 32px;
          color: #7DF9C2;
          background: rgba(125, 249, 194, 0.1);
          border: 1px solid rgba(125, 249, 194, 0.3);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .modal-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #F0EDE8;
          margin-bottom: 12px;
        }
        .modal-text {
          font-size: 14px;
          color: rgba(240, 237, 232, 0.6);
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .modal-btn {
          flex: 1;
          padding: 11px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          transition: all 0.2s ease;
          border: 1px solid;
        }
        .modal-btn-cancel {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(240, 237, 232, 0.6);
        }
        .modal-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #F0EDE8;
        }
        .modal-btn-confirm {
          background: linear-gradient(135deg, rgba(125, 249, 194, 0.15) 0%, rgba(75, 139, 255, 0.1) 100%);
          border-color: rgba(125, 249, 194, 0.3);
          color: #7DF9C2;
        }
        .modal-btn-confirm:hover {
          background: linear-gradient(135deg, rgba(125, 249, 194, 0.25) 0%, rgba(75, 139, 255, 0.18) 100%);
          border-color: rgba(125, 249, 194, 0.5);
          box-shadow: 0 0 16px rgba(125, 249, 194, 0.15);
        }
        .modal-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(125, 249, 194, 0.1);
          border-top-color: #7DF9C2;
          border-radius: 50%;
          animation: modalSpin 0.8s linear infinite;
          margin: 0 auto 20px auto;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="rp">
        <div className="rp-inner">
          <button 
            onClick={() => window.history.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#7DF9C2] transition-colors group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="rp-header">
            <div className="rp-title">Resumes</div>
          </div>
          <div className="rp-sub">Upload and manage your resume versions · stored securely on S3</div>

          {error && (
            <div className="rp-error">
              <span>⚠ {error}</span>
              <button className="rp-retry" onClick={fetchResumes}>Retry</button>
            </div>
          )}

          <div className="rp-section-title">↑ Upload New Resume</div>
          <ResumeUploader onUpload={handleUpload} />

          <hr className="rp-divider" />

          <div className="rp-section-title">
            All Resumes <span className="rp-count">{resumes.length}</span>
          </div>

          {loading
            ? <div className="rp-loading"><span className="rp-spinner" />Loading resumes…</div>
            : resumes.length === 0
              ? <div className="rp-empty">No resumes uploaded yet. Upload your first one above!</div>
              : <div className="rp-list">
                  {resumes.map(r => (
                    <ResumeRow key={r.id} resume={r} onDelete={handleDelete} />
                  ))}
                </div>
          }
        </div>
      </div>

      {showAutofillPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">✨</span>
            <h3 className="modal-title">Autofill Profile?</h3>
            <p className="modal-text">
              Do you want to fill your profile section and skills in fill profile section using AI analysis of your uploaded resume "<strong>{uploadedResume?.filename}</strong>"?
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowAutofillPrompt(false)}>
                No, Thanks
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleAutofill}>
                Yes, Autofill
              </button>
            </div>
          </div>
        </div>
      )}

      {autofilling && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-spinner" />
            <h3 className="modal-title">Analyzing Resume...</h3>
            <p className="modal-text">
              Our AI is parsing your resume to extract skills, experience, and profile details. This might take a few seconds.
            </p>
          </div>
        </div>
      )}

      {autofillSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon-success">✓</span>
            <h3 className="modal-title">Autofill Complete!</h3>
            <p className="modal-text">
              Your profile details and skills have been successfully updated from your resume.
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setAutofillSuccess(false)}>
                Close
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={() => navigate("/profile")}>
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}