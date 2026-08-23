/* Dedicated browser World Builder. Intentionally excluded from live directory/network data. */
(() => {
  const mount = document.querySelector('#world-builder-demo');
  if (!mount || typeof createWorldCard !== 'function' || typeof normalizeWorld !== 'function') return;

  const REGION_MAP = Object.freeze({
    'US East': { code: 'US', name: 'United States' },
    'US West': { code: 'US', name: 'United States' },
    'Canada': { code: 'CA', name: 'Canada' },
    'Europe': { code: 'DE', name: 'Germany' },
    'Oceania': { code: 'AU', name: 'Australia' },
    'Asia Pacific': { code: 'JP', name: 'Japan' },
  });

  const PLATFORM_OPTIONS = [
    ['steam', 'Steam', 'assets/platforms/steam.svg'],
    ['windows', 'Windows', 'assets/platforms/windows.svg'],
    ['xbox', 'Xbox', 'assets/platforms/xbox.svg'],
    ['playstation', 'PlayStation', 'assets/platforms/playstation.svg'],
    ['nintendo', 'Nintendo', 'assets/platforms/nintendo.svg'],
    ['epicgames', 'Epic Games', 'assets/platforms/epicgames.svg'],
  ];

  const FALLBACK_PRESETS = {
    rulePresets: [
      { id: 'normal', label: 'Normal', audience: 'general', description: 'General community rules.', tags: ['General'], rules: ['Be respectful to other players and staff.', 'No griefing or deliberately destructive behavior.', 'No cheating or exploits.', 'Follow moderator instructions.', 'Have fun and help keep the World welcoming.'] },
      { id: 'kids', label: 'Kids / Family Friendly', audience: 'kids', description: 'Child-appropriate chat and content.', tags: ['Kids', 'Family Friendly'], rules: ['Keep chat, names, signs, builds, and shared content family friendly.', 'No profanity, sexual content, graphic content, or adult-only material.', 'No bullying, harassment, threats, hate speech, or targeted insults.', 'Do not ask minors for private contact details or sensitive personal information.', 'No griefing, cheating, scams, or deliberately disruptive play.'] },
      { id: 'adults', label: 'Adults Only', audience: 'adults', description: '18+ community rules.', tags: ['18+', 'Mature Community'], rules: ['This community is intended for adults aged 18 and over.', 'Mature language and themes may be present, but harassment, hate speech, threats, and targeted abuse are not allowed.', 'No illegal content, doxxing, scams, malicious links, or attempts to obtain private credentials or personal information.', 'Respect other players boundaries and community moderation decisions.', 'No griefing, cheating, or exploits unless an explicitly labeled event allows it.'] },
      { id: 'custom', label: 'Custom', audience: 'general', description: 'Host-authored community rules.', tags: ['Custom Rules'], rules: [] },
    ],
    modFamilies: [
      { id: 'ue4ss', label: 'UE4SS', assetKey: 'ue4ss', description: 'UE4SS runtime/Lua mods.' },
      { id: 'runeschema', label: 'RuneSchema', assetKey: 'runeschema', description: 'RuneSchema data-driven mods.' },
      { id: 'paks', label: 'PAKs', assetKey: 'paks', description: 'Cooked Unreal package mods.' },
    ],
  };

  const REVIEWS = Object.freeze({
    main: [
      { score: 5, name: 'MapleKnight', text: 'Smooth sync, friendly people, and the curated mod list is easy to understand.' },
      { score: 5, name: 'RuneSmith', text: 'Joined from a fresh profile and everything matched the host without any fuss.' },
      { score: 4, name: 'FellhollowFox', text: 'Great community rules and uptime. Would happily play here again.' },
      { score: 5, name: 'AshRunner', text: 'The placard told me exactly what I needed before joining. Nice server.' },
    ],
    experimental: [
      { score: 5, name: 'TestPilot', text: 'The development features are genuinely useful and the server stayed stable for our session.' },
      { score: 4, name: 'PatchNotes', text: 'A couple rough edges, but the experimental WebGUI changes are promising.' },
      { score: 5, name: 'DragonTester', text: 'Fast sync and a surprisingly smooth preview build.' },
      { score: 4, name: 'BranchWalker', text: 'Good place to test upcoming features before they reach Main.' },
    ],
  });

  const utf8 = (value) => new TextEncoder().encode(value);
  const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  const randomHex = (length = 16) => {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return hex(bytes).slice(0, length);
  };
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.keys(value).sort().reduce((out, key) => { out[key] = canonical(value[key]); return out; }, {});
    return value;
  };
  const sha256Bytes = async (bytes) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)));
  const sha256Text = async (text) => sha256Bytes(utf8(text));
  const safeSlug = (value, fallback = 'world') => String(value || '').trim().replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 80) || fallback;
  const safeMember = (value) => {
    const raw = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length || parts.some((part) => part === '..' || /[\0-\x1f]/.test(part)) || /^[A-Za-z]:/.test(parts[0])) return '';
    return parts.join('/');
  };

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((Math.floor(date.getSeconds() / 2)) & 31),
      date: (((year - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31),
    };
  }
  function makeZip(entries) {
    const chunks = [];
    const central = [];
    let offset = 0;
    const stamp = dosDateTime();
    for (const entry of entries) {
      const name = utf8(entry.name);
      const data = entry.bytes;
      const crc = crc32(data);
      const local = new Uint8Array(30 + name.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0x0800, true); view.setUint16(8, 0, true);
      view.setUint16(10, stamp.time, true); view.setUint16(12, stamp.date, true); view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true);
      view.setUint16(26, name.length, true); view.setUint16(28, 0, true); local.set(name, 30);
      chunks.push(local, data);

      const cen = new Uint8Array(46 + name.length);
      const cv = new DataView(cen.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
      cv.setUint16(12, stamp.time, true); cv.setUint16(14, stamp.date, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true); cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true); cen.set(name, 46);
      central.push(cen);
      offset += local.length + data.length;
    }
    const centralSize = central.reduce((sum, item) => sum + item.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true); ev.setUint16(20, 0, true);
    return new Blob([...chunks, ...central, end], { type: 'application/zip' });
  }

  async function loadPresets() {
    try {
      const response = await fetch('assets/world-builder-presets.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      const payload = await response.json();
      if (!Array.isArray(payload.rulePresets) || !Array.isArray(payload.modFamilies)) throw new Error('Invalid preset payload');
      return payload;
    } catch (error) {
      console.warn('[Dragonwilds Sync] World Builder preset fallback:', error);
      return FALLBACK_PRESETS;
    }
  }

  loadPresets().then(init);

  function init(PRESETS) {
    const rulePresets = PRESETS.rulePresets.length ? PRESETS.rulePresets : FALLBACK_PRESETS.rulePresets;
    const modFamilies = PRESETS.modFamilies.length ? PRESETS.modFamilies : FALLBACK_PRESETS.modFamilies;
    const ruleById = (id) => rulePresets.find((item) => item.id === id) || rulePresets[0];
    const familyById = (id) => modFamilies.find((item) => item.id === id) || modFamilies[0];

    mount.className = 'section-shell home-demo';
    mount.innerHTML = `
      <div class="home-demo-shell reveal visible">
        <div class="home-demo-heading">
          <div class="section-heading">
            <div class="eyebrow">World Builder</div>
            <h2>Create the World profile before you ever launch it.</h2>
            <p>Main and Experimental change release-channel identity. The placard itself always flips between the selected channel's front and public-details side.</p>
          </div>
          <div class="demo-live-label">Local browser preview · not counted in network stats</div>
        </div>
        <div class="home-demo-grid">
          <div class="demo-placard-column">
            <div class="demo-card-toolbar">
              <div class="demo-channel-tabs" role="tablist" aria-label="Release channel">
                <button class="demo-channel-tab" type="button" role="tab" data-demo-channel="main" aria-selected="true">Main</button>
                <button class="demo-channel-tab experimental" type="button" role="tab" data-demo-channel="experimental" aria-selected="false">Experimental</button>
              </div>
              <div class="demo-layout-tabs" role="group" aria-label="Placard layout">
                <button class="demo-layout-tab" type="button" data-demo-layout="standard" aria-pressed="true">Standard</button>
                <button class="demo-layout-tab" type="button" data-demo-layout="horizontal" aria-pressed="false">Horizontal</button>
              </div>
            </div>
            <p class="demo-channel-help"><strong>Channel changes identity.</strong> Click the placard to flip it. On the reverse, Rules and Mod-family chips open their actual published contents. Click the stars for demo reviews.</p>
            <div class="demo-card-host" id="demo-card-host"></div>
            <div class="demo-card-caption"><span>Placard click = front/details.</span><strong>Browser-authored preview</strong></div>
          </div>

          <aside class="demo-builder" aria-label="World Builder controls">
            <div class="demo-builder-head"><div><span>CREATE A WORLD</span><h3>Editable World profile</h3></div><span>LOCAL</span></div>

            <div class="demo-step"><div class="demo-step-number">1</div><div class="demo-field demo-field-stack">
              <label for="demo-name">World identity</label>
              <input id="demo-name" type="text" maxlength="90" value="Ashenfall" aria-label="World name">
              <textarea id="demo-description" rows="3" maxlength="600" aria-label="World description">A friendly modded dedicated world showcasing synchronized clients, curated mods, public discovery, and secure remote administration.</textarea>
            </div></div>

            <div class="demo-step"><div class="demo-step-number">2</div><div class="demo-field demo-field-grid">
              <label>World configuration</label>
              <div class="demo-inline-fields">
                <select id="demo-mode" aria-label="World type"><option value="dedicated">Dedicated Server</option><option value="coop">Co-op Host</option><option value="single">Sync World</option></select>
                <select id="demo-hosting" aria-label="Hosting"><option>Dedicated</option><option>Community Hosted</option><option>Self Hosted</option></select>
              </div>
              <div class="demo-region-row">
                <select id="demo-region" aria-label="Region"><option>US East</option><option>US West</option><option>Canada</option><option>Europe</option><option>Oceania</option><option>Asia Pacific</option></select>
                <span class="demo-region-preview"><img id="demo-region-flag" alt=""><b id="demo-region-country">United States</b></span>
              </div>
              <div class="demo-checks"><label class="demo-check"><input id="demo-modded" type="checkbox" checked> Modded</label><label class="demo-check"><input id="demo-community" type="checkbox" checked> Discord</label><label class="demo-check"><input id="demo-public" type="checkbox" checked> Public</label></div>
              <input id="demo-tags" type="text" value="Curated Mods, Friendly, Building" aria-label="Comma separated tags" placeholder="Tags, comma separated">
            </div></div>

            <div class="demo-step"><div class="demo-step-number">3</div><div class="demo-field">
              <span>Platforms</span>
              <div class="demo-platforms">${PLATFORM_OPTIONS.map(([key, label, src], index) => `<label class="demo-platform"><input type="checkbox" data-demo-platform="${key}" data-label="${label}" ${index < 2 ? 'checked' : ''}><img src="${src}" alt=""><span>${label}</span></label>`).join('')}</div>
            </div></div>

            <div class="demo-step"><div class="demo-step-number">4</div><div class="demo-field demo-field-stack">
              <span>Community Rules</span>
              <div class="demo-rule-presets" id="demo-rule-presets">${rulePresets.map((preset) => `<button type="button" class="demo-rule-preset" data-rule-preset="${preset.id}" aria-pressed="${preset.id === 'normal'}">${preset.label}</button>`).join('')}</div>
              <div class="demo-rule-summary"><strong id="demo-rule-label">${ruleById('normal').label}</strong><span id="demo-rule-description">${ruleById('normal').description || ''}</span></div>
              <textarea id="demo-rules" rows="6" aria-label="Community rules, one per line">${ruleById('normal').rules.join('\n')}</textarea>
              <small class="demo-local-note">Presets are editable. Editing the text changes the profile to Custom Rules; the desktop application should preserve the preset ID plus final rule text.</small>
            </div></div>

            <div class="demo-step"><div class="demo-step-number">5</div><div class="demo-field demo-field-stack">
              <span>Mods by runtime family</span>
              <div class="demo-mod-family-tabs" id="demo-mod-family-tabs">${modFamilies.map((family, index) => `<button type="button" class="demo-mod-family-tab" data-demo-mod-family="${family.id}" aria-pressed="${index === 0}"><img src="assets/platforms/${family.assetKey}.svg" alt=""><span>${family.label}</span><b data-family-count="${family.id}">0</b></button>`).join('')}</div>
              ${modFamilies.map((family, index) => `<div class="demo-mod-family-editor ${index === 0 ? 'active' : ''}" data-demo-mod-editor="${family.id}"><span class="demo-mod-family-help">${family.description || ''}</span><textarea rows="4" data-demo-mods="${family.id}" aria-label="${family.label} mods, one per line"></textarea></div>`).join('')}
              <small class="demo-local-note">The published placard shows UE4SS, RuneSchema, and PAKs as clickable categories instead of flattening every mod into one unreadable row.</small>
            </div></div>

            <div class="demo-step"><div class="demo-step-number">6</div><div class="demo-field demo-field-stack">
              <label for="demo-background">Appearance</label>
              <select id="demo-background"><option value="1">Placard 1</option><option value="2">Placard 2</option><option value="3" selected>Placard 3</option><option value="4">Placard 4</option></select>
              <div class="demo-upload-grid">
                <label class="demo-upload"><strong>Icon image</strong><span id="demo-icon-label">Use demo icon</span><input id="demo-icon-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
                <label class="demo-upload"><strong>Banner image</strong><span id="demo-banner-label">Use demo banner</span><input id="demo-banner-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
              </div>
              <small class="demo-local-note">Custom icon/banner files stay in this browser tab and are packaged into the exported browser draft. They are never uploaded.</small>
            </div></div>

            <div class="demo-step"><div class="demo-step-number">7</div><div class="demo-field demo-field-stack">
              <span>World save · optional</span>
              <label class="demo-save-drop" id="demo-save-drop"><strong>Drop a World save or ZIP here</strong><span>or click to choose save files · up to 256 MiB total</span><input id="demo-save-files" type="file" multiple></label>
              <div class="demo-save-state"><strong id="demo-save-count">No save attached</strong><span id="demo-save-size">0 B</span></div>
              <small class="demo-local-note">Save bytes remain local. Save World packages them directly into the .rsdwl; no upload request is made.</small>
            </div></div>

            <div class="demo-builder-actions"><a class="button button-secondary" href="servers.html">Browse servers <span aria-hidden="true">→</span></a><button class="demo-reset" id="demo-reset" type="button">Reset</button><button class="button button-primary button-save-world" id="demo-save-world" type="button">Save World (.rsdwl) ↓</button></div>
          </aside>
        </div>
      </div>`;

    const host = mount.querySelector('#demo-card-host');
    const shell = mount.querySelector('.home-demo-shell');
    const channelTabs = [...mount.querySelectorAll('[data-demo-channel]')];
    const layoutTabs = [...mount.querySelectorAll('[data-demo-layout]')];
    const platformInputs = [...mount.querySelectorAll('[data-demo-platform]')];
    const ruleButtons = [...mount.querySelectorAll('[data-rule-preset]')];
    const familyButtons = [...mount.querySelectorAll('[data-demo-mod-family]')];
    const modEditors = [...mount.querySelectorAll('[data-demo-mod-editor]')];
    const modAreas = Object.fromEntries([...mount.querySelectorAll('[data-demo-mods]')].map((el) => [el.dataset.demoMods, el]));
    const fields = {
      name: mount.querySelector('#demo-name'), description: mount.querySelector('#demo-description'), mode: mount.querySelector('#demo-mode'), region: mount.querySelector('#demo-region'), hosting: mount.querySelector('#demo-hosting'),
      modded: mount.querySelector('#demo-modded'), community: mount.querySelector('#demo-community'), public: mount.querySelector('#demo-public'), tags: mount.querySelector('#demo-tags'), rules: mount.querySelector('#demo-rules'),
      background: mount.querySelector('#demo-background'), iconFile: mount.querySelector('#demo-icon-file'), bannerFile: mount.querySelector('#demo-banner-file'), saveFiles: mount.querySelector('#demo-save-files'),
    };

    let activeChannel = 'main';
    let activeLayout = 'standard';
    let activeRulePreset = 'normal';
    let activeModFamily = modFamilies[0]?.id || 'ue4ss';
    let demoCard = null;
    let localIconUrl = '';
    let localBannerUrl = '';
    let localIconFile = null;
    let localBannerFile = null;
    let worldSaveFiles = [];

    modAreas.ue4ss && (modAreas.ue4ss.value = 'DragonCore\nProximityLoot');
    modAreas.runeschema && (modAreas.runeschema.value = 'Extended Resources\nBetter Capes');
    modAreas.paks && (modAreas.paks.value = '');

    const csv = (value, max = 8) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, max);
    const lines = (value, max = 40) => String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, max);
    const regionData = () => REGION_MAP[fields.region.value] || REGION_MAP['US East'];
    const selectedPlatforms = () => platformInputs.filter((input) => input.checked).map((input) => ({ key: input.dataset.demoPlatform, label: input.dataset.label }));
    const modGroups = () => Object.fromEntries(modFamilies.map((family) => [family.id, lines(modAreas[family.id]?.value || '', 64)]));
    const currentRule = () => ({ ...ruleById(activeRulePreset), rules: lines(fields.rules.value, 40) });

    function updateRegionPreview() {
      const region = regionData();
      const flag = mount.querySelector('#demo-region-flag');
      const label = mount.querySelector('#demo-region-country');
      if (flag) { flag.src = `assets/flags/4x3/${region.code.toLowerCase()}.svg`; flag.alt = `${region.name} flag`; }
      if (label) label.textContent = region.name;
    }

    function updateFamilyCounts() {
      const groups = modGroups();
      modFamilies.forEach((family) => { const counter = mount.querySelector(`[data-family-count="${family.id}"]`); if (counter) counter.textContent = String(groups[family.id]?.length || 0); });
    }

    function ruleAudienceLabel(rule) {
      if (!fields.public.checked) return 'Invite Only';
      if (rule.audience === 'kids') return 'Kids / Family Friendly';
      if (rule.audience === 'adults') return 'Adults Only';
      return 'General';
    }

    function rawWorld(channel) {
      const isExperimental = channel === 'experimental';
      const modded = fields.modded.checked;
      const community = fields.community.checked;
      const isPublic = fields.public.checked;
      const mode = fields.mode.value;
      const region = regionData();
      const platforms = selectedPlatforms();
      const name = fields.name.value.trim() || 'Ashenfall';
      const description = fields.description.value.trim() || 'A Dragonwilds Sync World.';
      const customTags = csv(fields.tags.value, 8);
      const groups = modded ? modGroups() : Object.fromEntries(modFamilies.map((family) => [family.id, []]));
      const flattenedMods = modFamilies.flatMap((family) => groups[family.id] || []);
      const rule = currentRule();
      const platformLabels = platforms.map((entry) => entry.label);
      const runtimeBadges = modFamilies.filter((family) => groups[family.id]?.length).map((family) => family.label);
      const badges = [...platformLabels.map((label) => label === 'Steam' ? 'Steam Server' : label), ...runtimeBadges, 'Verified', ...(community ? ['Discord'] : []), ...(modded ? ['Nexus Mods', 'Modded'] : []), ...(isExperimental ? ['Experimental'] : ['Current'])];

      return {
        world_id: `web-${safeSlug(name).toLowerCase()}-${channel}`,
        nickname: name,
        world_name: name,
        description,
        region: fields.region.value,
        country_code: region.code,
        country_name: region.name,
        version: isExperimental ? 'CL-DEV' : (window.DWS_CURRENT_CL || 'CL-232224'),
        status: 'online',
        players: { current: isExperimental ? 4 : 12, max: 20 },
        tags: [isExperimental ? 'Experimental' : 'Main', mode === 'coop' ? 'Co-op' : mode === 'single' ? 'Sync World' : 'Dedicated', ...(modded ? ['Modded'] : ['Vanilla']), ...(isPublic ? ['Public'] : ['Private']), ...customTags].slice(0, 10),
        mods: flattenedMods,
        mod_groups: groups,
        rules: rule.rules,
        community_rule_profile: { id: activeRulePreset, label: rule.label, audience: rule.audience, tags: rule.tags || [], rules: rule.rules },
        badges,
        placard_background: fields.background.value,
        banner_url: localBannerUrl || 'assets/demo-world-banner.svg',
        icon_url: localIconUrl || 'assets/demo-world-icon.svg',
        source_name: 'Browser World Builder',
        host_type: mode,
        hosting: fields.hosting.value,
        audience: ruleAudienceLabel(rule),
        platform: platforms[0]?.label || '',
        platform_compatibility: Object.fromEntries(PLATFORM_OPTIONS.map(([key]) => [key, platforms.some((entry) => entry.key === key)])),
        content_type: modded ? 'Modded' : 'Vanilla',
        game_mode: isExperimental ? 'Preview' : 'Adventure',
        community: community ? { name: 'RSDW Community', invite_url: 'https://discord.gg/gQ7uY2cQ3q' } : {},
        rating: { average: isExperimental ? 4.6 : 4.9, count: isExperimental ? 18 : 128 },
        last_seen: Date.now(),
        public_connect: isPublic ? { host: 'preview-only.invalid', port: 7777 } : null,
        steam_build_id: window.currentSteamServerBuild || '',
        release_channel: channel,
      };
    }

    function addExperimentalRibbon(card) {
      if (activeChannel !== 'experimental') return;
      card.classList.add('demo-experimental-card');
      card.querySelectorAll('.world-card-face').forEach((face) => {
        const ribbon = document.createElement('div');
        ribbon.className = 'demo-experimental-ribbon';
        ribbon.dataset.releaseChannel = 'experimental';
        ribbon.innerHTML = '<span class="demo-experimental-ribbon-dot" aria-hidden="true"></span><strong>EXPERIMENTAL CHANNEL</strong><span>Active development · May be unstable</span>';
        face.appendChild(ribbon);
      });
    }

    function ensureReviewsDialog() {
      let dialog = document.querySelector('#demo-reviews-dialog');
      if (dialog) return dialog;
      dialog = document.createElement('dialog');
      dialog.id = 'demo-reviews-dialog';
      dialog.className = 'demo-reviews-dialog';
      dialog.innerHTML = '<div class="demo-reviews-window"><div class="demo-reviews-head"><div><span>DEMO REVIEWS</span><h3></h3></div><button type="button" class="demo-review-close" aria-label="Close reviews">×</button></div><div class="demo-reviews-summary"></div><div class="demo-review-list"></div><p class="demo-review-note">Fictional review data for the website builder preview.</p></div>';
      document.body.appendChild(dialog);
      dialog.querySelector('.demo-review-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
      return dialog;
    }

    function openReviews(world) {
      const dialog = ensureReviewsDialog();
      const reviews = REVIEWS[activeChannel];
      dialog.querySelector('h3').textContent = `${world.name} reviews`;
      dialog.querySelector('.demo-reviews-summary').innerHTML = `<strong>${world.ratingAverage.toFixed(1)}</strong><span>${'★'.repeat(Math.round(world.ratingAverage))}${'☆'.repeat(5 - Math.round(world.ratingAverage))}</span><small>${world.ratingCount} ratings</small>`;
      const list = dialog.querySelector('.demo-review-list'); list.replaceChildren();
      reviews.forEach((review) => { const row = document.createElement('article'); row.className = 'demo-review-row'; const head = document.createElement('div'); const author = document.createElement('strong'); author.textContent = review.name; const stars = document.createElement('span'); stars.textContent = `${'★'.repeat(review.score)}${'☆'.repeat(5 - review.score)}`; head.append(author, stars); const copy = document.createElement('p'); copy.textContent = review.text; row.append(head, copy); list.appendChild(row); });
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    }

    function enhanceRating(card, world) {
      const rating = card.querySelector('.world-card-front .world-rating');
      if (!rating) return;
      rating.classList.add('demo-rating-button'); rating.tabIndex = 0; rating.setAttribute('role', 'button'); rating.setAttribute('aria-label', `Open ${world.name} reviews`); rating.title = 'View demo reviews';
      const open = (event) => { event.preventDefault(); event.stopPropagation(); openReviews(world); };
      rating.addEventListener('click', open); rating.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') open(event); });
    }

    function renderDemo({ preserveSide = true } = {}) {
      const wasFlipped = Boolean(preserveSide && demoCard?.classList.contains('flipped'));
      const world = normalizeWorld(rawWorld(activeChannel));
      demoCard = createWorldCard(world);
      demoCard.classList.toggle('demo-horizontal-card', activeLayout === 'horizontal');
      addExperimentalRibbon(demoCard); enhanceRating(demoCard, world);
      if (wasFlipped) { demoCard.classList.add('flipped'); demoCard.setAttribute('aria-pressed', 'true'); }
      demoCard.setAttribute('aria-label', `${world.name} preview. ${activeChannel === 'experimental' ? 'Experimental' : 'Main'} channel. Click to flip between front and details.`);
      host.replaceChildren(demoCard);
      host.classList.toggle('horizontal', activeLayout === 'horizontal'); shell.classList.toggle('demo-horizontal-layout', activeLayout === 'horizontal');
      updateRegionPreview(); updateFamilyCounts();
    }

    function setChannel(channel) {
      activeChannel = channel === 'experimental' ? 'experimental' : 'main';
      channelTabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.demoChannel === activeChannel)));
      renderDemo({ preserveSide: false });
    }
    function setLayout(layout) {
      activeLayout = layout === 'horizontal' ? 'horizontal' : 'standard';
      layoutTabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.demoLayout === activeLayout)));
      renderDemo({ preserveSide: true });
    }
    function setModFamily(id) {
      activeModFamily = familyById(id).id;
      familyButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.demoModFamily === activeModFamily)));
      modEditors.forEach((editor) => editor.classList.toggle('active', editor.dataset.demoModEditor === activeModFamily));
    }
    function setRulePreset(id, { applyRules = true } = {}) {
      const preset = ruleById(id);
      activeRulePreset = preset.id;
      if (applyRules) fields.rules.value = preset.rules.join('\n');
      ruleButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.rulePreset === activeRulePreset)));
      mount.querySelector('#demo-rule-label').textContent = preset.label;
      mount.querySelector('#demo-rule-description').textContent = preset.description || '';
      renderDemo({ preserveSide: true });
    }

    function loadLocalImage(file, kind) {
      if (!file) return;
      if (!/^image\/(?:png|jpe?g|webp|gif)$/i.test(file.type) || file.size > 6 * 1024 * 1024) { window.alert('Use a PNG, JPEG, WebP, or GIF image up to 6 MB.'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        if (kind === 'icon') { localIconUrl = String(reader.result || ''); localIconFile = file; mount.querySelector('#demo-icon-label').textContent = file.name; }
        else { localBannerUrl = String(reader.result || ''); localBannerFile = file; mount.querySelector('#demo-banner-label').textContent = file.name; }
        renderDemo({ preserveSide: true });
      };
      reader.readAsDataURL(file);
    }

    const formatBytes = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KiB` : `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
    function setWorldSaveFiles(files) {
      const next = Array.from(files || []).filter((file) => file instanceof File);
      const total = next.reduce((sum, file) => sum + file.size, 0);
      if (total > 256 * 1024 * 1024) { window.alert('The browser World Builder currently allows up to 256 MiB of World-save data per .rsdwl.'); return; }
      worldSaveFiles = next.slice(0, 4096);
      mount.querySelector('#demo-save-count').textContent = worldSaveFiles.length ? `${worldSaveFiles.length} save file${worldSaveFiles.length === 1 ? '' : 's'} attached` : 'No save attached';
      mount.querySelector('#demo-save-size').textContent = formatBytes(worldSaveFiles.reduce((sum, file) => sum + file.size, 0));
    }

    async function payloadRecord(role, path, bytes, mediaType, required = true) {
      return { role, path, mediaType, sha256: await sha256Bytes(bytes), size: bytes.length, required };
    }

    async function buildRsdwl() {
      const button = mount.querySelector('#demo-save-world');
      button.disabled = true; button.textContent = 'Packaging…';
      try {
        const raw = rawWorld(activeChannel);
        const created = new Date().toISOString();
        const profileId = randomHex(24);
        const profileWorldKey = randomHex(24);
        const worldName = fields.name.value.trim() || 'Dragonwilds World';
        const groups = modGroups();
        const rule = currentRule();
        const platforms = selectedPlatforms();
        const draft = {
          format: 'dragonwilds-sync-web-world-draft', version: 1, name: worldName, description: raw.description, community_rules: rule.rules.join('\n'),
          community_rule_profile: { id: activeRulePreset, label: rule.label, audience: rule.audience, tags: rule.tags || [], rules: rule.rules },
          tags: csv(fields.tags.value, 20), classification: { content_type: fields.modded.checked ? 'modded' : 'vanilla', game_mode: activeChannel === 'experimental' ? 'preview' : 'normal', host_type: fields.mode.value, visibility: fields.public.checked ? 'public' : 'private', declared: true },
          audience: rule.audience || 'general', platform_compatibility: Object.fromEntries(PLATFORM_OPTIONS.map(([key]) => [key, platforms.some((entry) => entry.key === key)])), release_channel: activeChannel,
          placard_background: fields.background.value, runtimeIntent: { ue4ss: Boolean(groups.ue4ss?.length), runeschema: Boolean(groups.runeschema?.length), paks: Boolean(groups.paks?.length) }, mod_groups: groups,
          region: fields.region.value, country_code: regionData().code, hosting: fields.hosting.value, public: fields.public.checked, community_enabled: fields.community.checked,
        };
        const worldRow = {
          profileWorldKey, localWorldIdHint: '', nickname: worldName,
          identity: { world_name: worldName, server_profile_id_hint: '' },
          connection: { internal_ip: '', external_ip: '', preference: 'auto', game_port: 7777, sync_port: 0, server_number: 1 },
          credentials: { password: '', included: false },
          presentation: { description: raw.description, tags: draft.tags, mod_badges: modFamilies.filter((family) => groups[family.id]?.length).map((family) => family.label), audience: draft.audience, community: fields.community.checked ? { enabled: true } : {}, community_rules: draft.community_rules, community_rule_profile: draft.community_rule_profile, rating_average: 0, rating_count: 0, placard_background: fields.background.value },
          compatibility: { host_type: fields.mode.value, game_version: '', server_version: '', launcher_version: '', studio_compatible: false, fingerprint: '', platform_compatibility: draft.platform_compatibility, console_policy: {} },
          mods: modFamilies.flatMap((family) => groups[family.id] || []), modGroups: groups, modMetadata: [], manifestSummary: { description: raw.description, community_rules: draft.community_rules, tags: draft.tags, mod_summary: [], runtime_stack: draft.runtimeIntent }, source: { source: 'website-builder', source_id: '' }, timestamps: { exportedAtUtc: created }, release_channel: activeChannel,
        };
        const profileDoc = { profileId, profileName: worldName, displayName: 'Web Builder', about: 'Created with the Dragonwilds Sync browser World Builder', socialLinks: {}, characterWorlds: {}, worldCharacterSelection: {}, characters: [], customItems: [], exportedAtUtc: created };
        const worldsDoc = { format: 'dragonwilds-sync-worlds', version: 3, exportedAtUtc: created, snapshotId: randomHex(24), worldCount: 1, worlds: [worldRow] };
        const itemsDoc = { format: 'dragonwilds-sync-modded-items', version: 3, exported_at: created, merge_key: 'persistence_id', items: [] };

        const payloads = [];
        const addJson = (role, path, value, required = true) => payloads.push({ role, path, bytes: utf8(`${JSON.stringify(value, null, 2)}\n`), mediaType: 'application/json', required });
        addJson('profile-metadata', 'profile/profile.json', profileDoc, true);
        addJson('world-list', 'worlds/worlds.json', worldsDoc, true);
        addJson('server-profile-draft', `worlds/drafts/${profileWorldKey}/server-profile.json`, draft, true);
        addJson('custom-item-manifest', 'items/manifest.json', itemsDoc, false);

        for (const [kind, file] of [['world-icon', localIconFile], ['world-banner', localBannerFile]]) {
          if (!file) continue;
          const ext = (file.name.match(/\.[A-Za-z0-9]{1,8}$/)?.[0] || '').toLowerCase() || (file.type.includes('png') ? '.png' : file.type.includes('jpeg') ? '.jpg' : file.type.includes('webp') ? '.webp' : '.bin');
          payloads.push({ role: kind, path: `worlds/assets/${profileWorldKey}/${kind === 'world-icon' ? 'icon' : 'banner'}${ext}`, bytes: new Uint8Array(await file.arrayBuffer()), mediaType: file.type || 'application/octet-stream', required: false });
        }

        if (worldSaveFiles.length === 1 && /\.zip$/i.test(worldSaveFiles[0].name)) {
          const file = worldSaveFiles[0];
          payloads.push({ role: 'world-save-archive', path: `worlds/saves/${profileWorldKey}/world-save.zip`, bytes: new Uint8Array(await file.arrayBuffer()), mediaType: file.type || 'application/zip', required: false });
        } else {
          for (const file of worldSaveFiles) {
            const relative = safeMember(file.webkitRelativePath || file.name);
            if (!relative) throw new Error(`Unsafe World-save path: ${file.name}`);
            payloads.push({ role: 'world-save-file', path: `worlds/saves/${profileWorldKey}/${relative}`, bytes: new Uint8Array(await file.arrayBuffer()), mediaType: file.type || 'application/octet-stream', required: false });
          }
        }

        const records = [];
        for (const payload of payloads) records.push(await payloadRecord(payload.role, payload.path, payload.bytes, payload.mediaType, payload.required));
        const digest = await sha256Text(JSON.stringify(canonical(records)));
        const fingerprint = 'browser-draft';
        const exportKey = await sha256Text(`${fingerprint}|${created}|${digest}`);
        const manifest = {
          format: 'dragonwilds-sync-launcher', version: 3, packageType: 'profile', packageId: randomHex(32), createdAtUtc: created,
          producer: { application: 'Dragonwilds Sync Web Builder', version: 'web-v1', fingerprint }, profile: { profileId, profileName: worldName },
          layout: { profileRoot: 'profile/', worldsRoot: 'worlds/', itemsRoot: 'items/' }, payloads: records,
          security: { digestAlgorithm: 'sha256', payloadIndexSha256: digest, exportKey, trustMode: 'website-draft' },
          metadata: { charactersIncluded: false, worldsIncluded: true, worldArtworkIncluded: Boolean(localIconFile || localBannerFile), worldSaveIncluded: Boolean(worldSaveFiles.length), websiteDraft: true },
        };
        const entries = [{ name: 'manifest.json', bytes: utf8(`${JSON.stringify(manifest, null, 2)}\n`) }, ...payloads.map((payload) => ({ name: payload.path, bytes: payload.bytes }))];
        const blob = makeZip(entries);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${safeSlug(worldName, 'Dragonwilds-World')}.rsdwl`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch (error) {
        console.error('[Dragonwilds Sync] World Builder export failed:', error);
        window.alert(`Could not create the .rsdwl browser draft. ${error?.message || error}`);
      } finally {
        button.disabled = false; button.textContent = 'Save World (.rsdwl) ↓';
      }
    }

    channelTabs.forEach((tab) => tab.addEventListener('click', () => setChannel(tab.dataset.demoChannel)));
    layoutTabs.forEach((tab) => tab.addEventListener('click', () => setLayout(tab.dataset.demoLayout)));
    familyButtons.forEach((button) => button.addEventListener('click', () => setModFamily(button.dataset.demoModFamily)));
    ruleButtons.forEach((button) => button.addEventListener('click', () => setRulePreset(button.dataset.rulePreset)));

    [fields.name, fields.description, fields.tags].forEach((field) => field.addEventListener('input', () => renderDemo({ preserveSide: true })));
    [fields.mode, fields.region, fields.hosting, fields.modded, fields.community, fields.public, fields.background].forEach((field) => field.addEventListener('change', () => renderDemo({ preserveSide: true })));
    platformInputs.forEach((field) => field.addEventListener('change', () => renderDemo({ preserveSide: true })));
    Object.values(modAreas).forEach((field) => field.addEventListener('input', () => renderDemo({ preserveSide: true })));
    fields.rules.addEventListener('input', () => {
      if (activeRulePreset !== 'custom') {
        activeRulePreset = 'custom';
        ruleButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.rulePreset === 'custom')));
        const custom = ruleById('custom'); mount.querySelector('#demo-rule-label').textContent = custom.label; mount.querySelector('#demo-rule-description').textContent = custom.description || '';
      }
      renderDemo({ preserveSide: true });
    });
    fields.iconFile.addEventListener('change', () => loadLocalImage(fields.iconFile.files?.[0], 'icon'));
    fields.bannerFile.addEventListener('change', () => loadLocalImage(fields.bannerFile.files?.[0], 'banner'));
    fields.saveFiles.addEventListener('change', () => setWorldSaveFiles(fields.saveFiles.files));
    const saveDrop = mount.querySelector('#demo-save-drop');
    ['dragenter', 'dragover'].forEach((type) => saveDrop.addEventListener(type, (event) => { event.preventDefault(); saveDrop.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach((type) => saveDrop.addEventListener(type, (event) => { event.preventDefault(); saveDrop.classList.remove('dragover'); }));
    saveDrop.addEventListener('drop', (event) => setWorldSaveFiles(event.dataTransfer?.files));
    mount.querySelector('#demo-save-world').addEventListener('click', buildRsdwl);

    mount.querySelector('#demo-reset').addEventListener('click', () => {
      fields.name.value = 'Ashenfall'; fields.description.value = 'A friendly modded dedicated world showcasing synchronized clients, curated mods, public discovery, and secure remote administration.'; fields.mode.value = 'dedicated'; fields.region.value = 'US East'; fields.hosting.value = 'Dedicated'; fields.modded.checked = true; fields.community.checked = true; fields.public.checked = true; fields.tags.value = 'Curated Mods, Friendly, Building'; fields.background.value = '3';
      fields.iconFile.value = ''; fields.bannerFile.value = ''; fields.saveFiles.value = ''; mount.querySelector('#demo-icon-label').textContent = 'Use demo icon'; mount.querySelector('#demo-banner-label').textContent = 'Use demo banner'; localIconUrl = ''; localBannerUrl = ''; localIconFile = null; localBannerFile = null; setWorldSaveFiles([]);
      platformInputs.forEach((input, index) => { input.checked = index < 2; });
      modAreas.ue4ss && (modAreas.ue4ss.value = 'DragonCore\nProximityLoot'); modAreas.runeschema && (modAreas.runeschema.value = 'Extended Resources\nBetter Capes'); modAreas.paks && (modAreas.paks.value = '');
      activeChannel = 'main'; activeLayout = 'standard'; channelTabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.demoChannel === 'main'))); layoutTabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.demoLayout === 'standard'))); setModFamily(modFamilies[0]?.id || 'ue4ss'); setRulePreset('normal'); renderDemo({ preserveSide: false });
    });

    ensureReviewsDialog(); updateRegionPreview(); updateFamilyCounts(); setModFamily(activeModFamily); setRulePreset('normal'); renderDemo({ preserveSide: false });
  }
})();
