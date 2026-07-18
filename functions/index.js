const { onCall, HttpsError } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `أنت مخطط رحلات سياحية خبير بالأردن تحديداً.
مهمتك: قراءة وصف حر من المستخدم لرحلته (مثل "معي 3 أيام وبدي أطلع عالعقبة")
وبناء جدول رحلة كامل ومفصل: الأماكن، الأوقات، أماكن الفطور والغدا المقترحة،
وميزانية تقريبية بالدينار الأردني لكل يوم.

لازم يكون ردك JSON فقط بدون أي نص إضافي قبله أو بعده، وبدون علامات markdown (بدون \`\`\`), بهذا الشكل بالضبط:

{
  "title": "عنوان مختصر وجذاب للرحلة",
  "totalDays": عدد الأيام كرقم,
  "days": [
    {
      "dayNumber": 1,
      "title": "عنوان اليوم (مثلاً: يوم في وسط العقبة)",
      "estimatedBudget": "تقدير تقريبي بالدينار لهذا اليوم (مثلاً: 25-35 دينار)",
      "stops": [
        {
          "time": "08:00 صباحاً",
          "type": "فطور",
          "place": "اسم المكان أو نوع المكان المقترح للفطور",
          "description": "وصف قصير عن المكان ولماذا يناسب",
          "durationHint": "مدة تقريبية"
        },
        {
          "time": "10:00 صباحاً",
          "type": "نشاط",
          "place": "اسم المعلم أو النشاط السياحي",
          "description": "وصف قصير",
          "durationHint": "مدة تقريبية"
        },
        {
          "time": "01:00 ظهراً",
          "type": "غدا",
          "place": "اسم المكان أو نوع المطعم المقترح للغدا",
          "description": "وصف قصير",
          "durationHint": "مدة تقريبية"
        }
      ]
    }
  ],
  "tips": ["نصيحة عملية 1", "نصيحة عملية 2"]
}

قواعد مهمة:
- كل يوم لازم يحتوي على الأقل: فطور واحد، نشاط أو أكثر، وغدا واحد (استخدم حقل "type" لتمييزها: فطور / نشاط / غدا / عشاء).
- استخدم أماكن ومطاعم حقيقية بالأردن فقط، وخصوصاً بالمنطقة يلي طلبها المستخدم.
- اجعل الميزانية اليومية واقعية ومحسوبة بناء على الأماكن المقترحة.
- اجعل عدد الأيام مطابق تماماً لما طلبه المستخدم.`;

exports.generateTrip = onCall({ region: 'us-central1', timeoutSeconds: 60 }, async (request) => {
  const { prompt } = request.data || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    throw new HttpsError('invalid-argument', 'الرجاء كتابة وصف واضح للرحلة المطلوبة.');
  }

  if (!ANTHROPIC_API_KEY) {
    logger.error('ANTHROPIC_API_KEY غير موجود بإعدادات الـ Functions');
    throw new HttpsError('failed-precondition', 'خدمة الذكاء الاصطناعي غير مهيّأة حالياً.');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt.trim() }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('خطأ من Claude API:', errText);
      throw new HttpsError('internal', 'حدث خطأ أثناء بناء الرحلة، حاول مرة ثانية.');
    }

    const data = await response.json();
    const rawText = data.content?.find((c) => c.type === 'text')?.text || '';

    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let tripPlan;
    try {
      tripPlan = JSON.parse(cleaned);
    } catch (parseErr) {
      logger.error('فشل تحويل رد الـ AI لـ JSON:', rawText);
      throw new HttpsError('internal', 'تعذّر فهم رد الذكاء الاصطناعي، حاول صياغة الوصف بشكل مختلف.');
    }

    return { success: true, trip: tripPlan };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('خطأ غير متوقع:', err);
    throw new HttpsError('internal', 'حدث خطأ غير متوقع، حاول لاحقاً.');
  }
});