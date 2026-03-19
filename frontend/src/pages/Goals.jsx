
import { useState, useEffect } from "react";
import api from "../services/api";
import GoalCard from "../components/GoalCard";

const GOAL_TYPES = [
  "Role_Change", "Skill_Development", "Promotion",
  "Industry_Switch", "Salary_Increase", "Other"
];

const GOAL_TYPE_LABELS = {
  Role_Change:       "Role Change",
  Skill_Development: "Skill Development",
  Promotion:         "Promotion",
  Industry_Switch:   "Industry Switch",
  Salary_Increase:   "Salary Increase",
  Other:             "Other",
};

function AddGoalModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    goalType: "Role_Change", targetRole: "", targetCompany: "",
    targetIndustry: "", targetSalaryMin: "", targetSalaryMax: "",
    targetDate: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.goalType) { setError("Goal type is required."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        targetSalaryMin: form.targetSalaryMin ? Number(form.targetSalaryMin) : null,
        targetSalaryMax: form.targetSalaryMax ? Number(form.targetSalaryMax) : null,
        targetDate: form.targetDate || null,
      };
      const res = await api.post("/goals", payload);
      onAdd(res.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create goal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .gm-bd{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
        .gm-bx{background:#13131F;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:28px;width:100%;max-width:480px;font-family:'DM Sans',sans-serif;animation:gmin .2s ease;max-height:90vh;overflow-y:auto;}
        @keyframes gmin{from{opacity:0;transform:scale(0.96)translateY(8px)}to{opacity:1;transform:none}}
        .gm-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#F0EDE8;margin-bottom:20px;}
        .gm-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(max-width:480px){.gm-grid{grid-template-columns:1fr;}}
        .gm-lbl{font-size:11px;font-weight:700;color:rgba(240,237,232,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:block;}
        .gm-inp,.gm-sel{width:100%;padding:10px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;transition:border-color .15s;box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .gm-inp:focus,.gm-sel:focus{border-color:rgba(125,249,194,0.4);}
        .gm-sel option{background:#13131F;}
        .gm-textarea{width:100%;padding:10px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;resize:vertical;min-height:70px;box-sizing:border-box;font-family:'DM Sans',sans-serif;line-height:1.5;}
        .gm-textarea:focus{border-color:rgba(125,249,194,0.4);}
        .gm-err{color:#FF6B6B;font-size:12px;margin-top:12px;font-weight:500;}
        .gm-ft{display:flex;gap:10px;margin-top:20px;}
        .gm-btn{flex:1;padding:10px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;border:1px solid;}
        .gm-btn-p{background:rgba(125,249,194,0.12);border-color:rgba(125,249,194,0.35);color:#7DF9C2;}
        .gm-btn-p:hover:not(:disabled){background:rgba(125,249,194,0.2);}
        .gm-btn-p:disabled{opacity:0.5;cursor:not-allowed;}
        .gm-btn-c{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:rgba(240,237,232,0.5);}
        .gm-btn-c:hover{background:rgba(255,255,255,0.08);}
      `}</style>
      <div className="gm-bd" onClick={onClose}>
        <div className="gm-bx" onClick={e => e.stopPropagation()}>
          <div className="gm-title">+ New Career Goal</div>
          <div style={{marginBottom:12}}>
            <label className="gm-lbl">Goal Type *</label>
            <select className="gm-sel" value={form.goalType} onChange={e => set("goalType", e.target.value)}>
              {GOAL_TYPES.map(t => <option key={t} value={t}>{GOAL_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="gm-grid">
            {[
              ["targetRole","Target Role"],
              ["targetCompany","Target Company"],
              ["targetIndustry","Target Industry"],
              ["targetDate","Target Date"],
              ["targetSalaryMin","Min Salary"],
              ["targetSalaryMax","Max Salary"],
            ].map(([k, lbl]) => (
              <div key={k}>
                <label className="gm-lbl">{lbl}</label>
                <input className="gm-inp"
                  type={k === "targetDate" ? "date" : k.includes("Salary") ? "number" : "text"}
                  value={form[k]} onChange={e => set(k, e.target.value)}
                  placeholder={lbl} />
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}>
            <label className="gm-lbl">Description</label>
            <textarea className="gm-textarea" value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe your goal..." />
          </div>
          {error && <div className="gm-err">⚠ {error}</div>}
          <div className="gm-ft">
            <button className="gm-btn gm-btn-c" onClick={onClose}>Cancel</button>
            <button className="gm-btn gm-btn-p" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating…" : "Create Goal"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Map backend response → GoalCard props
function mapGoal(g) {
  return {
    id: g.id,
    title: g.targetRole || GOAL_TYPE_LABELS[g.goalType] || g.goalType,
    description: g.description,
    priority: g.status === "COMPLETED" ? "LOW" : g.targetDate
      ? new Date(g.targetDate) < new Date(Date.now() + 30 * 86400000) ? "HIGH" : "MEDIUM"
      : "MEDIUM",
    category: GOAL_TYPE_LABELS[g.goalType] || g.goalType,
    progress: g.progressPercentage ?? 0,
    deadline: g.targetDate,
    status: g.status,
    targetCompany: g.targetCompany,
    targetSalaryMin: g.targetSalaryMin,
    targetSalaryMax: g.targetSalaryMax,
  };
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (e) {
      setError("Failed to load goals. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newGoal) => setGoals(prev => [newGoal, ...prev]);

  const handleUpdate = async (updated) => {
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === updated.id ? { ...g, progressPercentage: updated.progress } : g));
    try {
      await api.patch(`/goals/${updated.id}/progress`, { progressPercentage: updated.progress });
    } catch (e) {
      fetchGoals();
    }
  };

  const handleDelete = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await api.delete(`/goals/${id}`);
    } catch (e) {
      fetchGoals();
    }
  };

  const categories = ["ALL", ...new Set(goals.map(g => GOAL_TYPE_LABELS[g.goalType] || g.goalType))];
  const filtered = filter === "ALL" ? goals : goals.filter(g => (GOAL_TYPE_LABELS[g.goalType] || g.goalType) === filter);

  const done = goals.filter(g => (g.progressPercentage ?? 0) >= 100).length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + (g.progressPercentage ?? 0), 0) / goals.length)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        .gp{min-height:100vh;background:#0C0C14;padding:80px 24px 40px;font-family:'DM Sans',sans-serif;}
        .gp-inner{max-width:960px;margin:0 auto;}
        .gp-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px;}
        .gp-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#F0EDE8;letter-spacing:-0.5px;margin-bottom:4px;}
        .gp-sub{font-size:13px;color:rgba(240,237,232,0.4);}
        .gp-stats{display:flex;gap:24px;align-items:center;flex-wrap:wrap;}
        .gp-stat{text-align:center;}
        .gp-stat-num{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;}
        .gp-stat-lbl{font-size:11px;color:rgba(240,237,232,0.4);text-transform:uppercase;letter-spacing:0.5px;}
        .gp-add{padding:9px 20px;border-radius:10px;background:rgba(125,249,194,0.1);border:1px solid rgba(125,249,194,0.3);color:#7DF9C2;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;}
        .gp-add:hover{background:rgba(125,249,194,0.18);}
        .gp-overall{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;margin-bottom:24px;}
        .gp-overall-label{display:flex;justify-content:space-between;font-size:13px;color:rgba(240,237,232,0.5);margin-bottom:8px;}
        .gp-overall-pct{font-family:'DM Mono',monospace;font-weight:500;color:#7DF9C2;}
        .gp-bar-track{height:8px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
        .gp-bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#4B8BFF,#7DF9C2);transition:width .8s cubic-bezier(0.34,1.56,0.64,1);}
        .gp-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:24px;}
        .gp-filter{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(240,237,232,0.5);cursor:pointer;transition:all .15s;font-family:'Syne',sans-serif;}
        .gp-filter:hover{border-color:rgba(255,255,255,0.2);color:rgba(240,237,232,0.8);}
        .gp-filter.active{background:rgba(125,249,194,0.1);border-color:rgba(125,249,194,0.35);color:#7DF9C2;}
        .gp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
        .gp-empty{text-align:center;padding:60px;color:rgba(240,237,232,0.25);font-size:14px;}
        .gp-loading{text-align:center;padding:60px;color:rgba(240,237,232,0.4);font-size:14px;}
        .gp-error{padding:20px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:12px;color:#FF6B6B;font-size:13px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
        .gp-retry{background:none;border:1px solid rgba(255,107,107,0.4);color:#FF6B6B;padding:5px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-family:'Syne',sans-serif;font-weight:700;}
        .gp-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(125,249,194,0.2);border-top-color:#7DF9C2;border-radius:50%;animation:gspin .7s linear infinite;margin-right:8px;}
        @keyframes gspin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="gp">
        <div className="gp-inner">
          <div className="gp-header">
            <div>
              <div className="gp-title">Career Goals</div>
              <div className="gp-sub">{done} of {goals.length} goals completed</div>
            </div>
            <div className="gp-stats">
              <div className="gp-stat">
                <div className="gp-stat-num" style={{color:"#7DF9C2"}}>{done}</div>
                <div className="gp-stat-lbl">Done</div>
              </div>
              <div className="gp-stat">
                <div className="gp-stat-num" style={{color:"#FFC400"}}>{goals.length - done}</div>
                <div className="gp-stat-lbl">In Progress</div>
              </div>
              <div className="gp-stat">
                <div className="gp-stat-num" style={{color:"#4B8BFF"}}>{avgProgress}%</div>
                <div className="gp-stat-lbl">Avg Progress</div>
              </div>
            </div>
            <button className="gp-add" onClick={() => setShowModal(true)}>+ New Goal</button>
          </div>

          {error && (
            <div className="gp-error">
              <span>⚠ {error}</span>
              <button className="gp-retry" onClick={fetchGoals}>Retry</button>
            </div>
          )}

          <div className="gp-overall">
            <div className="gp-overall-label">
              <span>Overall Progress</span>
              <span className="gp-overall-pct">{avgProgress}%</span>
            </div>
            <div className="gp-bar-track">
              <div className="gp-bar-fill" style={{width:`${avgProgress}%`}} />
            </div>
          </div>

          <div className="gp-filters">
            {categories.map(c => (
              <button key={c} className={`gp-filter${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>

          {loading
            ? <div className="gp-loading"><span className="gp-spinner" />Loading goals…</div>
            : filtered.length === 0
              ? <div className="gp-empty">
                  {goals.length === 0
                    ? "No goals yet. Add your first career goal!"
                    : "No goals in this category."}
                </div>
              : <div className="gp-grid">
                  {filtered.map(g => (
                    <GoalCard
                      key={g.id}
                      goal={mapGoal(g)}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
          }
        </div>
      </div>

      {showModal && (
        <AddGoalModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}