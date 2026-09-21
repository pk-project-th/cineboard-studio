import React, { useState, useEffect } from 'react';
import {
  X, Plus, Sparkles, Trash2, Image as ImageIcon,
  User, Mountain, Package, Check, RefreshCw, Upload,
  ExternalLink, Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AssetManagerModal({ isOpen, onClose, onAssetCreated }) {
  const [activeTab, setActiveTab] = useState('character'); // 'character' | 'scene' | 'product'
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [savingAsset, setSavingAsset] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch assets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleGeneratePrompt = async () => {
    if (!name.trim()) {
      alert('กรุณากรอกชื่อ Asset ก่อน เพื่อให้ AI ช่วยเขียนคำสั่ง Prompt');
      return;
    }

    setGeneratingPrompt(true);
    try {
      const res = await fetch('/api/assets/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          name,
          description: description || `ภาพต้นแบบของ ${name} สไตล์ภาพยนตร์ไทยวินเทจ 1980s`
        })
      });
      const data = await res.json();
      if (data.success && data.data?.suggested_prompt) {
        setPrompt(data.data.suggested_prompt);
        // Also provide instant image preview via pollinations
        if (!imageUrl) {
          const encoded = encodeURIComponent(data.data.suggested_prompt.slice(0, 150));
          setImageUrl(`https://image.pollinations.ai/prompt/${encoded}?width=600&height=600&nologo=true`);
        }
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการสร้าง Prompt');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingAsset(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: activeTab,
          description,
          prompt,
          image_url: imageUrl || '/media/tpl_aircon_hero.jpg'
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 30, spread: 60 });
        setIsCreating(false);
        setName('');
        setDescription('');
        setPrompt('');
        setImageUrl('');
        fetchAssets();
        if (onAssetCreated) onAssetCreated(data.data);
      } else {
        alert(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึก Asset');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('คุณต้องการลบ Asset นี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter(a => a.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F71C25]/10 border border-[#F71C25]/20 flex items-center justify-center text-[#F71C25]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>คลัง Asset สตอรี่บอร์ด (Asset Vault)</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FBEFC5] text-stone-900 border border-[#E5D7A3] font-bold">
                  {assets.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                จัดการตัวละครหลัก, ฉากสถานที่, และสินค้าสปอนเซอร์ เพื่อนำไปประกอบในสตอรี่บอร์ด
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs & Add Button */}
        <div className="px-6 pt-4 pb-3 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('character'); setIsCreating(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'character'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-950 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>1. ตัวละคร (Characters)</span>
            </button>

            <button
              onClick={() => { setActiveTab('scene'); setIsCreating(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'scene'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-950 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Mountain className="w-4 h-4" />
              <span>2. ฉาก & สถานที่ (Scenes)</span>
            </button>

            <button
              onClick={() => { setActiveTab('product'); setIsCreating(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'product'
                  ? 'bg-[#F71C25] text-white shadow-md shadow-red-500/20'
                  : 'bg-stone-100 text-stone-700 hover:text-stone-950 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>3. สินค้า & พร็อพ (Products)</span>
            </button>
          </div>

          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FBEFC5] hover:bg-[#FAF0D4] border border-[#E5D7A3] text-stone-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#F71C25]" />
              <span>เพิ่ม {activeTab === 'character' ? 'ตัวละคร' : activeTab === 'scene' ? 'ฉาก' : 'สินค้า'} ใหม่</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isCreating ? (
            /* Creation Form */
            <form onSubmit={handleSaveAsset} className="space-y-4 max-w-2xl mx-auto bg-[#FAF9F5] p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-sm font-bold text-stone-900">
                <span>เพิ่มข้อมูล {activeTab === 'character' ? 'ตัวละคร' : activeTab === 'scene' ? 'ฉากสถานที่' : 'สินค้า/พรีเซนต์'}</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  ยกเลิก
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  ชื่อ Asset *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === 'character'
                      ? 'เช่น ศักดิ์ ฮีโร่ช่างแอร์, จอย นางเอกร้านซ่อม'
                      : activeTab === 'scene'
                      ? 'เช่น ตลาดสดคลองเตย 1980s, อู่ซ่อมรถวินเทจ'
                      : 'เช่น น้ำส้มขวดแก้วไบเล่, ยาหม่องตรามังกร'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:border-[#F71C25] shadow-2xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  คำบรรยายลักษณะเด่น
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น เสื้อกั๊กสีน้ำเงิน หมวกแก๊ปเก่า ถือลูกตะกร้อ หน้าตาจริงจัง..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:border-[#F71C25] shadow-2xs outline-none resize-none"
                />
              </div>

              {/* AI Prompt Generator & Image URL */}
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono text-stone-700 font-bold">
                    คำสั่งสร้างภาพภาษาอังกฤษ (Master Prompt)
                  </span>
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    disabled={generatingPrompt}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>{generatingPrompt ? 'กำลังคิด Prompt...' : '⚡ ไม่มีรูปจริง? ให้ AI เขียน Prompt'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="English photographic prompt for generating this asset consistency..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 text-stone-900 text-xs font-mono focus:border-[#F71C25] outline-none resize-none leading-relaxed"
                />

                <div>
                  <label className="block text-[11px] font-mono text-stone-600 font-bold mb-1">
                    URL รูปภาพอ้างอิง (หรือจะให้ AI เจนให้จาก Prompt ด้านบน)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... หรือปล่อยว่างเพื่อใช้ภาพตัวอย่าง"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-stone-200 text-stone-900 text-xs font-mono focus:border-[#F71C25] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200 transition-colors cursor-pointer active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingAsset}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingAsset ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>บันทึก Asset เข้าคลัง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF9F5] rounded-3xl border border-stone-200 max-w-lg mx-auto p-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FDF8EE] border border-[#EADBBD] flex items-center justify-center text-[#F71C25] shadow-2xs">
                <Package className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-stone-800">ยังไม่มี {activeTab === 'character' ? 'ตัวละคร' : activeTab === 'scene' ? 'ฉาก' : 'สินค้า'} ในคลัง</p>
              <p className="text-xs text-stone-500 font-mono mt-1">เพิ่มข้อมูลเพื่อนำไปใช้ประกอบการเจนรูปและวิดีโอให้หน้าตาและสไตล์ตรงกัน</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F71C25] to-[#FF4438] hover:from-[#E0141D] hover:to-[#E02D24] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มข้อมูลแรกเลย</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAssets.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200 hover:border-[#F71C25]/60 hover:shadow-md transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[#FAF9F5] border-b border-stone-100">
                    <img
                      src={item.image_url || '/media/tpl_aircon_hero.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/media/tpl_aircon_hero.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg bg-[#FBEFC5]/95 backdrop-blur-md text-[10px] font-mono font-bold text-stone-900 border border-[#E5D7A3] uppercase shadow-2xs">
                      {item.type}
                    </div>
                    <button
                      onClick={() => handleDeleteAsset(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                      title="ลบ Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#F71C25] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {item.description || 'ไม่มีคำบรรยาย'}
                      </p>
                    </div>

                    {item.prompt && (
                      <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 font-mono line-clamp-1" title={item.prompt}>
                        Prompt: {item.prompt}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF9F5] flex items-center justify-between text-xs text-stone-600 font-mono">
          <span>* Asset ที่บันทึกไว้สามารถนำไปเลือกร้อยเรียงในสตอรี่บอร์ดแต่ละช็อตได้ทันที</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold active:scale-95 transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
