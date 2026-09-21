import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Database, Users, Copy, Eye, Plus, Edit, Trash2,
  RefreshCw, Download, Layers, Sparkles, Check, AlertCircle, X, ArrowLeft
} from 'lucide-react';

export default function AdminDashboard({ onBackToVisitor }) {
  const [activeTab, setActiveTab] = useState('prompts'); // 'prompts' | 'leads' | 'stats'
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [notification, setNotification] = useState('');

  // Form state for creating/editing prompt
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    step_number: 1,
    step_title: 'STEP 1 — บล็อกคงที่ (Global Blocks)',
    prompt_type: 'custom',
    recommended_tool: 'Midjourney / Flux.1',
    aspect_ratio: '16:9',
    content: '',
    dialogue_script: '',
    image_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resPrompts, resLeads] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/prompts').then(r => r.json()),
        fetch('/api/leads').then(r => r.json())
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resPrompts.success) setPrompts(resPrompts.data);
      if (resLeads.success) setLeads(resLeads.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingPrompt(null);
    setFormData({
      title: '',
      subtitle: '',
      step_number: 1,
      step_title: 'STEP 1 — บล็อกคงที่ (Global Blocks)',
      prompt_type: 'custom',
      recommended_tool: 'Midjourney / Flux.1',
      aspect_ratio: '16:9',
      content: '',
      dialogue_script: '',
      image_url: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPrompt(p);
    setFormData({
      title: p.title || '',
      subtitle: p.subtitle || '',
      step_number: p.step_number || 1,
      step_title: p.step_title || '',
      prompt_type: p.prompt_type || 'custom',
      recommended_tool: p.recommended_tool || 'Midjourney',
      aspect_ratio: p.aspect_ratio || '16:9',
      content: p.content || '',
      dialogue_script: p.dialogue_script || '',
      image_url: p.image_url || ''
    });
    setModalOpen(true);
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    try {
      const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        notify(editingPrompt ? 'บันทึกการแก้ไข Prompt สำเร็จ!' : 'เพิ่ม Prompt ใหม่เข้าคลังเรียบร้อยแล้ว!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      notify('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeletePrompt = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Prompt นี้?')) return;
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('ลบ Prompt สำเร็จแล้ว');
        fetchData();
      }
    } catch (err) {
      notify('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('คุณต้องการลบรายชื่อนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('ลบรายชื่อสำเร็จ');
        fetchData();
      }
    } catch (err) {
      notify('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('ต้องการรีเซ็ตและโหลดข้อมูลตัวอย่างซีรีส์หนังไทยย้อนยุคใหม่ทั้งหมดใช่หรือไม่?')) return;
    try {
      const res = await fetch('/api/admin/reseed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
        fetchData();
      }
    } catch (err) {
      notify('เกิดข้อผิดพลาด');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('คำเตือน: คุณต้องการลบการ์ด Prompt ทั้งหมดออกจากระบบเพื่อเริ่มต้นใหม่ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      const res = await fetch('/api/admin/clear-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('ล้างข้อมูลเรียบร้อยแล้ว');
        fetchData();
      }
    } catch (err) {
      notify('เกิดข้อผิดพลาด');
    }
  };

  const exportLeadsCSV = () => {
    const headers = ['ID,Name,Email,Source,Interest,CreatedAt\n'];
    const rows = leads.map(l => `"${l.id}","${l.name}","${l.email}","${l.source}","${l.interest}","${l.created_at}"\n`);
    const blob = new Blob([headers.concat(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cineprompt_leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEFC5] border border-[#E5D7A3] text-stone-900 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F71C25]" />
            <span>CinePrompt Backoffice Admin Panel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            ระบบจัดการหลังบ้าน & วิเคราะห์สถิติ
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            ควบคุมคลัง Master Prompts, นำเข้าสูตรภาพจากภายนอก, ติดตาม Leads จาก Funnel, และมอนิเตอร์จำนวนการคัดลอกแบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="ลบข้อมูลทั้งหมดเพื่อให้บอร์ดว่างเปล่า เริ่มต้นใหม่"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>ล้างข้อมูลทั้งหมด (เริ่มใหม่)</span>
          </button>

          <button
            onClick={handleReseed}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="รีเซ็ตและโหลดข้อมูลตัวอย่างซีรีส์หนังไทย"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F71C25]" />
            <span>โหลดข้อมูลตัวอย่าง</span>
          </button>

          <button
            onClick={onBackToVisitor}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-black transition-all shadow-md shadow-red-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ดูหน้าสตูดิโอ (Visitor Mode)</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>จำนวน Prompt ทั้งหมด</span>
              <Layers className="w-4 h-4 text-[#F71C25]" />
            </div>
            <div className="text-2xl font-black text-stone-900 mt-2 font-mono">
              {stats.totalPrompts}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">พร้อมใช้งานในคลังสตูดิโอ</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>ยอดการคัดลอกรวม</span>
              <Copy className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
              {stats.totalCopies.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">คลิกก็อปปี้จากผู้ใช้จริง</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Leads ที่เก็บได้</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600 mt-2 font-mono">
              {stats.totalLeads}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">ผู้ลงทะเบียนรับ Prompt & คอร์ส</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>ยอดวิวหน้าซีรีส์</span>
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 mt-2 font-mono">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Page Impressions รวม</div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 mt-8 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'prompts'
              ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-black shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          จัดการ Prompt ({prompts.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-black shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          รายชื่อ Leads ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-black shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          การวิเคราะห์ประสิทธิภาพ
        </button>
      </div>

      {/* TAB 1: PROMPT MANAGEMENT */}
      {activeTab === 'prompts' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="text-sm font-black text-stone-900">
                รายการ Prompt ในคลังข้อมูล (เรียงตามขั้นตอน Step)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                คุณสามารถเพิ่มสูตรภาพ/คำสั่งที่คิดเองจากภายนอกเข้ามาเก็บไว้ หรือแก้ไขการ์ดที่มีอยู่เดิมได้ที่นี่
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F71C25] hover:bg-[#d0151d] text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ เพิ่ม Prompt ใหม่</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF9F5] text-[11px] text-stone-700 uppercase tracking-wider font-mono border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">ขั้นตอน (Step)</th>
                    <th className="p-3.5">ชื่อ Prompt</th>
                    <th className="p-3.5">AI Tool แนะนำ</th>
                    <th className="p-3.5">สัดส่วนภาพ</th>
                    <th className="p-3.5 text-center">ยอดก๊อปปี้</th>
                    <th className="p-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {prompts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500 font-mono text-xs">
                        ยังไม่มีรายการ Prompt ในคลัง กดปุ่ม "+ เพิ่ม Prompt ใหม่" หรือ "โหลดข้อมูลตัวอย่าง" ด้านบน
                      </td>
                    </tr>
                  ) : (
                    prompts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-[#F71C25] font-bold">
                          {p.step_title ? p.step_title.split('—')[0].trim() : `Step ${p.step_number}`}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{p.title}</div>
                          <div className="text-[11px] text-stone-500 truncate max-w-xs">{p.subtitle || p.content.slice(0, 50)}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 font-mono text-[11px] text-stone-800 font-semibold">
                            {p.recommended_tool}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-stone-600">
                          {p.aspect_ratio || '-'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-emerald-600">
                          {p.copy_count || 0}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit className="w-3.5 h-3.5 text-stone-700" />
                            </button>
                            <button
                              onClick={() => handleDeletePrompt(p.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADS LIST */}
      {activeTab === 'leads' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="text-sm font-black text-stone-900">
                รายชื่อผู้ลงทะเบียนรับ Prompt และผู้สนใจคอร์ส ({leads.length} คน)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                รายชื่อจาก Funnel หน้าแรก สามารถส่งออกเป็นไฟล์ CSV ไปใช้งานต่อใน Excel / Sheets
              </p>
            </div>
            <button
              onClick={exportLeadsCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F71C25]" />
              <span>ส่งออก CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF9F5] text-[11px] text-stone-700 uppercase tracking-wider font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3.5">ชื่อ</th>
                  <th className="p-3.5">อีเมล (Email)</th>
                  <th className="p-3.5">ที่มา (Source)</th>
                  <th className="p-3.5">ความสนใจ</th>
                  <th className="p-3.5">วันที่บันทึก</th>
                  <th className="p-3.5 text-right">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500 font-mono text-xs">
                      ยังไม่มีรายชื่อ Leads ที่ลงทะเบียน
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{l.name}</td>
                      <td className="p-3.5 font-mono text-[#F71C25] font-semibold">{l.email}</td>
                      <td className="p-3.5 text-stone-600 font-mono text-[11px]">{l.source}</td>
                      <td className="p-3.5 text-stone-700">{l.interest}</td>
                      <td className="p-3.5 text-stone-500 font-mono text-[11px]">{l.created_at}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATS & ANALYTICS */}
      {activeTab === 'stats' && stats && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 5 Most Copied Prompts */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
              <h4 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F71C25]" />
                <span>5 อันดับ Prompt ที่มียอดคัดลอกสูงสุด</span>
              </h4>
              <div className="space-y-3">
                {stats.topPrompts.map((tp, idx) => (
                  <div key={tp.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-stone-200">
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        #{idx + 1} {tp.title}
                      </div>
                      <div className="text-[11px] text-stone-500">{tp.step_title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-black text-[#F71C25]">{tp.copy_count}</div>
                      <div className="text-[10px] text-stone-500">ครั้ง</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copies by Step Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
              <h4 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F71C25]" />
                <span>สัดส่วนการคัดลอกตามขั้นตอน (Workflow Breakdown)</span>
              </h4>
              <div className="space-y-3">
                {stats.copiesByStep.map((cs) => {
                  const percent = stats.totalCopies > 0 ? Math.round((cs.total_copies / stats.totalCopies) * 100) : 0;
                  return (
                    <div key={cs.step_number} className="p-3 rounded-xl bg-[#FAF9F5] border border-stone-200">
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-stone-900">{cs.step_title}</span>
                        <span className="font-mono text-[#F71C25]">{cs.total_copies} ครั้ง ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F71C25] to-[#FF4438] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="text-lg font-black text-stone-900">
                {editingPrompt ? 'แก้ไขการ์ด Prompt' : 'เพิ่ม Prompt ใหม่เข้าคลัง (Custom / External)'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrompt} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">ชื่อหัวข้อ Prompt *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] shadow-xs"
                    placeholder="เช่น ฉากที่ 3 — บ่อปลาตอนกลางคืน"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">คำอธิบายย่อย</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] shadow-xs"
                    placeholder="เช่น ภาพมุมกว้าง แสงโพล้เพล้"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">ขั้นตอน (Step Number)</label>
                  <select
                    value={formData.step_number}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      const titles = {
                        1: 'STEP 1 — บล็อกคงที่ (Global Blocks)',
                        2: 'STEP 2 — Character Sheet (สร้างตัวละครอ้างอิง)',
                        3: 'STEP 3 — First Frame (ภาพนิ่งตั้งต้นฉากแรก)',
                        4: 'STEP 4 — Video Prompt (กำกับวิดีโอและบทพูด)'
                      };
                      setFormData({
                        ...formData,
                        step_number: num,
                        step_title: titles[num] || `STEP ${num}`
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] font-mono shadow-xs"
                  >
                    <option value={1}>Step 1 (Global Blocks)</option>
                    <option value={2}>Step 2 (Character Sheet)</option>
                    <option value={3}>Step 3 (First Frame)</option>
                    <option value={4}>Step 4 (Video Prompt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">โมเดล AI ที่แนะนำ</label>
                  <input
                    type="text"
                    value={formData.recommended_tool}
                    onChange={(e) => setFormData({ ...formData, recommended_tool: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] font-mono shadow-xs"
                    placeholder="เช่น Midjourney v6 / Kling 1.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">อัตราส่วน (Aspect Ratio)</label>
                  <input
                    type="text"
                    value={formData.aspect_ratio}
                    onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] font-mono shadow-xs"
                    placeholder="เช่น 16:9 หรือ 9:16"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">เนื้อหา Prompt ภาษาอังกฤษแบบเต็ม *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] font-mono leading-relaxed shadow-xs"
                  placeholder="เขียนคำสั่ง Prompt สำหรับวาดภาพที่นี่..."
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">บทพูดสคริปต์ / คำสั่งวิดีโอ (ถ้ามี)</label>
                <textarea
                  rows={3}
                  value={formData.dialogue_script}
                  onChange={(e) => setFormData({ ...formData, dialogue_script: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] font-mono shadow-xs"
                  placeholder="เช่น บทพูดตัวละคร หรือคำอธิบายการเคลื่อนไหวของกล้อง"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ลิงก์รูปภาพตัวอย่าง (Image URL)</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-[#F71C25] shadow-xs"
                  placeholder="https://... หรือปล่อยว่างเพื่อใช้ภาพสเก็ตช์ระบบ"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white font-bold shadow-md shadow-red-500/20 cursor-pointer"
                >
                  บันทึกข้อมูลเข้าคลัง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
