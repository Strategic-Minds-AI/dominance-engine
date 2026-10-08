import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Loader2, FileQuestion, ArrowRight, ChevronDown } from "lucide-react";
import TopBar from "@/components/site/TopBar";
import NavBar from "@/components/site/NavBar";
import ContactFooter from "@/components/site/ContactFooter";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${CSS.escape(key)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function injectJsonLd(json) {
  document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((s) => s.remove());
  if (!json) return;
  let arr = json;
  if (typeof json === "string") {
    try { arr = JSON.parse(json); } catch { return; }
  }
  if (!Array.isArray(arr)) arr = [arr];
  arr.forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo", "jsonld");
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

function parseFaq(faq) {
  if (!faq) return [];
  if (Array.isArray(faq)) return faq;
  try {
    const a = JSON.parse(faq);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export default function LegalPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.GeneratedPage.filter(
          { slug, status: "published" },
          { limit: 1 }
        );
        const p = (res.items || [])[0];
        setPage(p);
        if (p) {
          const r = await base44.entities.GeneratedPage.filter(
            { practice_area: p.practice_area, status: "published", slug: { $ne: p.slug } },
            { limit: 6, fields: ["slug", "city", "state_code"] }
          );
          setRelated(r.items || []);
        }
      } catch (e) {
        /* not found */
      }
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    setMeta("name", "description", page.meta_description);
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.meta_description);
    setMeta("property", "og:type", "website");
    setCanonical(page.canonical_path || "/" + page.slug);
    injectJsonLd(page.schema_json);
  }, [page]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (!page) return <NotFound />;

  const faq = parseFaq(page.faq);

  return (
    <div className="bg-paper text-foreground min-h-screen flex flex-col">
      <TopBar />
      <NavBar />
      <main className="flex-1">
        <section className="bg-primary text-paper py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-crimson mb-3">
              {page.practice_area} · {page.city}
              {page.state_code ? ", " + page.state_code : ""}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase leading-tight">{page.h1}</h1>
            <p className="mt-5 text-paper/80 max-w-xl mx-auto">{page.meta_description}</p>
            <a
              href="/#intake"
              className="mt-8 inline-flex items-center gap-3 bg-crimson text-paper px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110"
            >
              Free Case Review <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="font-heading text-2xl font-bold text-primary uppercase mt-12 mb-4">{children}</h2>
              ),
              p: ({ children }) => <p className="text-foreground/75 leading-relaxed mb-5">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-2 text-foreground/75">{children}</ul>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
            }}
          >
            {page.content_markdown}
          </ReactMarkdown>
        </article>

        {faq.length > 0 && (
          <section className="bg-secondary/40 py-14 md:py-20">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="font-heading text-3xl font-bold text-primary uppercase mb-8">
                {page.practice_area} FAQ — {page.city}
              </h2>
              <div className="space-y-3">
                {faq.map((f, i) => (
                  <div key={i} className="border border-border bg-paper">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="font-semibold text-foreground pr-4">{f.question || f.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="px-5 pb-5 text-sm text-foreground/70 leading-relaxed">{f.answer || f.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="py-14 md:py-20">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="font-heading text-2xl font-bold text-primary uppercase mb-6">
                More {page.practice_area} offices
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={"/" + r.slug}
                    className="border border-border p-4 hover:border-primary text-sm transition-colors"
                  >
                    {page.practice_area} Lawyer — {r.city}
                    {r.state_code ? ", " + r.state_code : ""}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-primary text-paper py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase mb-4">
              Hurt in {page.city}? Get a free review.
            </h2>
            <a
              href="/#intake"
              className="inline-flex items-center gap-3 bg-crimson text-paper px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase rounded-sm hover:brightness-110"
            >
              Start My Free Case Review <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>
      <ContactFooter />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4">
      <FileQuestion className="w-12 h-12 text-muted-foreground" />
      <h1 className="font-heading text-2xl text-primary">Page not found</h1>
      <Link to="/" className="text-sm text-crimson font-semibold hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}