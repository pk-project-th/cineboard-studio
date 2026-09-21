import React, { useState } from 'react';
import { Sparkles, Mail, ArrowRight, CheckCircle, Flame, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FunnelCTA({ onLeadSubmitted }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'ผู้เยี่ยมชมเว็บ',
          email,
          source: 'bottom_funnel_cta',
          interest: 'CLASS AI Video Mastery & New Prompts'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 }
        });
        if (onLeadSubmitted) onLeadSubmitted();
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 pt-12 pb-16 border-t border-amber-900/30 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Official Course Pitch */}
          <div className="lg:col-span-7 vintage-panel rounded-3xl p-8 border border-amber-600/30 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-amber-600 to-amber-700 text-stone-950 font-bold text-[11px] rounded-bl-xl tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Official Masterclass</span>
            </div>

            <div>
              <div className="text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
                🎬 เรียนรู้เทคนิค AI Video ขั้นสูงจากครีเอเตอร์ตัวจริง
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-100 leading-tight">
                CLASS AI Video Mastery
                <span className="block text-amber-300 font-normal text-lg mt-1 font-serif">
                  by PKShortClips Studio
                </span>
              </h3>

              <p className="text-sm text-stone-300 mt-4 leading-relaxed">
                เจาะลึกเทคนิคการคุม Look & Tone, การสร้าง Character Consistency ข้ามฉาก, การกำกับท่าทางด้วย First Frame, และการทำ Sound Design ให้คลิปหยุดนิ้วคนดูได้ตั้งแต่ 3 วินาทีแรก
              </p>

              <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-200 text-xs font-medium">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>ราคา <strong>"จ่ายครั้งเดียว เรียนตลอดชีวิต"</strong> กำลังจะปรับขึ้นเร็วๆ นี้</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="https://aivideomastery.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all group"
              >
                <span>ไปยังเว็บไซต์คอร์ส (aivideomastery.store)</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <span className="text-xs text-stone-500 font-mono">
                เปิดรับผู้เรียนจำนวนจำกัด
              </span>
            </div>
          </div>

          {/* Right Column: Lead Magnet Form */}
          <div className="lg:col-span-5 bg-stone-900/90 rounded-3xl p-8 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Mail className="w-5 h-5" />
              </div>

              <h4 className="text-xl font-bold text-stone-100">
                รับ Master Prompt Pack ฟรี
              </h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                กรอกอีเมลเพื่อรับไฟล์ PDF รวม Prompt ซีรีส์หนังไทยย้อนยุคชุดต่อไป และแจ้งเตือนก่อนใครเมื่อมีสูตรใหม่เปิดตัว
              </p>
            </div>

            {submitted ? (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-200">
                  ลงทะเบียนสำเร็จแล้ว!
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  ระบบได้บันทึกอีเมลของคุณเข้าสู่ฐานข้อมูลเรียบร้อยแล้ว
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อของคุณ (เช่น คุณกิตติ)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ใส่อีเมลของคุณ (เช่น yourname@mail.com)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {error && (
                  <div className="text-xs text-rose-400 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <span>รับชุด Prompt และอัปเดตฟรี</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 pt-1">
                  <ShieldCheck className="w-3 h-3 text-stone-500" />
                  <span>เราไม่ส่งสแปม และเคารพความเป็นส่วนตัวของคุณ 100%</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
