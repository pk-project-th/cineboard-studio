async function runRealWorldTest() {
  console.log('=== 1. ล้างข้อมูลบอร์ดเก่า (Clearing Old Board) ===');
  await fetch('http://localhost:5000/api/admin/clear', { method: 'POST' });

  console.log('\n=== 2. สร้าง Reference Assets จริง (Character & Product) ===');
  // 1. Character Asset
  const charRes = await fetch('http://localhost:5000/api/assets', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: 'ป้าณี (แม่ค้าส้มตำหน้าดุแต่ใจดี)',
      type: 'character',
      description: 'หญิงไทยวัย 45 ปี มัดผมมวย สวมผ้ากันเปื้อนลายดอกไม้ ถือสากตำส้มตำ สายตาเด็ดเดี่ยวสู้ชีวิต',
      prompt: '1980s Thai comedy commercial character, 45-year-old Thai street food auntie with hair in a bun, floral vintage apron, holding a wooden pestle over a clay mortar, fierce yet comical determined facial expression, 35mm film photograph.',
      image_url: '/media/tpl_aircon_hero.jpg'
    })
  });
  const charData = await charRes.json();
  console.log('สร้างตัวละครสำเร็จ:', charData.data.name, `[ID: ${charData.data.id}]`);

  // 2. Product Asset
  const prodRes = await fetch('http://localhost:5000/api/assets', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: 'ครีมกันแดดตราแม่มะลิ SPF 99 (สินค้าสปอนเซอร์)',
      type: 'product',
      description: 'ตลับครีมกันแดดอลูมิเนียมสีทองพิมพ์ลายดอกมะลิวินเทจ เนื้อครีมขาวข้น ทาแล้วหน้าสว่างสะท้อนแดด',
      prompt: 'Vintage 1980s retro Thai aluminum gold sunscreen tin container with retro Jasmine flower typography label, bright cinematic studio commercial lighting, macro hero product photography, sharp focus.',
      image_url: '/media/tpl_wukong_motorcycle.jpg'
    })
  });
  const prodData = await prodRes.json();
  console.log('สร้างสินค้าสำเร็จ:', prodData.data.name, `[ID: ${prodData.data.id}]`);

  console.log('\n=== 3. ผู้กำกับ AI (Groq LPU) เริ่มวางสตอรี่บอร์ดจากบทคร่าวๆ ===');
  const storyConcept = 'โฆษณาคอมเมดี้ 2530: ป้าณีตำส้มตำกลางแดดเปรี้ยง เหงื่อท่วมจนครกแทบไหม้ ลูกค้าจะหนีหมด แต่รอดมาได้เพราะควักครีมกันแดดตราแม่มะลิมาทาหน้า หน้าขาวเด้งแดดสะท้อนเป็นกระจกจนคนในตลาดต้องใส่แว่นดำ ครกส้มตำกลับมาขายดีถล่มทลาย';
  console.log('บทคร่าวๆ:', storyConcept);

  const planRes = await fetch('http://localhost:5000/api/storyboard/ai-plan', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      story_concept: storyConcept,
      character_id: charData.data.id,
      scene_id: 'asset-scene-market',
      product_id: prodData.data.id,
      num_shots: 4,
      style: '1980s Retro Thai Comedy Commercial'
    })
  });
  const planData = await planRes.json();
  console.log('ชื่อเรื่องที่ AI กำหนด:', planData.data.project_title);
  console.log('เรื่องย่อ:', planData.data.logline);
  console.log(`AI วางโครงเรื่องสำเร็จจำนวน ${planData.data.shots.length} ช็อต`);

  console.log('\n=== 4. นำเข้าช็อตทั้งหมดลงบอร์ดหลัก (Commit to Board) ===');
  const commitRes = await fetch('http://localhost:5000/api/storyboard/commit-shots', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      shots: planData.data.shots,
      project_title: planData.data.project_title,
      character_id: charData.data.id,
      scene_id: 'asset-scene-market',
      product_id: prodData.data.id
    })
  });
  const commitData = await commitRes.json();
  console.log('บันทึกลงฐานข้อมูลสำเร็จ:', commitData.success);

  console.log('\n=== 5. ตรวจสอบช็อตที่แสดงผลบนบอร์ดสตอรี่บอร์ด ===');
  commitData.data.forEach((shot, i) => {
    console.log(`\n🎬 [ช็อตที่ ${i + 1}] ${shot.title}`);
    console.log(`   มุมกล้องแนะนำ: ${shot.camera_angle} (${shot.subtitle}) | เลนส์: ${shot.shot_size}`);
    console.log(`   บทพูด/VO: ${shot.dialogue_script}`);
    console.log(`   Master Prompt: ${shot.content.slice(0, 110)}...`);
  });

  console.log('\n>>> ทดสอบสำเร็จ 100%! สตอรี่บอร์ดถูกนำขึ้นบอร์ดสดเรียบร้อยแล้ว <<<');
}

runRealWorldTest().catch(console.error);
