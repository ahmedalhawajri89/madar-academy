# أكاديمية مدار — صفحة الهبوط (Madar Academy Landing Page)

صفحة هبوط عربية أولًا (RTL) ومتجاوبة لمركز تدريبي، مبنية بـ **React + GSAP**، مع دعم كامل للإنجليزية (LTR).

> البيانات الحالية تجريبية (الاسم، الدورات، المدربون، الصور، رقم واتساب) — كلها في ملف واحد: [`src/i18n/content.ts`](src/i18n/content.ts).

## التقنيات

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** — الألوان والخطوط كـ tokens في [`src/index.css`](src/index.css)
- **GSAP 3** مع `@gsap/react`: ScrollTrigger · SplitText · Flip · DrawSVG · ScrambleText
- **Lenis** للتمرير الناعم · **lucide-react** للأيقونات · **react-hook-form** للنموذج

## أبرز التفاصيل

- **Hero بجسيمات تتشكّل** (Canvas): ~2,600 جسيم تتحوّل بين أشكال المجالات بالتزامن مع الكلمة المتبدّلة في العنوان، تتفادى المؤشر، وتتبعثر مع التمرير — [`src/lib/particles.ts`](src/lib/particles.ts)
- مسارات مهنية بتمرير أفقي مثبّت، فلترة الدورات بـ Flip، مسار رحلة يُرسم مع التمرير، عدّادات، عرض شرائح قابل للوصول، نموذج تسجيل من 3 خطوات
- كل الحركات تحترم `prefers-reduced-motion`، والاتجاه الأفقي ينعكس تلقائيًا بين العربية والإنجليزية

## التشغيل محليًا

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # نسخة الإنتاج في dist/
```

## النشر على Vercel

المشروع يعمل على Vercel دون إعدادات إضافية: Framework **Vite**، أمر البناء `npm run build`، ومجلد الإخراج `dist`.

## قبل الإطلاق الفعلي

- استبدال البيانات والصور التجريبية في `src/i18n/content.ts`
- ربط نموذج التسجيل (`src/components/sections/Contact.tsx`) والنشرة البريدية بـ API أو CRM
- وضع رقم واتساب الحقيقي (`shared.whatsapp`)
