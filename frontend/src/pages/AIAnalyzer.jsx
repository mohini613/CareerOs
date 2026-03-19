
import { useState, useEffect } from "react";
import api from "../services/api";
import AnalysisResult from "../components/AnalysisResult";

function ScoreRing({ score }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#7DF9C2" : score >= 50 ? "#FFC400" : "#FF6B6B";
  return (
    <div style={{ position:"relative", width:110, height:110, flexShrink:0 }}>
      <svg width="110" height="110" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition:"stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:10, color:"rgba(240,237,232,0.4)", letterSpacing:"0.5px", textTransform:"uppercase" }}>match</div>
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  // Parse comma-separated strings from backend
  const parse = (str) => str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
  const strengths   = parse(result.strengths);
  const weaknesses  = parse(result.weaknesses);
  const suggestions = parse(result.suggestions);
  const keywords    = parse(result.missingKeywords);
  const score       = result.matchScore ?? 0;
  const color       = score >= 75 ? "#7DF9C2" : score >= 50 ? "#FFC400" : "#FF6B6B";

  return (
    <div style={{ animation:"ar-in 0.4s ease both", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes ar-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {/* Score header */}
      <div style={{ display:"flex", alignItems:"center", gap:24, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, marginBottom:16 }}>
        <ScoreRing score={score} />
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#F0EDE8", marginBottom:4 }}>
            {score >= 80 ? "Excellent Match" : score >= 60 ? "Good Match" : score >= 40 ? "Moderate Match" : "Low Match"}
          </div>
          <div style={{ fontSize:13, color:"rgba(240,237,232,0.45)" }}>
            Your resume matches <strong style={{ color }}>{score}%</strong> of the job requirements.
          </div>
          {result.jobTitle && (
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.3)", marginTop:4, fontFamily:"'DM Mono',monospace" }}>
              {result.jobTitle}{result.companyName ? ` @ ${result.companyName}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* Full AI analysis */}
      {result.fullAnalysis && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18, marginBottom:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"rgba(240,237,232,0.4)", marginBottom:10 }}>
            Full Analysis
          </div>
          <div style={{ fontSize:13, color:"rgba(240,237,232,0.7)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
            {result.fullAnalysis}
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        {/* Strengths */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"#7DF9C2", marginBottom:10 }}>✓ Strengths</div>
          {strengths.length > 0
            ? strengths.map((s,i) => <div key={i} style={{ fontSize:13, color:"rgba(240,237,232,0.75)", marginBottom:6, display:"flex", gap:8 }}><span style={{ color:"#7DF9C2", flexShrink:0 }}>●</span>{s}</div>)
            : <div style={{ fontSize:12, color:"rgba(240,237,232,0.25)" }}>None identified</div>}
        </div>

        {/* Weaknesses */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"#FF6B6B", marginBottom:10 }}>✗ Gaps</div>
          {weaknesses.length > 0
            ? weaknesses.map((w,i) => <div key={i} style={{ fontSize:13, color:"rgba(240,237,232,0.75)", marginBottom:6, display:"flex", gap:8 }}><span style={{ color:"#FF6B6B", flexShrink:0 }}>●</span>{w}</div>)
            : <div style={{ fontSize:12, color:"rgba(240,237,232,0.25)" }}>No significant gaps</div>}
        </div>
      </div>

      {/* Missing keywords */}
      {keywords.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18, marginBottom:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"#4B8BFF", marginBottom:10 }}>◈ Missing Keywords</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {keywords.map((k,i) => (
              <span key={i} style={{ fontFamily:"'DM Mono',monospace", fontSize:11, padding:"3px 9px", borderRadius:6, background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.25)", color:"#FF9B9B" }}>{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"#FFC400", marginBottom:12 }}>✦ Suggestions</div>
          {suggestions.map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"10px", borderRadius:8, background:"rgba(125,249,194,0.04)", border:"1px solid rgba(125,249,194,0.1)", marginBottom:8 }}>
              <span style={{ flexShrink:0, color:"#7DF9C2" }}>→</span>
              <span style={{ fontSize:13, color:"rgba(240,237,232,0.75)", lineHeight:1.5 }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EXAMPLE_JD = `We're looking for a Senior Frontend Engineer.

Requirements:
- 4+ years of experience with React and TypeScript
- Strong knowledge of Node.js and RESTful APIs
- Experience with PostgreSQL or similar databases
- Familiarity with Docker and AWS
- Excellent problem-solving and communication skills`;

export default function AIAnalyzer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchResumes(); fetchHistory(); }, []);

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const res = await api.get("/resumes");
      setResumes(res.data);
      if (res.data.length > 0) setSelectedResumeId(res.data[0].id);
    } catch { setResumes([]); }
    finally { setLoadingResumes(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/resumes/analysis/all");
      setHistory(res.data.slice(0, 5));
    } catch { setHistory([]); }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) { setError("Please select a resume first."); return; }
    if (!jd.trim() || jd.trim().length < 50) { setError("Please paste a complete job description (at least 50 characters)."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post(`/resumes/${selectedResumeId}/analyze`, {
        jobDescription: jd,
        jobTitle: jobTitle || null,
        companyName: companyName || null,
      });
      setResult(res.data);
      fetchHistory();
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Make sure your AI service is configured.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        .aa{min-height:100vh;background:#0C0C14;padding:80px 24px 40px;font-family:'DM Sans',sans-serif;}
        .aa-inner{max-width:840px;margin:0 auto;}
        .aa-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#F0EDE8;letter-spacing:-0.5px;margin-bottom:4px;}
        .aa-sub{font-size:13px;color:rgba(240,237,232,0.4);margin-bottom:28px;}
        .aa-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px;margin-bottom:14px;}
        .aa-label{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:rgba(240,237,232,0.4);margin-bottom:8px;display:block;}
        .aa-select,.aa-input{width:100%;padding:10px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;transition:border-color .15s;box-sizing:border-box;font-family:'DM Sans',sans-serif;}
        .aa-select:focus,.aa-input:focus{border-color:rgba(125,249,194,0.4);}
        .aa-select option{background:#13131F;}
        .aa-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}
        @media(max-width:540px){.aa-grid{grid-template-columns:1fr;}}
        .aa-textarea{width:100%;min-height:180px;padding:14px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#F0EDE8;font-size:13px;font-family:'DM Mono',monospace;resize:vertical;outline:none;transition:border-color .15s;box-sizing:border-box;line-height:1.6;}
        .aa-textarea:focus{border-color:rgba(125,249,194,0.35);}
        .aa-textarea::placeholder{color:rgba(240,237,232,0.2);}
        .aa-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .aa-example{font-size:12px;font-weight:600;padding:4px 11px;border-radius:7px;background:rgba(75,139,255,0.1);border:1px solid rgba(75,139,255,0.25);color:#7EB5FF;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;}
        .aa-example:hover{background:rgba(75,139,255,0.18);}
        .aa-footer{display:flex;align-items:center;justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:10px;}
        .aa-char{font-family:'DM Mono',monospace;font-size:11px;color:rgba(240,237,232,0.25);}
        .aa-error{font-size:12px;color:#FF6B6B;font-weight:500;}
        .aa-analyze{padding:10px 26px;border-radius:10px;font-size:14px;font-weight:700;background:linear-gradient(135deg,rgba(125,249,194,0.15),rgba(75,139,255,0.15));border:1px solid rgba(125,249,194,0.35);color:#7DF9C2;cursor:pointer;font-family:'Syne',sans-serif;transition:all .2s;display:flex;align-items:center;gap:8px;}
        .aa-analyze:hover:not(:disabled){background:linear-gradient(135deg,rgba(125,249,194,0.22),rgba(75,139,255,0.22));transform:translateY(-1px);}
        .aa-analyze:disabled{opacity:0.5;cursor:not-allowed;}
        .aa-spinner{width:14px;height:14px;border:2px solid rgba(125,249,194,0.25);border-top-color:#7DF9C2;border-radius:50%;animation:aaspin .6s linear infinite;flex-shrink:0;}
        @keyframes aaspin{to{transform:rotate(360deg)}}
        .aa-no-resume{padding:20px;background:rgba(255,196,0,0.08);border:1px solid rgba(255,196,0,0.2);border-radius:12px;font-size:13px;color:#FFC400;text-align:center;}
        .aa-history{margin-top:32px;}
        .aa-history-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:rgba(240,237,232,0.35);margin-bottom:12px;}
        .aa-h-item{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:10px 14px;font-size:12px;margin-bottom:8px;}
        .aa-h-score{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;flex-shrink:0;}
        .aa-h-info{flex:1;overflow:hidden;}
        .aa-h-jd{color:rgba(240,237,232,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .aa-h-date{font-family:'DM Mono',monospace;color:rgba(240,237,232,0.25);font-size:11px;flex-shrink:0;}
      `}</style>

      <div className="aa">
        <div className="aa-inner">
          <div className="aa-title">✦ AI Job Analyzer</div>
          <div className="aa-sub">Select your resume, paste a job description → get your match score and AI suggestions</div>

          {/* Resume selector */}
          <div className="aa-card">
            <label className="aa-label">1. Select Resume</label>
            {loadingResumes ? (
              <div style={{ fontSize:13, color:"rgba(240,237,232,0.4)" }}>Loading resumes…</div>
            ) : resumes.length === 0 ? (
              <div className="aa-no-resume">
                ⚠ No resumes uploaded yet.{" "}
                <a href="/resumes" style={{ color:"#FFC400", fontWeight:700 }}>Upload one first →</a>
              </div>
            ) : (
              <select className="aa-select" value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            )}

            <div className="aa-grid">
              <div>
                <label className="aa-label" style={{ marginTop:12 }}>Job Title (optional)</label>
                <input className="aa-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div>
                <label className="aa-label" style={{ marginTop:12 }}>Company (optional)</label>
                <input className="aa-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google" />
              </div>
            </div>
          </div>

          {/* JD input */}
          <div className="aa-card">
            <div className="aa-row">
              <label className="aa-label" style={{ margin:0 }}>2. Paste Job Description</label>
              <button className="aa-example" onClick={() => { setJd(EXAMPLE_JD); setJobTitle("Senior Frontend Engineer"); setCompanyName("Example Corp"); }}>
                Load Example
              </button>
            </div>
            <textarea
              className="aa-textarea"
              placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and tech stack for best results."
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
            <div className="aa-footer">
              <div>
                <span className="aa-char">{jd.length} chars</span>
                {error && <span className="aa-error" style={{ marginLeft:12 }}>⚠ {error}</span>}
              </div>
              <button className="aa-analyze" onClick={handleAnalyze} disabled={loading || resumes.length === 0}>
                {loading ? <><div className="aa-spinner" /> Analyzing…</> : <>✦ Analyze Match</>}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && <ResultCard result={result} />}

          {/* History */}
          {history.length > 0 && (
            <div className="aa-history">
              <div className="aa-history-title">Recent Analyses</div>
              {history.map(h => (
                <div key={h.id} className="aa-h-item">
                  <span className="aa-h-score" style={{ color: h.matchScore >= 70 ? "#7DF9C2" : h.matchScore >= 50 ? "#FFC400" : "#FF6B6B" }}>
                    {h.matchScore ?? "—"}%
                  </span>
                  <div className="aa-h-info">
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:"rgba(240,237,232,0.7)", marginBottom:2 }}>
                      {h.jobTitle || "Untitled"}{h.companyName ? ` @ ${h.companyName}` : ""}
                    </div>
                    <div className="aa-h-jd">{h.jobDescription?.slice(0, 80)}…</div>
                  </div>
                  <span className="aa-h-date">
                    {h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}