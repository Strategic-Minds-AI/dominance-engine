import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Sparkles, Trash2, Calendar, Check } from "lucide-react";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok", "google_business"];

export default function PortalSocial({ site }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ topic: "", platform: "facebook", content: "", hashtags: "", image_url: "", scheduled_at: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.SocialPost.filter({ launched_site_id: site.id }, { sort: "-created_date", limit: 50 });
      setPosts(res.items || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  }, [site.id]);

  useEffect(() => { load(); }, [load]);

  const generateAI = async () => {
    if (!form.topic.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateSocialContent", {
        topic: form.topic, platform: form.platform, brand_name: site.name,
      });
      const data = res.data;
      if (data?.content) setForm((f) => ({ ...f, content: data.content, hashtags: data.hashtags || "" }));
    } catch (e) { alert("AI generation failed: " + e.message); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      await base44.entities.SocialPost.create({
        launched_site_id: site.id,
        platform: form.platform,
        content: form.content,
        hashtags: form.hashtags,
        image_url: form.image_url,
        scheduled_at: form.scheduled_at || undefined,
        status: form.scheduled_at ? "scheduled" : "draft",
        ai_generated: true,
      });
      setForm({ topic: "", platform: "facebook", content: "", hashtags: "", image_url: "", scheduled_at: "" });
      setShowForm(false);
      load();
    } catch (e) { alert("Save failed: " + e.message); }
    finally { setSaving(false); }
  };

  const remove = async (post) => {
    if (!confirm("Delete this post?")) return;
    try { await base44.entities.SocialPost.delete(post.id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase">Social Media Manager</h3>
          <p className="text-xs text-muted-foreground mt-1">AI-assisted content creation + scheduling + hashtag optimization</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs tracking-[0.15em] uppercase hover:opacity-90">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Topic / Theme">
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g., 5 things to do after a car accident" className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <button onClick={generateAI} disabled={generating || !form.topic.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-crimson text-paper text-xs tracking-[0.15em] uppercase hover:brightness-110 disabled:opacity-40">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Generate with AI
          </button>
          <Field label="Post Content">
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full border border-border p-3 text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="Hashtags">
            <input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Image URL (optional)">
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
            <Field label="Schedule for (optional)">
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            </Field>
          </div>
          <button onClick={save} disabled={saving || !form.content.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-paper text-xs tracking-[0.2em] uppercase disabled:opacity-40">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Post
          </button>
        </div>
      )}

      {loading ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> :
       posts.length === 0 ? <p className="text-sm text-muted-foreground py-10">No posts yet. Create your first post above.</p> :
       <div className="space-y-3">
         {posts.map((p) => (
           <div key={p.id} className="border border-border p-4">
             <div className="flex items-start justify-between gap-3 mb-2">
               <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border border-border">{p.platform}</span>
                 <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 ${p.status === "posted" ? "bg-foreground text-background" : p.status === "scheduled" ? "bg-primary text-paper" : "border border-border"}`}>{p.status}</span>
                 {p.ai_generated && <span className="text-[10px] tracking-[0.15em] uppercase text-crimson">AI</span>}
               </div>
               <button onClick={() => remove(p)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
             </div>
             <p className="text-sm whitespace-pre-wrap">{p.content}</p>
             {p.hashtags && <p className="text-xs text-crimson mt-2">{p.hashtags}</p>}
             {p.scheduled_at && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.scheduled_at).toLocaleString()}</p>}
           </div>
         ))}
       </div>
      }
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>;
}