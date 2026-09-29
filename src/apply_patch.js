// شغّله من مجلد src بمشروعك:  node apply_patch.js
const fs = require('fs');

const FILE = 'App.js';
if (!fs.existsSync(FILE)) { console.error('❌ ما لقيت App.js بهاد المجلد. ادخل لمجلد src أولاً.'); process.exit(1); }
if (!fs.existsSync('LegalAndImpact.js')) { console.error('❌ حط LegalAndImpact.js بنفس المجلد أولاً.'); process.exit(1); }

let code = fs.readFileSync(FILE, 'utf8');
if (code.includes("from './LegalAndImpact'")) { console.log('ℹ️ التعديلات مطبقة أصلاً، ما في شي جديد.'); process.exit(0); }
fs.writeFileSync('App.js.bak', code);
console.log('💾 نسخة احتياطية: App.js.bak');

let failed = 0;
function patch(label, oldStr, newStr, all) {
  if (!code.includes(oldStr)) { console.log('⚠️ ما لقيت: ' + label); failed++; return; }
  code = all ? code.split(oldStr).join(newStr) : code.replace(oldStr, () => newStr);
  console.log('✅ ' + label);
}

patch('import',
  "import AboutPage from './AboutPage';",
  "import AboutPage from './AboutPage';\nimport { SiteFooter, LegalModal, FeedbackModal } from './LegalAndImpact';");

patch('states',
  "const [showMoreMenu, setShowMoreMenu] = useState(false);",
  "const [showMoreMenu, setShowMoreMenu] = useState(false);\n  const [showLegal, setShowLegal] = useState(false);\n  const [showFeedback, setShowFeedback] = useState(false);");

patch('footer + modals',
  "<RahalChatbot userLocation={userLocation} userPlaces={approvedUserPlaces} lang={lang} />",
  "<SiteFooter lang={lang} onOpenLegal={() => setShowLegal(true)} onOpenFeedback={() => setShowFeedback(true)} />\n      {showLegal && <LegalModal lang={lang} onClose={() => setShowLegal(false)} />}\n      {showFeedback && <FeedbackModal user={user} lang={lang} onClose={() => setShowFeedback(false)} />}\n      <RahalChatbot userLocation={userLocation} userPlaces={approvedUserPlaces} lang={lang} />");

patch('AI label (ar)', 'ابنيلي رحلة بالـ AI', 'ابنيلي رحلة ذكية', true);
patch('AI label (en)', 'Build My Trip with AI', 'Build My Smart Trip', true);

fs.writeFileSync(FILE, code);
console.log(failed ? '\n⚠️ بعض التعديلات ما انطبقت (' + failed + '). ابعتلي الرسالة وبصلحها.' : '\n🎉 خلصت كل التعديلات.');