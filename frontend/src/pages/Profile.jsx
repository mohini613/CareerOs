import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SKILL_COLORS = ["#7DF9C2","#4B8BFF","#FFC400","#B46FFF","#FF6B6B","#00E5A0","#7EB5FF","#FFD166"];

function SkillTag({ skill, color, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px 4px 12px", borderRadius:7, fontSize:12, fontWeight:600, fontFamily:"'Syne',sans-serif", border:`1px solid ${color}44`, background:`${color}14`, color }}>
      {skill.skillName || skill.name || skill}
      {onRemove && (
        <button onClick={() => onRemove(skill)} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:"rgba(0,0,0,0.2)", border:"none", cursor:"pointer", fontSize:9, color:"inherit", padding:0 }}>✕</button>
      )}
    </span>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [draft, setDraft] = useState({
    currentTitle:"", currentCompany:"", industry:"", educationLevel:"",
    location:"", bio:"", linkdinUrl:"", githubUrl:"", portfolioUrl:"", currentSalary:""
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const profileRes = await api.get("/profile");
      const p = profileRes.data;
      setProfile(p);
      setDraft({
        currentTitle: p.currentTitle || "",
        currentCompany: p.currentCompany || "",
        industry: p.industry || "",
        educationLevel: p.educationLevel || "",
        location: p.location || "",
        bio: p.bio || "",
        linkdinUrl: p.linkedinUrl || "",
        githubUrl: p.githubUrl || "",
        portfolioUrl: p.portfolioUrl || "",
        currentSalary: p.currentSalary || ""
      });

      const skillsRes = await api.get("/skills/my-skills");
      setSkills(skillsRes.data);

      const allSkillsRes = await api.get("/skills");
      setAllSkills(allSkillsRes.data);
    } catch (e) {
      if (e.response?.status !== 401) {
        setError("Failed to load profile data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = { ...draft, currentSalary: draft.currentSalary ? Number(draft.currentSalary) : null };
      const res = await api.post("/profile", payload);
      setProfile(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save profile.");
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    if (profile) {
      setDraft({ currentTitle:profile.currentTitle||"", currentCompany:profile.currentCompany||"", industry:profile.industry||"", educationLevel:profile.educationLevel||"", location:profile.location||"", bio:profile.bio||"", linkdinUrl:profile.linkedinUrl||"", githubUrl:profile.githubUrl||"", portfolioUrl:profile.portfolioUrl||"", currentSalary:profile.currentSalary||"" });
    }
    setEditing(false);
  };

  // Skills — must send skillId (required by backend)
  const addSkill = async (skillFromList) => {
    if (!skillFromList?.id) return;
    // Check if already added
    if (skills.find(s => s.skillId === skillFromList.id || s.skill?.id === skillFromList.id)) {
      setError("Skill already added.");
      setTimeout(() => setError(""), 2000);
      return;
    }
    try {
      const res = await api.post("/skills/my-skills", {
        skillId: skillFromList.id,
        proficiencyLevel: "Intermediate",
        isPrimary: false,
      });
      setSkills(prev => [...prev, res.data]);
      setSkillSearch("");
      setShowSkillDropdown(false);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to add skill.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const removeSkill = async (skill) => {
    try {
      await api.delete(`/skills/my-skills/${skill.id}`);
      setSkills(prev => prev.filter(s => s.id !== skill.id));
    } catch { setError("Failed to remove skill."); }
  };

  // Filter available skills by search, exclude already added
  const mySkillIds = skills.map(s => s.skillId || s.skill?.id);
  const filteredSkills = allSkills.filter(s =>
    s.name?.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !mySkillIds.includes(s.id)
  );

  const initials = user ? `${user.firstName?.[0]||""}${user.lastName?.[0]||""}`.toUpperCase() : "U";
  const displayName = user ? `${user.firstName||""} ${user.lastName||""}`.trim() : "User";

  const fields = [
    ["currentTitle","Job Title"],["currentCompany","Current Company"],
    ["location","Location"],["industry","Industry"],
    ["educationLevel","Education Level"],["currentSalary","Current Salary"],
    ["linkdinUrl","LinkedIn URL"],["githubUrl","GitHub URL"],["portfolioUrl","Portfolio URL"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        .pp{min-height:100vh;background:#0C0C14;padding:80px 24px 40px;font-family:'DM Sans',sans-serif;}
        .pp-inner{max-width:720px;margin:0 auto;}
        .pp-hero{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:28px;margin-bottom:16px;display:flex;align-items:center;gap:24px;flex-wrap:wrap;position:relative;overflow:hidden;}
        .pp-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(125,249,194,0.07),transparent 70%);pointer-events:none;}
        .pp-avatar{width:72px;height:72px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#7DF9C2,#4B8BFF);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#0C0C14;}
        .pp-hero-info{flex:1;min-width:200px;}
        .pp-name{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#F0EDE8;margin-bottom:3px;}
        .pp-role{font-size:14px;color:rgba(240,237,232,0.55);margin-bottom:4px;}
        .pp-email{font-family:'DM Mono',monospace;font-size:12px;color:rgba(240,237,232,0.35);}
        .pp-actions{display:flex;gap:8px;flex-shrink:0;}
        .pp-btn{padding:8px 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s;border:1px solid;}
        .pp-btn-edit{background:rgba(125,249,194,0.1);border-color:rgba(125,249,194,0.3);color:#7DF9C2;}
        .pp-btn-edit:hover{background:rgba(125,249,194,0.18);}
        .pp-btn-save{background:rgba(125,249,194,0.15);border-color:rgba(125,249,194,0.4);color:#7DF9C2;}
        .pp-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
        .pp-btn-cancel{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:rgba(240,237,232,0.5);}
        .pp-section{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px;margin-bottom:14px;}
        .pp-sec-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:rgba(240,237,232,0.4);margin-bottom:16px;}
        .pp-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:540px){.pp-grid{grid-template-columns:1fr;}}
        .pp-field{display:flex;flex-direction:column;gap:5px;}
        .pp-field-label{font-size:11px;font-weight:700;color:rgba(240,237,232,0.35);text-transform:uppercase;letter-spacing:0.5px;}
        .pp-field-val{font-size:13px;color:rgba(240,237,232,0.8);font-family:'DM Mono',monospace;word-break:break-all;}
        .pp-field-empty{font-size:13px;color:rgba(240,237,232,0.2);font-style:italic;}
        .pp-input{padding:9px 12px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;transition:border-color .15s;font-family:'DM Sans',sans-serif;width:100%;box-sizing:border-box;}
        .pp-input:focus{border-color:rgba(125,249,194,0.4);}
        .pp-bio-view{font-size:13px;color:rgba(240,237,232,0.6);line-height:1.7;}
        .pp-bio-empty{font-size:13px;color:rgba(240,237,232,0.2);font-style:italic;}
        .pp-skills-wrap{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;}
        .pp-skill-search-wrap{position:relative;}
        .pp-skill-input{width:100%;padding:9px 12px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#F0EDE8;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;box-sizing:border-box;}
        .pp-skill-input:focus{border-color:rgba(125,249,194,0.4);}
        .pp-skill-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#13131F;border:1px solid rgba(255,255,255,0.1);border-radius:10px;max-height:200px;overflow-y:auto;z-index:50;}
        .pp-skill-option{padding:9px 14px;font-size:13px;color:rgba(240,237,232,0.75);cursor:pointer;transition:background .12s;display:flex;align-items:center;justify-content:space-between;}
        .pp-skill-option:hover{background:rgba(125,249,194,0.08);color:#F0EDE8;}
        .pp-skill-cat{font-size:11px;color:rgba(240,237,232,0.3);}
        .pp-skill-empty{padding:12px 14px;font-size:12px;color:rgba(240,237,232,0.3);text-align:center;}
        .pp-saved{position:fixed;bottom:24px;right:24px;z-index:300;background:rgba(125,249,194,0.15);border:1px solid rgba(125,249,194,0.4);color:#7DF9C2;padding:10px 20px;border-radius:10px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;animation:pp-toast .25s ease;}
        @keyframes pp-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .pp-error{padding:12px 16px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.25);border-radius:10px;color:#FF6B6B;font-size:12px;margin-bottom:14px;}
        .pp-loading{text-align:center;padding:80px;color:rgba(240,237,232,0.3);font-size:14px;}
        .pp-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(125,249,194,0.2);border-top-color:#7DF9C2;border-radius:50%;animation:ppspin .7s linear infinite;margin-right:8px;}
        @keyframes ppspin{to{transform:rotate(360deg)}}
        .pp-notice{text-align:center;padding:14px;background:rgba(125,249,194,0.05);border:1px dashed rgba(125,249,194,0.2);border-radius:10px;font-size:13px;color:rgba(125,249,194,0.7);margin-bottom:16px;}
        .pp-skill-hint{font-size:11px;color:rgba(240,237,232,0.3);margin-top:6px;}
      `}</style>

      <div className="pp">
        <div className="pp-inner">
          <button 
            onClick={() => window.history.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#7DF9C2] transition-colors group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          {loading ? (
            <div className="pp-loading"><span className="pp-spinner" />Loading profile…</div>
          ) : (
            <>
              {error && <div className="pp-error">⚠ {error}</div>}

              {!profile?.currentTitle && !editing && (
                <div className="pp-notice">
                  👋 Welcome, {user?.firstName}! Complete your profile to get personalized job matches.
                  <button onClick={() => setEditing(true)} style={{ marginLeft:10, background:"none", border:"none", color:"#7DF9C2", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                    Fill it out →
                  </button>
                </div>
              )}

              <div className="pp-hero">
                <div className="pp-avatar">{initials}</div>
                <div className="pp-hero-info">
                  <div className="pp-name">{displayName}</div>
                  {profile?.currentTitle
                    ? <div className="pp-role">{profile.currentTitle}{profile.currentCompany ? ` @ ${profile.currentCompany}` : ""}</div>
                    : <div className="pp-role" style={{color:"rgba(240,237,232,0.2)",fontStyle:"italic"}}>No title set yet</div>
                  }
                  <div className="pp-email">{user?.email}</div>
                </div>
                <div className="pp-actions">
                  {editing
                    ? <>
                        <button className="pp-btn pp-btn-cancel" onClick={handleCancel}>Cancel</button>
                        <button className="pp-btn pp-btn-save" onClick={handleSave} disabled={saving}>
                          {saving ? "Saving…" : "Save Profile"}
                        </button>
                      </>
                    : <button className="pp-btn pp-btn-edit" onClick={() => setEditing(true)}>✎ Edit Profile</button>
                  }
                </div>
              </div>

              <div className="pp-section">
                <div className="pp-sec-title">About</div>
                {editing
                  ? <textarea className="pp-input" style={{width:"100%",minHeight:80,resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}} value={draft.bio} onChange={e => set("bio", e.target.value)} placeholder="Write a short bio about yourself…" />
                  : profile?.bio
                    ? <div className="pp-bio-view">{profile.bio}</div>
                    : <div className="pp-bio-empty">No bio added yet. Click Edit Profile to add one.</div>
                }
              </div>

              <div className="pp-section">
                <div className="pp-sec-title">Details</div>
                <div className="pp-grid">
                  {fields.map(([key, label]) => (
                    <div className="pp-field" key={key}>
                      <span className="pp-field-label">{label}</span>
                      {editing
                        ? <input className="pp-input" value={draft[key]||""} onChange={e => set(key, e.target.value)} placeholder={label} type={key==="currentSalary"?"number":"text"} />
                        : (profile?.[key==="linkdinUrl"?"linkedinUrl":key])
                          ? <span className="pp-field-val">{profile[key==="linkdinUrl"?"linkedinUrl":key]}</span>
                          : <span className="pp-field-empty">Not set</span>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div className="pp-section">
                <div className="pp-sec-title">Skills</div>
                <div className="pp-skills-wrap">
                  {skills.length > 0
                    ? skills.map((s, i) => (
                        <SkillTag
                          key={s.id||i}
                          skill={{ ...s, skillName: s.skillName || s.skill?.name || s.name }}
                          color={SKILL_COLORS[i%SKILL_COLORS.length]}
                          onRemove={removeSkill}
                        />
                      ))
                    : <span style={{fontSize:13,color:"rgba(240,237,232,0.25)"}}>No skills yet. Search below to add one.</span>
                  }
                </div>

                {/* Searchable skill picker */}
                <div className="pp-skill-search-wrap">
                  <input
                    className="pp-skill-input"
                    placeholder="Search skills to add (e.g. React, Python, SQL)…"
                    value={skillSearch}
                    onChange={e => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  />
                  {showSkillDropdown && skillSearch.length > 0 && (
                    <div className="pp-skill-dropdown">
                      {filteredSkills.length > 0
                        ? filteredSkills.slice(0, 10).map(s => (
                            <div key={s.id} className="pp-skill-option" onMouseDown={() => addSkill(s)}>
                              <span>{s.name}</span>
                              <span className="pp-skill-cat">{s.category || ""}</span>
                            </div>
                          ))
                        : <div className="pp-skill-empty">No matching skills found</div>
                      }
                    </div>
                  )}
                </div>
                <div className="pp-skill-hint">Skills are from your platform's skill library. Search and click to add.</div>
              </div>
            </>
          )}
        </div>
      </div>
      {saved && <div className="pp-saved">✓ Profile saved successfully</div>}
    </>
  );
}
