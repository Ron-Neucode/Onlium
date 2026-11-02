import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  function openTool(tool) {
    try { localStorage.setItem('openTool', tool); } catch(e){}
    navigate('/dashboard');
  }

  return (
    <aside style={{ padding: 16, borderRight: "1px solid #eee", minWidth: 200 }}>
      <h3>Sidebar</h3>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <NavLink to="/" end style={({ isActive }) => ({ color: isActive ? "#2544d4" : undefined })}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/enrollment" style={({ isActive }) => ({ color: isActive ? "#2544d4" : undefined })}>
              Enrollment
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" style={({ isActive }) => ({ color: isActive ? "#2544d4" : undefined })}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <button onClick={() => openTool('studyload')} style={{ background: 'transparent', border: 'none', padding: 0, marginTop:8, cursor:'pointer', color:'#111' }}>Study Load</button>
          </li>
          <li>
            <button onClick={() => openTool('resources')} style={{ background: 'transparent', border: 'none', padding: 0, marginTop:8, cursor:'pointer', color:'#111' }}>Resources</button>
          </li>
          <li>
            <button onClick={() => openTool('appointment')} style={{ background: 'transparent', border: 'none', padding: 0, marginTop:8, cursor:'pointer', color:'#111' }}>Appointments</button>
          </li>
          <li style={{ marginTop:12 }}>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>Student Tools</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button onClick={() => openTool('studyload')} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #eef2f7', background:'#fff', textAlign:'left', cursor:'pointer' }}>Studyload</button>
              <button onClick={() => openTool('resources')} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #eef2f7', background:'#fff', textAlign:'left', cursor:'pointer' }}>Resources</button>
              <button onClick={() => openTool('appointment')} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #eef2f7', background:'#fff', textAlign:'left', cursor:'pointer' }}>Appointment</button>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
