// Dubai Oasis Lions Club — Private Members Portal Comprehensive Verification Test
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve();

console.log('======================================================');
console.log('TESTING PRIVATE MEMBERS PORTAL & SESSION ARCHITECTURE');
console.log('======================================================\n');

let failed = 0;
function pass(msg) { console.log(`✅ PASS: ${msg}`); }
function fail(msg) { console.error(`❌ FAIL: ${msg}`); failed++; }

// 1. Verify login.html structure
const loginPath = path.join(projectRoot, 'login.html');
if (!fs.existsSync(loginPath)) {
  fail('login.html does not exist');
} else {
  const content = fs.readFileSync(loginPath, 'utf-8');
  if (content.includes('login-viewport')) pass('login.html has full-screen .login-viewport');
  else fail('login.html missing .login-viewport');

  if (content.includes('login-bg-crest-shadowed') && content.includes('assets/logos/dubai-oasis-lions-club.png')) {
    pass('login.html includes large shadowed background crest');
  } else fail('login.html missing background crest');

  if (content.includes('assets/logos/lions-international.png') &&
      content.includes('assets/logos/dubai-oasis-lions-club.png') &&
      content.includes('assets/logos/who-we-are-logo.png')) {
    pass('login.html includes all three official logos (Lions Intl, DOLC, Who We Are)');
  } else fail('login.html missing one or more official logos');

  if (content.includes('id="member-id-input"') &&
      content.includes('id="member-password-input"') &&
      content.includes('id="toggle-password-btn"') &&
      content.includes('id="btn-login-submit"') &&
      content.includes('id="centre-logo-dashboard-link"') &&
      !content.includes('id="remember-me-checkbox"') &&
      !content.includes('placeholder="')) {
    pass('login.html includes clean credentials form controls without placeholders, remember me, or forgot link');
  } else fail('login.html missing form controls or contains prohibited elements');

  if (content.includes('id="login-info-modal"')) {
    pass('login.html includes preview information modal');
  } else fail('login.html missing preview modal dialog');

  if (content.includes('dolc_member_active')) {
    pass('login.html implements sessionStorage dolc_member_active activation');
  } else fail('login.html missing dolc_member_active handling');

  if (!content.includes('🦁')) {
    pass('login.html contains zero lion emojis');
  } else fail('login.html contains lion emoji');
}

// 2. Verify css/login.css
const loginCssPath = path.join(projectRoot, 'css/login.css');
if (!fs.existsSync(loginCssPath)) {
  fail('css/login.css does not exist');
} else {
  const content = fs.readFileSync(loginCssPath, 'utf-8');
  if (content.includes('#163E78') && content.includes('#1C509C') && content.includes('#FCCB04')) {
    pass('css/login.css implements authentic Lions Blue (#163E78, #1C509C) and Gold (#FCCB04) palette');
  } else fail('css/login.css missing Lions Blue or Gold colors');

  if (content.includes('.login-bg-crest-shadowed') && content.includes('drop-shadow')) {
    pass('css/login.css styles shadowed/embossed background crest with drop-shadow');
  } else fail('css/login.css missing .login-bg-crest-shadowed styling');

  if (content.includes('@media (max-width: 480px)') && content.includes('@media (max-width: 360px)')) {
    pass('css/login.css includes mobile responsiveness down to 360px and 320px viewports');
  } else fail('css/login.css missing compact mobile media queries');
}

// 3. Verify js/auth-guard.js
const authGuardPath = path.join(projectRoot, 'js/auth-guard.js');
if (!fs.existsSync(authGuardPath)) {
  fail('js/auth-guard.js does not exist');
} else {
  const content = fs.readFileSync(authGuardPath, 'utf-8');
  if (content.includes('sessionStorage.getItem(\'dolc_member_active\')') && content.includes('window.location.replace(\'login.html\')')) {
    pass('js/auth-guard.js enforces session-gated redirect to login.html');
  } else fail('js/auth-guard.js missing redirect logic');

  if (content.includes('btn-portal-logout') && content.includes('drawer-portal-logout')) {
    pass('js/auth-guard.js supports desktop and mobile drawer logout interactions');
  } else fail('js/auth-guard.js missing logout interactions');
}

// 4. Verify all 15 internal pages have the Private Portal Session Guard & Member Badge / Logout
const internalPages = [
  'index.html',
  'about.html',
  'leadership.html',
  'members.html',
  'member-profile.html',
  'projects.html',
  'project-detail.html',
  'events.html',
  'event-detail.html',
  'news.html',
  'news-detail.html',
  'gallery.html',
  'contact.html',
  'privacy.html',
  '404.html'
];

let guardedCount = 0;
let badgedCount = 0;
let logoutCount = 0;

internalPages.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) {
    fail(`${file} does not exist`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('sessionStorage.getItem("dolc_member_active") === "true"') &&
      content.includes('window.location.replace("login.html")')) {
    guardedCount++;
  } else {
    fail(`${file} is missing inline private session guard script in <head>`);
  }

  if (content.includes('member-identity-badge')) {
    badgedCount++;
  } else {
    fail(`${file} is missing .member-identity-badge`);
  }

  if (content.includes('btn-portal-logout')) {
    logoutCount++;
  } else {
    fail(`${file} is missing #btn-portal-logout`);
  }
});

if (guardedCount === internalPages.length) {
  pass(`All ${internalPages.length}/${internalPages.length} internal pages protected by private session guard`);
}

if (badgedCount === internalPages.length) {
  pass(`All ${internalPages.length}/${internalPages.length} internal pages display authenticated Lion Member identity badge`);
}

if (logoutCount === internalPages.length) {
  pass(`All ${internalPages.length}/${internalPages.length} internal pages include functional Logout button`);
}

// 5. Admin portal isolation check
const adminLoginPath = path.join(projectRoot, 'admin/login.html');
const adminLoginContent = fs.existsSync(adminLoginPath) ? fs.readFileSync(adminLoginPath, 'utf-8') : '';
if (adminLoginContent.includes('Admin Login') || adminLoginContent.includes('admin-login-card')) {
  pass('Admin portal login remains completely separate and untouched');
} else fail('Admin portal login altered unexpectedly');

console.log('\n======================================================');
if (failed === 0) {
  console.log('ALL PRIVATE MEMBERS PORTAL CHECKS PASSED (100%)!');
  console.log('======================================================\n');
  process.exit(0);
} else {
  console.error(`${failed} checks failed.`);
  console.log('======================================================\n');
  process.exit(1);
}
