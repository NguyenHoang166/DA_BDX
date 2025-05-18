const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Route xử lý chat
router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage || !userMessage.trim()) {
    return res.status(400).json({ error: 'Tin nhắn không được để trống' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Cấu hình API key không hợp lệ' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: userMessage }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const botResponse = response.data.candidates[0].content.parts[0].text;
    res.json({ reply: botResponse });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error.message);
    res.status(500).json({ error: 'Đã có lỗi xảy ra khi xử lý yêu cầu' });
  }
});

module.exports = router;