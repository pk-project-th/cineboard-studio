

async function testGroqGen() {
  console.log("1. Calling Groq AI for Script...");
  const groqRes = await fetch('http://localhost:5000/api/groq/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'ฮีโร่สายฟ้า Groq โผล่มาช่วยชาวบ้านที่หม้อแปลงระเบิด' })
  });
  const groqData = await groqRes.json();
  console.log(groqData.data.title);

  console.log("2. Calling Image Generator...");
  const genRes = await fetch('http://localhost:5000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: groqData.data.first_frame_prompt,
      title: groqData.data.title,
      aspect_ratio: '9:16',
      prompt_type: 'first_frame',
      dialogue_script: groqData.data.dialogue_script,
      recommended_tool: groqData.meta.provider
    })
  });
  const genData = await genRes.json();
  console.log("Success! Generated Image Card:", genData.data.title);
}

testGroqGen();
