
import { useState, useEffect } from "react";
import api from "../services/api";
import ApplicationCard from "../components/ApplicationCard";

const COLUMNS = ["APPLIED", "SCREENING", "INTERVIEW", "TECHNICAL", "OFFER", "REJECTED"];

const COL_META = {
  APPLIED:   { label: "Applied",   icon: "📤", color: "#4B8BFF" },
  SCREENING: { label: "Screening", icon: "🔍", color: "#FFC400" },
  INTERVIEW: { label: "Interview", icon: "🗣",  color: "#7DF9C2" },
  TECHNICAL: { label: "Technical", icon: "💻", color: "#B46FFF" },
  OFFER:     { label: "Offer",     icon: "🎉", color: "#00E5A0" },
  REJECTED:  { label: "Rejected",  icon: "✕",  color: "#FF6B6B" },
};

function AddAppModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    companyName: "", jobTitle: "", location: "", salaryRange: "",
    jobType: "Full-time", jobUrl: "", notes: "",
    applicationDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.companyName || !form.jobTitle) {
      setError("Company name and job title are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/applications", form);
      onAdd(res.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .modal-bd{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
        .modal-bx{background:#13131F;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:28px;width:100%;max-width:480px;font-family:'DM Sans',sans-serif;animation:mdin .2s ease;max-height:90vh;overflow-y:auto;}
        @keyframes mdin{from{opacity:0;transform:scale(0.96)translateY(8px)}to{opacity:1;transform:none}}
        .modal-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#F0EDE8;margin-bottom:20px;}
        .modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:480px){.modal-grid{grid-template-columns:1fr;}}
        .modal-row{margin-bottom:0;}
        .modal-lbl{font-size:11px;font-weight:700;color:rgba(240,237,232,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:block;}
        .modal-inp,.modal-sel{width:100%;padding:10px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;transition:border-color .15s;box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .modal-inp:focus,.modal-sel:focus{border-color:rgba(125,249,194,0.4);}
        .modal-sel option{background:#13131F;}
        .modal-textarea{width:100%;padding:10px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;resize:vertical;min-height:70px;box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .modal-textarea:focus{border-color:rgba(125,249,194,0.4);}
        .modal-err{color:#FF6B6B;font-size:12px;margin-top:12px;font-weight:500;}
        .modal-ft{display:flex;gap:10px;margin-top:20px;}
        .modal-btn{flex:1;padding:10px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;border:1px solid;}
        .modal-btn-p{background:rgba(125,249,194,0.12);border-color:rgba(125,249,194,0.35);color:#7DF9C2;}
        .modal-btn-p:hover:not(:disabled){background:rgba(125,249,194,0.2);}
        .modal-btn-p:disabled{opacity:0.5;cursor:not-allowed;}
        .modal-btn-c{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:rgba(240,237,232,0.5);}
        .modal-btn-c:hover{background:rgba(255,255,255,0.08);}
      `}</style>
      <div className="modal-bd" onClick={onClose}>
        <div className="modal-bx" onClick={e => e.stopPropagation()}>
          <div className="modal-title">+ Add Application</div>
          <div className="modal-grid">
            {[
              ["companyName","Company Name *"],
              ["jobTitle","Job Title *"],
              ["location","Location"],
              ["salaryRange","Salary Range"],
              ["jobUrl","Job URL"],
              ["applicationDate","Application Date"],
            ].map(([k, lbl]) => (
              <div className="modal-row" key={k}>
                <label className="modal-lbl">{lbl}</label>
                <input
                  className="modal-inp"
                  type={k === "applicationDate" ? "date" : "text"}
                  value={form[k]}
                  onChange={e => set(k, e.target.value)}
                  placeholder={lbl.replace(" *","")}
                />
              </div>
            ))}
            <div className="modal-row">
              <label className="modal-lbl">Job Type</label>
              <select className="modal-sel" value={form.jobType} onChange={e => set("jobType", e.target.value)}>
                {["Full-time","Part-time","Contract","Internship","Freelance"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <label className="modal-lbl">Notes</label>
            <textarea className="modal-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any notes about this application..." />
          </div>
          {error && <div className="modal-err">⚠ {error}</div>}
          <div className="modal-ft">
            <button className="modal-btn modal-btn-c" onClick={onClose}>Cancel</button>
            <button className="modal-btn modal-btn-p" onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding…" : "Add Application"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function JobApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragId, setDragId] = useState(null);

  // Fetch all applications on mount
  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/applications");
      setApps(res.data);
    } catch (e) {
      setError("Failed to load applications. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Map backend fields to card display fields
  const mapApp = (app) => ({
    id: app.id,
    role: app.jobTitle,
    company: app.companyName,
    location: app.location,
    salary: app.salaryRange,
    type: app.jobType,
    status: app.status || "APPLIED",
    appliedDate: app.applicationDate,
    jobUrl: app.jobUrl,
    notes: app.notes,
  });

  const byStatus = (s) => apps.filter(a => (a.status || "APPLIED") === s);

  const moveApp = async (id, newStatus) => {
    // Optimistic update
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
    } catch (e) {
      // Revert on failure
      fetchApps();
    }
  };

  const deleteApp = async (id) => {
    setApps(prev => prev.filter(a => a.id !== id));
    try {
      await api.delete(`/applications/${id}`);
    } catch (e) {
      fetchApps();
    }
  };

  const handleAdd = (newApp) => {
    setApps(prev => [newApp, ...prev]);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (dragId) { moveApp(dragId, status); setDragId(null); }
  };

  const totalActive = apps.filter(a => !["REJECTED", "OFFER"].includes(a.status)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        .ja-page{min-height:100vh;background:#0C0C14;padding:80px 24px 40px;font-family:'DM Sans',sans-serif;}
        .ja-header{max-width:1400px;margin:0 auto 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
        .ja-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#F0EDE8;letter-spacing:-0.5px;}
        .ja-stats{display:flex;gap:20px;}
        .ja-stat{text-align:center;}
        .ja-stat-num{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;color:#7DF9C2;}
        .ja-stat-lbl{font-size:11px;color:rgba(240,237,232,0.4);text-transform:uppercase;letter-spacing:0.5px;}
        .ja-add-btn{padding:9px 20px;border-radius:10px;background:rgba(125,249,194,0.1);border:1px solid rgba(125,249,194,0.3);color:#7DF9C2;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;}
        .ja-add-btn:hover{background:rgba(125,249,194,0.18);}
        .ja-board{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(6,1fr);gap:14px;overflow-x:auto;padding-bottom:12px;}
        @media(max-width:1100px){.ja-board{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:700px){.ja-board{grid-template-columns:repeat(2,1fr);}}
        .ja-col{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:14px;min-height:300px;transition:background .15s;}
        .ja-col.dragover{background:rgba(125,249,194,0.04);border-color:rgba(125,249,194,0.2);}
        .ja-col-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .ja-col-name{display:flex;align-items:center;gap:6px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;}
        .ja-col-count{font-family:'DM Mono',monospace;font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,0.07);color:rgba(240,237,232,0.5);}
        .ja-col-cards{display:flex;flex-direction:column;gap:8px;}
        .ja-empty{padding:20px;text-align:center;font-size:12px;color:rgba(240,237,232,0.2);border:1px dashed rgba(255,255,255,0.07);border-radius:10px;}
        .ja-loading{max-width:1400px;margin:0 auto;text-align:center;padding:60px;color:rgba(240,237,232,0.4);font-size:14px;}
        .ja-error{max-width:1400px;margin:0 auto;padding:20px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:12px;color:#FF6B6B;font-size:13px;display:flex;align-items:center;justify-content:space-between;}
        .ja-retry{background:none;border:1px solid rgba(255,107,107,0.4);color:#FF6B6B;padding:5px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-family:'Syne',sans-serif;font-weight:700;}
        .ja-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(125,249,194,0.2);border-top-color:#7DF9C2;border-radius:50%;animation:spin .7s linear infinite;margin-right:8px;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="ja-page">
        <div className="ja-header">
          <div className="ja-title">Job Applications</div>
          <div className="ja-stats">
            <div className="ja-stat">
              <div className="ja-stat-num">{apps.length}</div>
              <div className="ja-stat-lbl">Total</div>
            </div>
            <div className="ja-stat">
              <div className="ja-stat-num">{totalActive}</div>
              <div className="ja-stat-lbl">Active</div>
            </div>
            <div className="ja-stat">
              <div className="ja-stat-num" style={{color:"#00E5A0"}}>
                {apps.filter(a => a.status === "OFFER").length}
              </div>
              <div className="ja-stat-lbl">Offers</div>
            </div>
          </div>
          <button className="ja-add-btn" onClick={() => setShowModal(true)}>+ Add Application</button>
        </div>

        {loading && (
          <div className="ja-loading">
            <span className="ja-spinner" />Loading applications…
          </div>
        )}

        {error && (
          <div className="ja-error">
            <span>⚠ {error}</span>
            <button className="ja-retry" onClick={fetchApps}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="ja-board">
            {COLUMNS.map(col => {
              const meta = COL_META[col];
              const cards = byStatus(col);
              return (
                <div key={col} className="ja-col"
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
                  onDragLeave={e => e.currentTarget.classList.remove("dragover")}
                  onDrop={e => { e.currentTarget.classList.remove("dragover"); handleDrop(e, col); }}
                >
                  <div className="ja-col-header">
                    <div className="ja-col-name" style={{color: meta.color}}>
                      {meta.icon} {meta.label}
                    </div>
                    <span className="ja-col-count">{cards.length}</span>
                  </div>
                  <div className="ja-col-cards">
                    {cards.length === 0
                      ? <div className="ja-empty">Drop here</div>
                      : cards.map(app => (
                          <div key={app.id} draggable
                            onDragStart={() => setDragId(app.id)}
                            onDragEnd={() => setDragId(null)}>
                            <ApplicationCard
                              app={mapApp(app)}
                              onDelete={deleteApp}
                              onMove={moveApp}
                              allStatuses={COLUMNS}
                            />
                          </div>
                        ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddAppModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}