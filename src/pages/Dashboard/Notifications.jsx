export default function Notifications() {
  const NOTIFS = [
    { id:1, title:'Enrollment Approved', body:'Your enrollment has been approved by the admin.' },
    { id:2, title:'Document Missing', body:'One of your uploaded documents needs a clearer photo.' },
  ];

  return (
    <div style={{ maxWidth:760, margin:'20px auto', padding:20 }}>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, marginBottom:8 }}>Notifications</h2>
      <p style={{ color:'#64748b' }}>Recent messages from the admin and system.</p>

      <div style={{ marginTop:12, display:'grid', gap:10 }}>
        {NOTIFS.map(n => (
          <div key={n.id} style={{ padding:12, borderRadius:8, border:'1px solid #eef2f7', background:'#fff' }}>
            <div style={{ fontWeight:700 }}>{n.title}</div>
            <div style={{ fontSize:13, color:'#64748b', marginTop:6 }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
