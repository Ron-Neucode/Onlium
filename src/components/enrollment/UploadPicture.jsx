import { useState } from "react";

export default function UploadPicture({ onBack, onNext }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleNext() {
    if (!file) return;
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      onNext && onNext();
    }, 900);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)", overflow: "hidden" }}>
      <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9", display: "flex", gap:12, alignItems:"center" }}>
        <div style={{ width:40, height:40, borderRadius:10, background:"#f0f9ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#0369a1" }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 19V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"/><path d="M7 13 10 16 17 9"/></svg>
        </div>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700 }}>Upload 2×2 Picture</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>White background preferred. JPG/PNG only. Max 3MB.</div>
        </div>
      </div>

      <div style={{ padding:24, display:"grid", gridTemplateColumns: "1fr 320px", gap:24 }}>
        <div>
          <div style={{ fontSize:13.5, fontWeight:700, marginBottom:10 }}>Choose your photo</div>
          <p style={{ color:"#64748b", marginTop:0, marginBottom:14 }}>Make sure the photo is recent and the background is plain white. Crop to head & shoulders.</p>

          <input type="file" accept="image/*" onChange={handleFile} style={{ marginBottom:12 }} />

          <div style={{ fontSize:12, color:"#64748b" }}>
            {file ? (
              <div>Selected: <strong>{file.name}</strong> ({Math.round(file.size/1024)} KB)</div>
            ) : (
              <div>No file selected</div>
            )}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
          <div style={{ width:220, height:280, borderRadius:8, border:"1px dashed #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", background: preview ? "#fff" : "#f8fafc", overflow:"hidden" }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"cover" }} />
            ) : (
              <div style={{ textAlign:"center", color:"#94a3b8" }}>
                <div style={{ fontSize:34 }}>🖼️</div>
                <div style={{ marginTop:6 }}>Preview will appear here</div>
              </div>
            )}
          </div>

          <div style={{ width:"100%", display:"flex", gap:8, justifyContent:"space-between" }}>
            <button onClick={onBack} style={{ padding:"10px 14px", borderRadius:8, background:"#fff", border:"1.5px solid #e2e8f0", color:"#475569", cursor:"pointer" }}>
              ← Back
            </button>
            <button onClick={handleNext} disabled={!file || uploading} style={{ padding:"10px 14px", borderRadius:8, background: file ? "#2563eb" : "#93c5fd", border:"none", color:"#fff", cursor: file ? "pointer" : "not-allowed" }}>
              {uploading ? "Uploading…" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
