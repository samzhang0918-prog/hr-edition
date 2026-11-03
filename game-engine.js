/**
 * 《带队吧，老板！》（人力资源与组织激励沙盘·纯管理版）核心确定性沙盘引擎
 * 严格基于 UTF-8 SHA-256 + Mulberry32 确定性伪随机流，零 Math.random()
 * 遵循硬结算顺序与组织人力资源五维评估模型
 */

(function (global) {
  const Data = typeof module !== 'undefined' && module.exports
    ? require('./game-data.js')
    : global.GameData;

  const {
    PRD_CONFIG,
    DIRECTIONS,
    TRAIT_META,
    TEAM_CARDS,
    MONTHLY_ACTIONS,
    ROAD_SCENE_OPTIONS,
    EMERGENCY_EVENTS,
    SOP_ITEMS,
    BRICK_SUBTITLES,
    PENALTY_BRICK_SUBTITLE,
    MANAGEMENT_PROFILES
  } = Data;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function deepClone(val) {
    return JSON.parse(JSON.stringify(val));
  }

  // 纯 JS 同步标准 UTF-8 SHA-256
  function utf8ToBytes(str) {
    if (typeof TextEncoder !== 'undefined') {
      return Array.from(new TextEncoder().encode(str));
    }
    const utf8 = unescape(encodeURIComponent(str));
    const bytes = [];
    for (let i = 0; i < utf8.length; i++) {
      bytes.push(utf8.charCodeAt(i));
    }
    return bytes;
  }

  function sha256Bytes(asciiBytes) {
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    let H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    const bitLen = asciiBytes.length * 8;
    const msg = asciiBytes.slice();
    msg.push(0x80);
    while ((msg.length % 64) !== 56) {
      msg.push(0);
    }
    const hi = Math.floor(bitLen / 0x100000000);
    const lo = bitLen >>> 0;
    msg.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
    msg.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

    const W = new Array(64);
    for (let i = 0; i < msg.length; i += 64) {
      for (let t = 0; t < 16; t++) {
        const j = i + t * 4;
        W[t] = ((msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3]) >>> 0;
      }
      for (let t = 16; t < 64; t++) {
        const s0 = (rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3)) >>> 0;
        const s1 = (rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10)) >>> 0;
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
        const ch = ((e & f) ^ (~e & g)) >>> 0;
        const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
        const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
        const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        const temp2 = (S0 + maj) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }

    const out = [];
    for (let i = 0; i < 8; i++) {
      out.push(
        (H[i] >>> 24) & 0xff,
        (H[i] >>> 16) & 0xff,
        (H[i] >>> 8) & 0xff,
        H[i] & 0xff
      );
    }
    return out;
  }

  function rotr(n, b) {
    return ((n >>> b) | (n << (32 - b))) >>> 0;
  }

  function computeSeedFromName(projectName) {
    const bytes = sha256Bytes(utf8ToBytes(projectName));
    const hi = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    const lo = ((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) >>> 0;
    return (hi ^ lo) >>> 0;
  }

  class Mulberry32 {
    constructor(seedUint32) {
      this.state = seedUint32 >>> 0;
    }

    nextUint32() {
      let t = (this.state += 0x6d2b79f5) | 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (t ^ (t >>> 14)) >>> 0;
    }

    nextFloat() {
      return this.nextUint32() / 4294967296;
    }
  }

  function rngU32(seed, tag) {
    const bytes = sha256Bytes(utf8ToBytes(`${seed}:${tag}`));
    const u32 = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    const m = new Mulberry32((seed ^ u32) >>> 0);
    return m.nextUint32();
  }

  class ManagerSandboxGameEngine {
    constructor() {
      this.reset();
    }

    reset() {
      this.projectName = PRD_CONFIG.default_project_name;
      this.seed = 0;
      this.rng = null;

      this.state = {
        month: 1,
        budget: 8000,
        payroll_monthly: 0,
        morale: 72,
        market: 70,        // 画饼信誉度 / 雇主品牌口碑
        oem_relation: 60,  // 董事会信任 / 组织协同度
        delay_weeks: 0,
        spec_gate: 'risk',
        function_freeze: 'risk',
        freeze_mod: 0,
        safety_release: 'risk',
        feature_cut: [],
        audited: { road: false, data: false, safety: false },
        dirs: {
          perception: { team_id: null, progress: 8, true_quality: 0 },
          planning: { team_id: null, progress: 8, true_quality: 0 },
          fs: { team_id: null, progress: 5, true_quality: 0 },
          data: { team_id: null, progress: 10, true_quality: 0 },
          oem: { team_id: null, progress: 12, true_quality: 0 },
          road: { team_id: null, progress: 10, true_quality: 0 }
        }
      };

      this.teamConfirmed = false;
      this.extraFakeMileage = 0;
      this.extraReportedCorners = 0;
      this.pendingReportedCornersBonus = 0;
      this.safetyActionSucceeded = false;
      this.forcedSafetyStable = false;
      this.oemPleaseToreFreezeThisMonth = false;
      this.oemPleaseActThisMonth = false;
      this.sopRiskModifiers = {
        rain_ped: 0,
        cone: 0,
        ghost: 0,
        gnss: 0,
        brake: 0,
        label: 0
      };

      this.usedEmergencyIds = [];
      this.currentMonthEmergencies = [];
      this.currentEmergencyIndex = 0;
      this.readyForSOP = false;
      this.noOtRotationIndex = 0;

      this.lastActionResult = null;
      this.currentMonthlyReport = null;

      this.sopDecisions = {};
      SOP_ITEMS.forEach(item => {
        this.sopDecisions[item.id] = null;
      });
      this.sopBaseBudget = null;
      this.sopBaseDelayWeeks = 0;
      this.sopConfirmed = false;

      this.choiceHistory = [];
      this.finalOutcome = null;
    }

    initProject(rawName) {
      this.reset();
      const trimmed = (rawName || '').trim().slice(0, 16);
      this.projectName = trimmed.length > 0 ? trimmed : PRD_CONFIG.default_project_name;
      this.seed = computeSeedFromName(this.projectName);
      this.rng = new Mulberry32(this.seed);
      return {
        projectName: this.projectName,
        seed: this.seed
      };
    }

    selectTeamCard(dirId, cardId) {
      if (this.teamConfirmed) {
        throw new Error("团队名单已确认，无法修改组队");
      }
      const dir = DIRECTIONS.find(d => d.id === dirId);
      if (!dir) throw new Error(`未知的团队席位: ${dirId}`);
      const card = TEAM_CARDS.find(c => c.id === cardId && c.dir === dirId);
      if (!card) throw new Error(`卡片 ${cardId} 不属于席位 ${dirId}`);

      this.state.dirs[dirId].team_id = cardId;
      return this.getTeamSelectionStatus();
    }

    getTeamSelectionStatus() {
      const selections = {};
      let allSelected = true;
      let totalSalary = 0;
      let totalHeadcount = 0;

      DIRECTIONS.forEach(d => {
        const teamId = this.state.dirs[d.id].team_id;
        if (!teamId) {
          allSelected = false;
          selections[d.id] = null;
        } else {
          const card = TEAM_CARDS.find(c => c.id === teamId);
          selections[d.id] = card;
          totalSalary += card.salary_month;
          totalHeadcount += card.headcount;
        }
      });

      return {
        selections,
        allSelected,
        totalSalary,
        totalHeadcount,
        initialBudget: PRD_CONFIG.initial_budget,
        totalMonths: PRD_CONFIG.total_months
      };
    }

    confirmTeam() {
      const status = this.getTeamSelectionStatus();
      if (!status.allSelected) {
        throw new Error("所有 6 个核心席位必须全部配置成员，不可空缺！");
      }

      this.state.payroll_monthly = status.totalSalary;
      DIRECTIONS.forEach(d => {
        const card = status.selections[d.id];
        this.state.dirs[d.id].true_quality = card.true_power;
      });

      this.teamConfirmed = true;
      this.updateStatusGates();
      this.refreshMonthlyReport();
      return this.getStateSnapshot();
    }

    getTeamCard(dirId) {
      const teamId = this.state.dirs[dirId].team_id;
      return TEAM_CARDS.find(c => c.id === teamId);
    }

    getPublicTeamCards(dirId = null) {
      const list = dirId ? TEAM_CARDS.filter(c => c.dir === dirId) : TEAM_CARDS;
      return list.map(c => ({
        id: c.id,
        dir: c.dir,
        name: c.name,
        headcount: c.headcount,
        salary_month: c.salary_month,
        years: c.years,
        blurb: c.blurb
      }));
    }

    updateStatusGates() {
      const planningP = this.state.dirs.planning.progress;
      const perceptionP = this.state.dirs.perception.progress;
      const fsP = this.state.dirs.fs.progress;
      const fsQ = this.state.dirs.fs.true_quality;
      const oemRel = this.state.oem_relation;

      // 1. 激励秩序与大锅饭收敛度
      if (this.oemPleaseToreFreezeThisMonth) {
        this.state.function_freeze = 'risk';
      } else {
        const sumP = planningP + perceptionP;
        const { freeze_converging_sum, freeze_stable_sum } = PRD_CONFIG.balance;
        let baseLevel = 0;
        if (sumP >= freeze_stable_sum) {
          baseLevel = 2;
        } else if (sumP >= freeze_converging_sum) {
          baseLevel = 1;
        }
        let finalLevel = clamp(baseLevel + this.state.freeze_mod, 0, 2);
        if (this.oemPleaseActThisMonth && finalLevel > 1) {
          finalLevel = 1;
        }
        const freezeLevels = ['risk', 'converging', 'stable'];
        this.state.function_freeze = freezeLevels[finalLevel];
      }

      // 2. 核心骨干留任安全盘
      if (this.forcedSafetyStable) {
        this.state.safety_release = 'stable';
      } else {
        if (fsQ >= 55 && (this.safetyActionSucceeded || this.state.audited.safety)) {
          this.state.safety_release = 'stable';
        } else if (fsP >= 40 && (this.state.audited.safety || this.safetyActionSucceeded)) {
          this.state.safety_release = 'converging';
        } else {
          this.state.safety_release = 'risk';
        }
      }

      // 3. 董事会信任与组织协同
      if (oemRel >= 75) {
        this.state.spec_gate = 'stable';
      } else if (oemRel >= 50) {
        this.state.spec_gate = 'converging';
      } else {
        this.state.spec_gate = 'risk';
      }
    }

    applyNaturalProgress() {
      const rate = PRD_CONFIG.balance.natural_progress_rate;
      const moraleMult = this.state.morale < 35 ? 0.75 : 1.0;
      DIRECTIONS.forEach(d => {
        const team = this.getTeamCard(d.id);
        if (!team) return;
        const gain = Math.round(team.true_power * rate * moraleMult);
        this.state.dirs[d.id].progress = clamp(this.state.dirs[d.id].progress + gain, 0, 100);
      });
    }

    advanceMonth() {
      this.currentMonthEmergencies = [];
      this.currentEmergencyIndex = 0;
      if (this.state.month >= PRD_CONFIG.total_months) {
        this.readyForSOP = true;
        return { monthFinished: true, readyForSOP: true };
      }
      this.state.month++;
      return { monthFinished: true, readyForSOP: false };
    }

    executeMonthlyAction(actionId, targetDir = null, extraParam = null) {
      if (!this.teamConfirmed) throw new Error("请先确认团队名单");
      if (this.readyForSOP || this.state.month > PRD_CONFIG.total_months) throw new Error("已完成年度冲刺，请进入年终奖分配大会阶段");

      const action = MONTHLY_ACTIONS.find(a => a.id === actionId);
      if (!action) throw new Error(`未知的管理动作: ${actionId}`);

      if (action.requires_dir) {
        if (!targetDir || !action.valid_dirs.includes(targetDir)) {
          throw new Error(`动作 ${action.name} 必须指定合法目标席位: ${action.valid_dirs.join(', ')}`);
        }
      } else {
        targetDir = null;
      }

      if (action.id === 'road_scene') {
        if (!extraParam || !['highway', 'urban_rain'].includes(extraParam)) {
          throw new Error("组织团建动作必须在「周末铁血军事拓展 (highway)」与「周五带薪腐败游 (urban_rain)」中二选一");
        }
      }

      // 1. 扣除管理费用
      if (!(action.cost === 0 || this.state.budget >= action.cost)) {
        throw new Error(`薪酬包预算不足！当前预算 ${this.state.budget} 万，需要 ${action.cost} 万`);
      }
      this.state.budget -= action.cost;

      // 重置当月瞬时标记
      this.oemPleaseToreFreezeThisMonth = false;
      this.oemPleaseActThisMonth = false;

      // 2. 结算管理动作效果
      const actionResult = this.computeActionEffects(action, targetDir, extraParam);
      this.lastActionResult = actionResult;

      // 自然进度推进（动作效果结算之后、updateStatusGates 之前）
      this.applyNaturalProgress();

      // 3. 扣除当月团队固定月薪
      this.state.budget -= this.state.payroll_monthly;

      // 4. 预算超支检查
      let salaryOverrunAlert = false;
      let overrunRatio = 0;
      if (this.state.budget < 0) {
        overrunRatio = Math.abs(this.state.budget) / PRD_CONFIG.initial_budget;
        if (overrunRatio > PRD_CONFIG.salary_overrun_threshold) {
          salaryOverrunAlert = true;
        }
      }

      // 5. 刷新月度汇报
      if (this.pendingReportedCornersBonus > 0) {
        this.extraReportedCorners += this.pendingReportedCornersBonus;
        this.pendingReportedCornersBonus = 0;
      }
      this.updateStatusGates();
      const monthlyReport = this.refreshMonthlyReport();

      // 记录管理操作历史
      this.choiceHistory.push({
        month: this.state.month,
        type: 'action',
        action_id: action.id,
        action_name: action.name,
        target_dir: targetDir,
        extra_param: extraParam,
        result: actionResult,
        budget_after: this.state.budget,
        morale_after: this.state.morale
      });

      // 6. 抽取当月管理困境突发
      this.generateEmergenciesForCurrentMonth();

      let monthFinished = false;
      let readyForSOP = false;
      if (this.currentMonthEmergencies.length === 0) {
        const adv = this.advanceMonth();
        monthFinished = adv.monthFinished;
        readyForSOP = adv.readyForSOP;
      }

      return {
        actionResult,
        monthlyReport,
        salaryOverrunAlert,
        overrunRatio,
        emergencies: this.currentMonthEmergencies,
        monthFinished,
        readyForSOP
      };
    }

    computeActionEffects(action, targetDir, extraParam) {
      let notes = [];
      let multiplier = 1.0;
      let targetTeam = targetDir ? this.getTeamCard(targetDir) : null;

      // 人格特质乘子与组织反噬修正
      if (targetTeam) {
        if (action.id === 'overtime') {
          if (targetTeam.traits.includes('no_ot')) {
            multiplier *= 0.5;
            this.state.morale = clamp(this.state.morale - 4, 0, 100);
            notes.push(`【反内卷抗命】${targetTeam.name} 强烈抵制 361 末尾淘汰恐吓，集体开启演戏敷衍模式，效果减半，敬业度额外 -4！`);
          } else if (targetTeam.traits.includes('no_mgmt')) {
            multiplier *= 0.5;
            this.state.morale = clamp(this.state.morale - 4, 0, 100);
            notes.push(`【实干派抗命】${targetTeam.name} 怒斥高压淘汰寒了功臣的心，当场拍桌抗议，效果减半，敬业度额外 -4！`);
          }
        }

        if (action.id === 'safety_case') {
          if (targetTeam.traits.includes('no_mgmt')) {
            multiplier *= 0.5;
            notes.push(`【务实派本色】${targetTeam.name} 不善写感谢信作秀（表面声量折半），但拿了调薪后干活无比踏实！`);
          }
        }
      }

      // 协同枢纽和稀泥老好人妥协风险（破除大锅饭）
      if (action.id === 'cut') {
        const oemTeam = this.getTeamCard('oem');
        if (oemTeam && oemTeam.traits.includes('oem_please')) {
          const cutRoll = rngU32(this.seed, `cut_resist:${this.state.month}`) % 100;
          if (cutRoll < 50) {
            this.state.market = clamp(this.state.market - 6, 0, 100);
            this.state.oem_relation = clamp(this.state.oem_relation - 8, 0, 100);
            this.oemPleaseToreFreezeThisMonth = true;
            this.state.function_freeze = 'risk';
            notes.push("【和稀泥崩盘】你刚宣布破除大锅饭，和事佬经不住混子员工哭闹，私下又用平均主义把奖金平分回去了！");
            return {
              action_id: action.id,
              success: false,
              notes,
              effects: { market: -6, oem_relation: -8, freeze: 'risk' }
            };
          }
        }
      }

      // 上市期权画饼大会
      if (action.id === 'oem_please_act') {
        this.oemPleaseActThisMonth = true;
        const oemTeam = this.getTeamCard('oem');
        if (oemTeam && oemTeam.traits.includes('no_mgmt')) {
          notes.push(`【铁腕HR抗拒画饼】${oemTeam.name} 拒绝配合虚假期权造势，洗脑大会声量仅小幅提升。`);
        }
      }

      // 团队敬业度低迷打折
      if (this.state.morale < 35) {
        multiplier *= 0.75;
        notes.push("【全员带薪摸鱼】团队心气跌破冰点，管理动作推行遭遇消极抵抗，效果再打 75 折。");
      }

      const effects = {};

      switch (action.id) {
        case 'overtime': {
          const addProgress = Math.round(15 * multiplier);
          this.state.dirs[targetDir].progress = clamp(this.state.dirs[targetDir].progress + addProgress, 0, 100);
          this.state.morale = clamp(this.state.morale - 8, 0, 100);
          effects.progress = addProgress;
          effects.morale = -8;
          notes.push(`强推 361 末尾淘汰：${targetTeam.name} 表面业绩 +${addProgress}，团队敬业度 -8。`);
          break;
        }

        case 'data_rain': {
          const addDataP = Math.round(12 * multiplier);
          const addDataQ = Math.round(6 * multiplier);
          const addPerQ = Math.round(4 * multiplier);
          this.state.dirs.data.progress = clamp(this.state.dirs.data.progress + addDataP, 0, 100);
          this.state.dirs.data.true_quality = clamp(this.state.dirs.data.true_quality + addDataQ, 0, 100);
          this.state.dirs.perception.true_quality = clamp(this.state.dirs.perception.true_quality + addPerQ, 0, 100);
          effects.data_progress = addDataP;
          effects.data_quality = addDataQ;
          effects.perception_quality = addPerQ;
          notes.push(`发放里程碑即时红包：青年生力军业绩 +${addDataP}、真实产出 +${addDataQ}；开山元老真实凝聚力 +${addPerQ}。`);
          break;
        }

        case 'road_scene': {
          if (extraParam === 'highway') {
            const addP = Math.round(6 * multiplier);
            const addQ = Math.round(1 * multiplier);
            this.state.dirs.road.progress = clamp(this.state.dirs.road.progress + addP, 0, 100);
            this.state.dirs.road.true_quality = clamp(this.state.dirs.road.true_quality + addQ, 0, 100);
            this.extraFakeMileage += 20;
            effects.road_progress = addP;
            effects.road_quality = addQ;
            effects.fake_mileage = 20;
            notes.push(`周末铁血军事拓展：公众号发满感人团建照，表面加班工时暴增 +2000 小时，但真实团队战力仅 +${addQ}。`);
          } else {
            const addP = Math.round(10 * multiplier);
            const addRoadQ = Math.round(7 * multiplier);
            const addPerQ = Math.round(3 * multiplier);
            this.state.dirs.road.progress = clamp(this.state.dirs.road.progress + addP, 0, 100);
            this.state.dirs.road.true_quality = clamp(this.state.dirs.road.true_quality + addRoadQ, 0, 100);
            this.state.dirs.perception.true_quality = clamp(this.state.dirs.perception.true_quality + addPerQ, 0, 100);
            this.extraFakeMileage += 4;
            effects.road_progress = addP;
            effects.road_quality = addRoadQ;
            effects.perception_quality = addPerQ;
            effects.fake_mileage = 4;
            notes.push(`周五带薪腐败游 + 购物卡：不占双休真金白银关怀，表面工时仅 +400 小时，但基层真实战力 +${addRoadQ}，元老凝聚力 +${addPerQ}！`);
          }
          break;
        }

        case 'audit': {
          if (targetDir === 'data') {
            this.state.audited.data = true;
            notes.push("HRBP 深度摸底【青年生力军】：查明真实带薪摸鱼率与情绪痛点，刺破虚假工单泡沫！");
          } else if (targetDir === 'road') {
            this.state.audited.road = true;
            notes.push("HRBP 深度摸底【基层与元老】：看穿深夜演加班假象，摸清真实有效工时与期权兑现预期！");
          } else if (targetDir === 'fs') {
            this.state.audited.safety = true;
            notes.push("HRBP 深度摸底【中坚骨干】：穿透表面沉默，摸清外部猎头挖角进度与薪资倒挂怨气！");
          }
          effects.audited = targetDir;
          break;
        }

        case 'cut': {
          this.state.market = clamp(this.state.market - 12, 0, 100);
          if (!this.state.feature_cut.includes('complex_intersection')) {
            this.state.feature_cut.push('complex_intersection');
          }
          const addPlanP = Math.round(8 * multiplier);
          this.state.dirs.planning.progress = clamp(this.state.dirs.planning.progress + addPlanP, 0, 100);
          effects.market = -12;
          effects.planning_progress = addPlanP;
          effects.feature_cut = 'complex_intersection';
          notes.push(`破除大锅饭与无效打卡：混日子员工抱怨导致雇主表面口碑 -12，但业务王牌获得重奖授权，业绩 +${addPlanP}。`);
          break;
        }

        case 'safety_case': {
          const addFsP = Math.round(14 * multiplier);
          const addFsQ = Math.round(8 * multiplier);
          this.state.dirs.fs.progress = clamp(this.state.dirs.fs.progress + addFsP, 0, 100);
          this.state.dirs.fs.true_quality = clamp(this.state.dirs.fs.true_quality + addFsQ, 0, 100);
          this.state.morale = clamp(this.state.morale - 3, 0, 100);
          this.safetyActionSucceeded = true;
          effects.fs_progress = addFsP;
          effects.fs_quality = addFsQ;
          effects.morale = -3;
          notes.push(`设立骨干留任调薪池：中坚骨干进度 +${addFsP}，核心留任底盘大幅夯实 +${addFsQ}！`);
          break;
        }

        case 'oem_please_act': {
          const oemTeam = this.getTeamCard('oem');
          let addOemRel = 12;
          if (oemTeam && oemTeam.traits.includes('no_mgmt')) {
            addOemRel = 4;
          }
          this.state.oem_relation = clamp(this.state.oem_relation + addOemRel, 0, 100);
          this.state.market = clamp(this.state.market + 8, 0, 100);

          this.state.freeze_mod = clamp(this.state.freeze_mod - 1, -2, 2);
          this.updateStatusGates();

          const cutIdx = this.state.feature_cut.indexOf('complex_intersection');
          if (cutIdx >= 0) {
            this.state.feature_cut.splice(cutIdx, 1);
            notes.push("画饼大会后遗症：为了全员开心，原先砍掉的大锅饭平均主义又被重新塞回团队！");
          }

          effects.oem_relation = addOemRel;
          effects.market = 8;
          notes.push(`召开全员上市期权画饼大会：董事会关系 +${addOemRel}，表面画饼声量 +8，但透支信誉且激励秩序倒退！`);
          break;
        }

        case 'noop': {
          notes.push("本月推行弹性工作制，不搞打卡与开会折腾，静观团队自主运转。");
          break;
        }
      }

      return {
        action_id: action.id,
        success: true,
        multiplier,
        notes,
        effects
      };
    }

    refreshMonthlyReport() {
      const p = this.state.dirs.perception.progress;
      const r = this.state.dirs.road.progress;
      const n = this.state.dirs.planning.progress;
      const d = this.state.dirs.data.progress;

      const pTeam = this.getTeamCard('perception');
      const rTeam = this.getTeamCard('road');
      const nTeam = this.getTeamCard('planning');
      const dTeam = this.getTeamCard('data');

      const pBias = (pTeam && pTeam.fake_bias.reported_coverage) || 0;
      const nBias = (nTeam && nTeam.fake_bias.reported_shadow) || 0;
      const dBias = (dTeam && dTeam.fake_bias.reported_corners) || 0;
      const rBonus = (rTeam && rTeam.id === 'r_miles') ? 8 : 0;

      const reported_coverage = clamp(Math.round(55 + p * 0.35 + pBias), 0, 99);
      const reported_mileage_wan = Math.round(3 + r * 0.12 + rBonus + this.extraFakeMileage);
      const reported_shadow = clamp(Math.round(60 + n * 0.3 + nBias), 0, 99);
      const reported_nps = clamp(Math.round(50 + this.state.market * 0.3), 0, 95);
      const reported_corners = Math.round(d * 0.4 + dBias + this.extraReportedCorners);

      // 一线真实组织状态（默认被周报掩盖，仅 HRBP 深度摸底后揭开）
      const roadQ = this.state.dirs.road.true_quality;
      const perQ = this.state.dirs.perception.true_quality;
      const planQ = this.state.dirs.planning.true_quality;
      const dataQ = this.state.dirs.data.true_quality;
      const fsQ = this.state.dirs.fs.true_quality;
      const oemQ = this.state.dirs.oem.true_quality;

      const true_urban_rain = Math.round(roadQ * 0.5 + perQ * 0.2);
      const true_preempt = clamp(Math.round(40 - planQ * 0.35), 5, 60);
      const true_label_dispute = clamp(Math.round(48 - dataQ * 0.4), 5, 60);
      const true_sotif_open = clamp(Math.round(22 - fsQ * 0.18), 2, 22);
      const freezePenalty = (this.state.function_freeze === 'risk') ? 3 : 0;
      const true_oem_drift = Math.round((100 - oemQ) * 0.15) + freezePenalty;

      this.currentMonthlyReport = {
        month: this.state.month,
        reported: {
          reported_coverage,
          reported_mileage_wan,
          reported_shadow,
          reported_nps,
          reported_corners
        },
        true_values: {
          true_urban_rain,
          true_preempt,
          true_label_dispute,
          true_sotif_open,
          true_oem_drift
        },
        audited: { ...this.state.audited }
      };

      return this.currentMonthlyReport;
    }

    generateEmergenciesForCurrentMonth() {
      const month = this.state.month;
      let count = 1;

      if (month === PRD_CONFIG.total_months) {
        count = 2;
      } else {
        const doubleRoll = rngU32(this.seed, `emerg_count:${month}`) % 100;
        if (doubleRoll < 20) {
          count = 2;
        }
      }

      const availableEvents = EMERGENCY_EVENTS.filter(e => !this.usedEmergencyIds.includes(e.id));
      const drawn = [];

      for (let i = 0; i < count && availableEvents.length > 0; i++) {
        let totalWeight = 0;
        availableEvents.forEach(e => { totalWeight += e.weight; });
        const roll = rngU32(this.seed, `emerg_draw:${month}:${i}`) % totalWeight;

        let accum = 0;
        let chosenIndex = 0;
        for (let j = 0; j < availableEvents.length; j++) {
          accum += availableEvents[j].weight;
          if (roll < accum) {
            chosenIndex = j;
            break;
          }
        }

        const chosen = availableEvents.splice(chosenIndex, 1)[0];
        this.usedEmergencyIds.push(chosen.id);

        let finalEvent = deepClone(chosen);
        if (chosen.id === 'e_ot_refuse') {
          const noOtTeams = [];
          DIRECTIONS.forEach(d => {
            const card = this.getTeamCard(d.id);
            if (card && card.traits.includes('no_ot')) {
              noOtTeams.push(card);
            }
          });

          if (noOtTeams.length > 0) {
            const rotIdx = this.noOtRotationIndex % noOtTeams.length;
            this.noOtRotationIndex++;
            const t = noOtTeams[rotIdx];
            finalEvent.title = `HRBP 警报：【${t.name}】出现集体「带薪摸鱼」`;
            finalEvent.body = `考勤与协作后台显示【${t.name}】全员准点卡点下班、周会沉默寡言，对老板画的任何大饼只回一个「收到」表情包。`;
            finalEvent.affected_team = deepClone(t);
          }
        }

        drawn.push(finalEvent);
      }

      this.currentMonthEmergencies = drawn;
      this.currentEmergencyIndex = 0;
      return drawn;
    }

    resolveEmergency(optionKey) {
      if (!['A', 'B', 'C'].includes(optionKey)) {
        throw new Error("突发决策必须在 A、B、C 中选择");
      }
      if (this.currentEmergencyIndex >= this.currentMonthEmergencies.length) {
        throw new Error("当前月份没有待处理的突发职场困境");
      }

      const currentEvent = this.currentMonthEmergencies[this.currentEmergencyIndex];
      const effectDesc = this.applyEmergencyEffects(currentEvent.id, optionKey, currentEvent);

      this.choiceHistory.push({
        month: this.state.month,
        type: 'emergency',
        event_id: currentEvent.id,
        event_title: currentEvent.title,
        chosen_option: optionKey,
        effect_desc: effectDesc
      });

      this.currentEmergencyIndex++;
      this.updateStatusGates();
      this.refreshMonthlyReport();

      const hasMoreEmergenciesThisMonth = this.currentEmergencyIndex < this.currentMonthEmergencies.length;
      let monthFinished = false;
      let readyForSOP = false;

      if (!hasMoreEmergenciesThisMonth) {
        const adv = this.advanceMonth();
        monthFinished = adv.monthFinished;
        readyForSOP = adv.readyForSOP;
      }

      return {
        eventResolved: currentEvent,
        chosenOption: optionKey,
        effectDesc,
        hasMoreEmergenciesThisMonth,
        nextEmergency: hasMoreEmergenciesThisMonth ? this.currentMonthEmergencies[this.currentEmergencyIndex] : null,
        monthFinished,
        readyForSOP,
        currentState: this.getStateSnapshot()
      };
    }

    applyEmergencyEffects(eventId, optionKey, eventContext) {
      let desc = "";
      switch (eventId) {
        case 'e_oem_add': {
          if (optionKey === 'A') {
            this.state.oem_relation = clamp(this.state.oem_relation - 6, 0, 100);
            this.state.market = clamp(this.state.market - 4, 0, 100);
            this.state.freeze_mod = clamp(this.state.freeze_mod + 1, -2, 2);
            this.updateStatusGates();
            desc = "顶住预算压力建立公平职级带宽：董事会嫌贵 -6，挤出画饼水分 -4，但薪酬激励秩序升一级。";
          } else if (optionKey === 'B') {
            this.state.dirs.planning.progress = clamp(this.state.dirs.planning.progress - 8, 0, 100);
            this.state.market = clamp(this.state.market + 6, 0, 100);
            desc = "严查密薪制高压线杀鸡儆猴：王牌主力心寒摸鱼进度 -8，表面控制力 +6。";
          } else {
            this.state.oem_relation = clamp(this.state.oem_relation + 4, 0, 100);
            this.sopRiskModifiers.cone += 8;
            this.sopRiskModifiers.ghost += 8;
            desc = "私下画期权翻倍大饼安抚：董事会表面满意 +4，但埋下期权债，年底王牌与青年军跑路风险各激增 +8！";
          }
          break;
        }

        case 'e_iface': {
          if (optionKey === 'A') {
            this.state.dirs.perception.progress = clamp(this.state.dirs.perception.progress + 3, 0, 100);
            this.state.dirs.planning.progress = clamp(this.state.dirs.planning.progress + 3, 0, 100);
            this.state.morale = clamp(this.state.morale + 4, 0, 100);
            desc = "拉通全链路贡献度复盘切分奖金：按实绩说话，元老与王牌产出各 +3，团队敬业度 +4。";
          } else if (optionKey === 'B') {
            this.state.dirs.perception.progress = clamp(this.state.dirs.perception.progress + 4, 0, 100);
            this.state.dirs.planning.progress = clamp(this.state.dirs.planning.progress - 6, 0, 100);
            this.state.morale = clamp(this.state.morale - 4, 0, 100);
            desc = "公开偏袒会写PPT汇报的一方：元老 +4，但业务王牌极度心寒产出 -6，敬业度 -4。";
          } else {
            this.state.morale = clamp(this.state.morale - 8, 0, 100);
            desc = "和稀泥搞阳光普照平分奖金：实干者彻底心冷，团队敬业度重挫 -8。";
          }
          break;
        }

        case 'e_no_rain': {
          if (optionKey === 'A') {
            this.state.morale = clamp(this.state.morale + 3, 0, 100);
            this.state.dirs.road.progress = clamp(this.state.dirs.road.progress - 2, 0, 100);
            desc = "叫停周末拉练改为周五带薪下午茶：尊重休息边界，敬业度 +3，当期表面工时小幅 -2。";
          } else if (optionKey === 'B') {
            this.state.morale = clamp(this.state.morale - 12, 0, 100);
            this.state.dirs.road.progress = clamp(this.state.dirs.road.progress + 4, 0, 100);
            desc = "按旷工扣年终奖强逼参加军事团建：表面执行力 +4，但引发全员怨气，敬业度暴跌 -12！";
          } else {
            const roadTeam = this.getTeamCard('road');
            let mult = 1.0;
            if (roadTeam && (roadTeam.traits.includes('no_ot') || roadTeam.traits.includes('no_mgmt'))) {
              mult = 0.5;
            }
            const addP = Math.round(15 * mult);
            this.state.dirs.road.progress = clamp(this.state.dirs.road.progress + addP, 0, 100);
            this.state.morale = clamp(this.state.morale - 8, 0, 100);
            desc = `借团建下达狼性冲刺军令状：基层产出 +${addP}（含特质抗命乘子），敬业度 -8。`;
          }
          break;
        }

        case 'e_label': {
          if (optionKey === 'A') {
            this.state.budget -= 60;
            this.state.dirs.data.true_quality = clamp(this.state.dirs.data.true_quality + 8, 0, 100);
            desc = "发放专项激励重构考核淘汰混子：刮骨疗毒，消耗预算 60 万，青年生力军真实战力扎实 +8！";
          } else if (optionKey === 'B') {
            this.state.dirs.data.true_quality = clamp(this.state.dirs.data.true_quality - 6, 0, 100);
            this.pendingReportedCornersBonus += 10;
            desc = "删帖捂盖子维持表面虚假工时：青年军真战力 -6，但下月假汇报工单将再虚增 +10。";
          } else {
            this.state.audited.data = true;
            desc = "启动 HRBP 深度离职摸底：免费穿透青年生力军真实状态，查明真实摸鱼率！";
          }
          break;
        }

        case 'e_sign': {
          if (optionKey === 'A') {
            this.state.dirs.fs.progress = clamp(this.state.dirs.fs.progress + 2, 0, 100);
            this.state.morale = clamp(this.state.morale + 2, 0, 100);
            desc = "真诚挽留并兑现骨干留任津贴：骨干进度稳健 +2，敬业度 +2，全员看到老实人不被亏待。";
          } else if (optionKey === 'B') {
            this.state.dirs.fs.true_quality = clamp(this.state.dirs.fs.true_quality - 10, 0, 100);
            this.state.dirs.fs.progress = clamp(this.state.dirs.fs.progress + 8, 0, 100);
            this.state.morale = clamp(this.state.morale - 6, 0, 100);
            desc = "冷漠放走老黄牛换新人顶替：进度表面 +8，但核心骨干底盘暴跌 -10，敬业度 -6。";
          } else {
            this.forcedSafetyStable = true;
            this.sopRiskModifiers.brake += 15;
            desc = "拿竞业协议与期权作废强行卡人：表面留任状态变绿，但结下死仇，年底老黄牛爆发跑路风险激增 +15！";
          }
          break;
        }

        case 'e_competitor': {
          if (optionKey === 'A') {
            desc = "用硬核业务产出顶住老板抓考勤压力：给团队当挡风墙，不搞形式主义打卡，无负面冲击。";
          } else if (optionKey === 'B') {
            this.oemPleaseActThisMonth = true;
            this.state.market = clamp(this.state.market + 8, 0, 100);
            this.state.freeze_mod = clamp(this.state.freeze_mod - 1, -2, 2);
            this.updateStatusGates();
            desc = "当焦虑二传手连夜抓 996 打卡：朝令夕改，等同启动画饼洗脑折腾，团队激励秩序倒退！";
          } else {
            this.state.market = clamp(this.state.market + 5, 0, 100);
            desc = "教员工挂外套开屏幕演加班应付老板：表面口碑假值 +5，徒增全员演戏内耗。";
          }
          break;
        }

        case 'e_ip': {
          if (optionKey === 'A') {
            this.state.budget -= 40;
            this.state.dirs.perception.true_quality = clamp(this.state.dirs.perception.true_quality + 3, 0, 100);
            desc = "批小额现金分红补贴吃定心丸：务实安抚，消耗 40 万，开山元老真实凝聚力 +3。";
          } else if (optionKey === 'B') {
            this.state.budget -= 180;
            this.state.delay_weeks += 1;
            this.state.dirs.perception.true_quality = clamp(this.state.dirs.perception.true_quality + 8, 0, 100);
            desc = "争取期权回购窗口并批全员带薪休整一周：消耗 180 万，休整延期 1 周，元老真实凝聚力大幅 +8！";
          } else {
            this.state.dirs.perception.true_quality = clamp(this.state.dirs.perception.true_quality - 4, 0, 100);
            this.sopRiskModifiers.rain_ped += 10;
            desc = "继续吹牛画饼严惩传谣者：元老真实凝聚力 -4，年底开山元老掀桌跑路风险激增 +10！";
          }
          break;
        }

        case 'e_ot_refuse': {
          if (optionKey === 'A') {
            this.state.morale = clamp(this.state.morale + 4, 0, 100);
            desc = "开展走心 1-on-1 砍掉无效周报早会：真正为打工人减负，团队敬业度恢复 +4。";
          } else if (optionKey === 'B') {
            this.state.morale = clamp(this.state.morale + 2, 0, 100);
            desc = "找小组长吃便饭温和敲打：隔靴搔痒，团队敬业度微幅 +2。";
          } else {
            this.state.morale = clamp(this.state.morale - 6, 0, 100);
            desc = "全员大会拍桌痛批「不讲奉献只谈钱」：爹味说教把团队推向对立面，敬业度重挫 -6。";
          }
          break;
        }
      }
      return desc;
    }

    getSOPItemsCalculated() {
      const perQ = this.state.dirs.perception.true_quality;
      const roadQ = this.state.dirs.road.true_quality;
      const planQ = this.state.dirs.planning.true_quality;
      const dataQ = this.state.dirs.data.true_quality;
      const fsQ = this.state.dirs.fs.true_quality;
      const true_label_dispute = clamp(Math.round(48 - dataQ * 0.4), 5, 60);

      return SOP_ITEMS.map(item => {
        let rawRisk = item.base_risk;
        let isAudited = false;

        switch (item.id) {
          case 'rain_ped':
            rawRisk += (70 - perQ) * 0.3 + (70 - roadQ) * 0.2;
            if (this.state.audited.road) {
              rawRisk -= 8;
              isAudited = true;
            }
            rawRisk += this.sopRiskModifiers.rain_ped;
            break;

          case 'cone':
            rawRisk += (70 - perQ) * 0.25 + (70 - planQ) * 0.15;
            rawRisk += this.sopRiskModifiers.cone;
            if (this.state.audited.road) isAudited = true;
            break;

          case 'ghost':
            rawRisk += (70 - perQ) * 0.2 + (70 - dataQ) * 0.2;
            rawRisk += this.sopRiskModifiers.ghost;
            if (this.state.audited.road) isAudited = true;
            break;

          case 'gnss':
            rawRisk += (70 - planQ) * 0.25;
            rawRisk += this.sopRiskModifiers.gnss;
            break;

          case 'brake':
            rawRisk += (70 - fsQ) * 0.4;
            if (this.state.audited.safety) {
              rawRisk -= 10;
              isAudited = true;
            }
            rawRisk += this.sopRiskModifiers.brake;
            break;

          case 'label':
            rawRisk += true_label_dispute * 0.5;
            if (this.state.audited.data) {
              rawRisk -= 12;
              isAudited = true;
            }
            rawRisk += this.sopRiskModifiers.label;
            break;
        }

        const trueRisk = clamp(Math.round(rawRisk), 5, 95);
        const displayedRisk = isAudited ? trueRisk : Math.min(trueRisk, 18);
        const isRed = isAudited && trueRisk >= 60;
        const remainingForThis = this.state.budget - this.getOtherSelectedRepairCost(item.id);
        const canRepair = remainingForThis >= item.repair_cost;

        return {
          ...item,
          risk_from: item.risk_from.slice(),
          true_risk: trueRisk,
          displayed_risk: displayedRisk,
          is_audited: isAudited,
          is_red: isRed,
          canRepair,
          decision: this.sopDecisions[item.id]
        };
      });
    }

    getOtherSelectedRepairCost(excludeItemId) {
      let cost = 0;
      SOP_ITEMS.forEach(it => {
        if (it.id !== excludeItemId && this.sopDecisions[it.id] === 'repair') {
          cost += it.repair_cost;
        }
      });
      return cost;
    }

    setSOPDecision(itemId, decision) {
      if (!['repair', 'waive'].includes(decision)) {
        throw new Error("年终奖决策必须为 'repair'（足额发钱）或 'waive'（发期权大饼）");
      }
      const item = SOP_ITEMS.find(it => it.id === itemId);
      if (!item) throw new Error(`未知的年终奖分配席位: ${itemId}`);

      if (decision === 'repair') {
        const remainingForThis = this.state.budget - this.getOtherSelectedRepairCost(itemId);
        if (remainingForThis < item.repair_cost) {
          return false;
        }
      }

      this.sopDecisions[itemId] = decision;
      return true;
    }

    waiveAllSOP() {
      SOP_ITEMS.forEach(it => {
        this.sopDecisions[it.id] = 'waive';
      });
      return this.getSOPStatus();
    }

    getSOPStatus() {
      const items = this.getSOPItemsCalculated();
      let allDecided = true;
      let additionalCost = 0;
      let additionalDelayWeeks = 0;

      items.forEach(it => {
        if (!it.decision) {
          allDecided = false;
        } else if (it.decision === 'repair') {
          additionalCost += it.repair_cost;
          additionalDelayWeeks += it.repair_weeks;
        }
      });

      const projectedBudget = this.state.budget - additionalCost;
      const projectedDelayWeeks = this.state.delay_weeks + additionalDelayWeeks;

      return {
        items,
        allDecided,
        additionalCost,
        additionalDelayWeeks,
        projectedBudget,
        projectedDelayWeeks,
        canAffordRepairs: projectedBudget >= 0 || true
      };
    }

    confirmSOPRelease() {
      if (this.sopConfirmed) {
        throw new Error("年终奖分配方案已确认公布，请勿重复提交");
      }

      const sopStatus = this.getSOPStatus();
      if (!sopStatus.allDecided) {
        throw new Error("必须对全部 6 个团队席位做出【足额发钱 / 画饼抵扣】决策后方可公布年终奖");
      }

      let totalRepairCost = 0;
      let totalRepairWeeks = 0;
      sopStatus.items.forEach(it => {
        if (it.decision === 'repair') {
          totalRepairCost += it.repair_cost;
          totalRepairWeeks += it.repair_weeks;
        }
      });

      if (totalRepairCost > 0 && this.state.budget < totalRepairCost) {
        throw new Error(`薪酬预算不足以支付所选年终奖！当前预算 ${this.state.budget} 万，年终奖总额需要 ${totalRepairCost} 万`);
      }

      this.state.budget -= totalRepairCost;
      this.state.delay_weeks += totalRepairWeeks;
      this.sopConfirmed = true;

      // 计算最终结局与集体跑路引爆项
      const outcome = this.computeFinalOutcome(sopStatus.items);
      this.finalOutcome = deepClone(outcome);
      return outcome;
    }

    computeFinalOutcome(calculatedItems = this.getSOPItemsCalculated()) {
      const firedItems = [];
      let allWaived = true;

      calculatedItems.forEach(it => {
        if (it.decision === 'waive') {
          const roll = rngU32(this.seed, `fire:${it.id}`) % 100;
          const fired = roll < it.true_risk;
          if (fired) {
            firedItems.push({
              ...it,
              roll
            });
          }
        } else {
          allWaived = false;
        }
      });

      // 1. 核心留任轴 safety
      let safety = 100;
      firedItems.forEach(f => {
        if (['rain_ped', 'ghost', 'brake'].includes(f.id)) {
          safety -= 35;
        } else if (['cone', 'gnss'].includes(f.id)) {
          safety -= 18;
        } else if (f.id === 'label') {
          safety -= 8;
        }
      });

      const anyAudited = this.state.audited.road || this.state.audited.data || this.state.audited.safety;
      if (!anyAudited && allWaived) {
        safety -= 10;
      }
      safety = clamp(safety, 0, 100);

      const severeFired = firedItems.some(f => ['rain_ped', 'ghost', 'brake'].includes(f.id));
      if (severeFired && safety > 25) {
        safety = 25;
      }

      // 2. 真实产出轴 function
      const pProg = this.state.dirs.perception.progress;
      const nProg = this.state.dirs.planning.progress;
      const rTrueQ = this.state.dirs.road.true_quality;
      const { func_w_progress, func_w_road, score_weights } = PRD_CONFIG.balance;
      let func = Math.round(func_w_progress * ((pProg + nProg) / 2) + func_w_road * rTrueQ);

      if (this.state.feature_cut.includes('complex_intersection')) {
        func -= 18;
      }
      const true_urban_rain = Math.round(rTrueQ * 0.5 + this.state.dirs.perception.true_quality * 0.2);
      if (this.currentMonthlyReport && this.currentMonthlyReport.reported.reported_coverage > 75 && true_urban_rain < 20) {
        func -= 12;
      }
      func = clamp(func, 0, 100);

      // 3. 组织协同与承诺兑现轴 delivery
      let oemRel = this.state.oem_relation;
      if (this.state.delay_weeks > 2) {
        const extraWeeks = this.state.delay_weeks - 2;
        oemRel = clamp(oemRel - extraWeeks * 8, 0, 100);
      }

      let delivery = Math.round(40 + oemRel * 0.5 + this.state.market * 0.2);
      delivery -= this.state.delay_weeks * (PRD_CONFIG.balance.delay_penalty_per_week ?? 4);
      if (safety < 30) {
        delivery -= 20;
      }
      delivery = clamp(delivery, 0, 100);

      // 4. 薪酬人效轴 cost
      const overrun = Math.max(0, -this.state.budget) / PRD_CONFIG.initial_budget;
      let cost = Math.round(90 - overrun * 400);
      if (overrun > PRD_CONFIG.salary_overrun_threshold) {
        cost -= 10;
      }
      cost = clamp(cost, 0, 100);

      // 5. 团队敬业度轴 morale
      const morale = clamp(Math.round(this.state.morale), 0, 100);

      // 高危席位发大饼惩罚
      const blindWaiveExempt = PRD_CONFIG.balance.blind_waive_exempt ?? ['gnss'];
      const blindWaiveRiskMin = PRD_CONFIG.balance.blind_waive_risk_min ?? 25;
      const blindWaivePenalty = PRD_CONFIG.balance.blind_waive_penalty ?? 10;
      const knowingWaiveMinRepairWeeks = PRD_CONFIG.balance.knowing_waive_min_repair_weeks ?? 3;
      const hiItems = calculatedItems.filter(
        it => !blindWaiveExempt.includes(it.id) && it.true_risk >= blindWaiveRiskMin
      );
      const hiRepairWeeks = hiItems
        .filter(it => it.decision === 'repair')
        .reduce((sum, it) => sum + (it.repair_weeks ?? 0), 0);
      const hiWaived = hiItems.filter(it => it.decision === 'waive');
      let hiWaivedCount = 0;
      if (hiRepairWeeks < knowingWaiveMinRepairWeeks) {
        const penalty = hiWaived.length * blindWaivePenalty;
        safety = clamp(safety - penalty, 0, 100);
        if (penalty > 0) {
          hiWaivedCount = hiWaived.length;
        }
      }

      // 崩盘判定：核心留任分 <= 25 即触发节后集体提桶跑路崩盘
      const isBrick = safety <= 25;

      // 实质激励动作统计
      const minImproveActions = PRD_CONFIG.balance.min_improve_actions ?? 2;
      const improveActionIds = PRD_CONFIG.balance.improve_action_ids ?? ['data_rain', 'road_scene', 'safety_case'];
      const actionHistory = this.choiceHistory.filter(h => h.type === 'action');
      const improveHist = actionHistory.filter(h => improveActionIds.includes(h.action_id));
      const improveCount = (PRD_CONFIG.balance.dedupe_substantive_actions ?? true)
        ? new Set(improveHist.map(h => h.action_id)).size
        : improveHist.length;

      // HRBP 摸底知情度加分
      const auditedDirs = ['road', 'data', 'safety'].filter(k => this.state.audited[k]).length;
      const auditBonusPerDir = PRD_CONFIG.balance.audit_bonus_per_dir ?? 1.5;
      const insightBonus = (hiItems.length === 0 || hiRepairWeeks >= knowingWaiveMinRepairWeeks) && improveCount >= minImproveActions
        ? auditedDirs * auditBonusPerDir
        : 0;

      const overall = Math.min(
        100,
        Math.round(
          safety * score_weights.safety +
          func * score_weights.function +
          delivery * score_weights.delivery +
          cost * score_weights.cost +
          morale * score_weights.morale +
          insightBonus
        )
      );

      let letter = 'D';
      if (!isBrick) {
        if (overall >= 85) letter = 'A';
        else if (overall >= 70) letter = 'B';
        else if (overall >= 55) letter = 'C';
        else letter = 'D';
      }

      // 计算老板管理风格画像与员工匿名群吐槽
      const rawProfile = this.evaluateManagementProfile();
      const anonymousFeedback = this.getAnonymousFeedback();

      // 兜底封顶：盲人老板画像、多数月份不作为或没有实质激励时，评级最高封顶 B
      const noopCount = actionHistory.filter(h => h.action_id === 'noop').length;
      const isBlindProfile = rawProfile.id === 'blind';
      const isMajorityNoop = actionHistory.length > 0 && noopCount > actionHistory.length / 2;
      const noImproveAction = improveCount < minImproveActions;
      const noHiRepair = hiItems.length > 0 && hiItems.filter(it => it.decision === 'repair').length === 0;

      let gradeCapped = false;
      let capReason = '';
      const capReasons = [];
      if ((isMajorityNoop || isBlindProfile || noImproveAction || noHiRepair) && letter === 'A') {
        letter = 'B';
        gradeCapped = true;
        if (isMajorityNoop) capReasons.push('整局多数月份躺平不作为');
        if (isBlindProfile) capReasons.push('从未做过离职摸底');
        if (noImproveAction) capReasons.push('实质激励动作不足');
        if (noHiRepair) capReasons.push('高危席位年终奖一分未发');
        capReason = `${capReasons.join(' / ')}，评级封顶 B`;
      }

      let subtitle = "";
      if (isBrick) {
        if (!severeFired) {
          subtitle = PENALTY_BRICK_SUBTITLE;
        } else {
          const brickIdx = rngU32(this.seed, "brick_subtitle") % BRICK_SUBTITLES.length;
          subtitle = BRICK_SUBTITLES[brickIdx];
        }
      } else {
        subtitle = `${letter} · 综合评分 ${overall} / 100`;
        if (gradeCapped) {
          subtitle = `${subtitle} · ${capReason}`;
        }
      }

      const { condition, ...managementProfile } = rawProfile;

      return deepClone({
        letter,
        overall,
        isBrick,
        insightBonus,
        auditedDirs,
        gradeCapped,
        capReason,
        capReasons,
        subtitle,
        axes: {
          safety: { score: safety, label: "核心留任率", reason: this.getSafetyReason(safety, firedItems, hiWaivedCount) },
          function: { score: func, label: "真实业务产出", reason: this.getFunctionReason(func) },
          delivery: { score: delivery, label: "画饼信誉兑现", reason: this.getDeliveryReason(delivery) },
          cost: { score: cost, label: "薪酬包人效比", reason: this.getCostReason(cost, overrun) },
          morale: { score: morale, label: "团队敬业度", reason: this.getMoraleReason(morale) }
        },
        firedItems,
        calculatedItems,
        managementProfile,
        anonymousFeedback,
        choiceHistory: this.choiceHistory
      });
    }

    getSafetyReason(score, firedItems, hiWaivedCount = 0) {
      if (firedItems.length === 0) {
        if (hiWaivedCount > 0) {
          return `对 ${hiWaivedCount} 个高危席位强行用期权大饼抵扣年终奖，留任分被扣`;
        }
        return "年终奖分配得当，核心骨干全员留任，春招跳槽季稳如泰山";
      }
      const severe = firedItems.find(f => ['rain_ped', 'ghost', 'brake'].includes(f.id));
      if (severe) return `提桶跑路引爆：${severe.title}被画饼打发，节后集体辞职反水`;
      return `部分席位年终奖缩水，触发 ${firedItems.length} 波节后离职动荡`;
    }

    getFunctionReason(score) {
      if (this.state.feature_cut.includes('complex_intersection')) {
        return "强力破除大锅饭并砍掉虚荣项目，核心王牌产出聚焦但牺牲了部分广度";
      }
      if (score >= 70) return "激励精准到位，团队拿出真本事啃下了年度硬仗";
      return "表面加班工时与周报极好看，但全员带薪摸鱼，真实业务产出严重掺水";
    }

    getDeliveryReason(score) {
      if (this.state.delay_weeks > 2) {
        return `奖金核算与跨部门拉扯耗时 ${this.state.delay_weeks} 周，错失最佳激励窗口，董事会不满`;
      }
      if (score >= 75) return "说到做到不画假饼，董事会预期与员工承诺双向兑现";
      return "前期期权大饼画得太满，后期兑现乏力导致雇主信誉受损";
    }

    getCostReason(score, overrun) {
      if (overrun > PRD_CONFIG.salary_overrun_threshold) {
        return `薪酬包严重超支 ${(overrun * 100).toFixed(1)}%，被财务与董事会严厉问责`;
      }
      if (score >= 75) return "薪酬包好钢用在刀刃上，没有养高薪混子";
      return "高薪老臣与汇报型团队消耗了过多固薪预算，ROI 偏低";
    }

    getMoraleReason(score) {
      if (score >= 70) return "团队心气高涨，员工获得充分尊重与情绪价值，自驱力拉满";
      if (score >= 45) return "职场情绪整体可控，冲刺期偶有疲态但未出现集体逆反";
      if (score >= 25) return "加班内耗与不公感累积，茶水间吐槽不断，多人开启静音躺平";
      return "组织心气彻底崩盘，全员生理性厌恶上班，随时准备提桶跑路";
    }

    evaluateManagementProfile() {
      for (const prof of MANAGEMENT_PROFILES) {
        if (prof.condition(this.choiceHistory, this.state)) {
          return prof;
        }
      }
      return MANAGEMENT_PROFILES[MANAGEMENT_PROFILES.length - 1];
    }

    getAnonymousFeedback() {
      const feedbackList = [];
      const usedMicromanage = this.choiceHistory.filter(h => h.action_id === 'overtime').length >= 1;

      DIRECTIONS.forEach(d => {
        const team = this.getTeamCard(d.id);
        if (!team) return;
        let quote = "";
        if (usedMicromanage) {
          quote = team.anonymous_quotes.micromanaged;
        } else {
          quote = team.anonymous_quotes.empowered;
        }
        feedbackList.push({
          dir_name: d.name,
          team_name: team.name,
          quote: quote,
          traits: team.traits.map(t => TRAIT_META[t].name)
        });
      });

      return feedbackList;
    }

    getStateSnapshot() {
      return JSON.parse(JSON.stringify(this.state));
    }
  }

  // 纯 HR 版自动化验收测试（A1-A10）
  function runPRDTests() {
    const results = [];
    function record(id, passed, detail) {
      results.push({ id, passed, detail });
    }

    try {
      // A1: 种子确定性复现测试
      const e1 = new ManagerSandboxGameEngine();
      e1.initProject('跃迁-50');
      DIRECTIONS.forEach(d => e1.selectTeamCard(d.id, TEAM_CARDS.find(c => c.dir === d.id).id));
      e1.confirmTeam();
      const r1 = e1.executeMonthlyAction('overtime', 'perception');
      e1.resolveEmergency('A');

      const e2 = new ManagerSandboxGameEngine();
      e2.initProject('跃迁-50');
      DIRECTIONS.forEach(d => e2.selectTeamCard(d.id, TEAM_CARDS.find(c => c.dir === d.id).id));
      e2.confirmTeam();
      const r2 = e2.executeMonthlyAction('overtime', 'perception');
      e2.resolveEmergency('A');

      const a1Pass = (
        e1.seed === e2.seed &&
        r1.emergencies[0].id === r2.emergencies[0].id &&
        e1.state.budget === e2.state.budget &&
        e1.state.morale === e2.state.morale
      );
      record('A1', a1Pass, `同名种子可精确复现 (${e1.seed})`);

      // A2: 不同项目名产生不同种子
      const e3 = new ManagerSandboxGameEngine();
      e3.initProject('跃迁-51');
      record('A2', e1.seed !== e3.seed, `不同项目名种子不同 (${e1.seed} vs ${e3.seed})`);

      // A3: 全选高薪诱饵团队
      const eA3 = new ManagerSandboxGameEngine();
      eA3.initProject('A3测试');
      eA3.selectTeamCard('perception', 'p_paper');
      eA3.selectTeamCard('planning', 'n_lab');
      eA3.selectTeamCard('fs', 'f_doc');
      eA3.selectTeamCard('data', 'd_out');
      eA3.selectTeamCard('oem', 'o_rel');
      eA3.selectTeamCard('road', 'r_miles');
      eA3.confirmTeam();
      const a3Pass = eA3.state.payroll_monthly === 1090 && (8000 - 1090 * 6) === 1460;
      record('A3', a3Pass, `月度固薪合计 ${eA3.state.payroll_monthly} 万，6期无动作余款 1460 万`);

      // A4: 对功勋老臣（带 no_ot）执行 361 末尾淘汰
      const eA4 = new ManagerSandboxGameEngine();
      eA4.initProject('A4测试');
      eA4.selectTeamCard('perception', 'p_paper');
      eA4.selectTeamCard('planning', 'n_lab');
      eA4.selectTeamCard('fs', 'f_doc');
      eA4.selectTeamCard('data', 'd_out');
      eA4.selectTeamCard('oem', 'o_rel');
      eA4.selectTeamCard('road', 'r_miles');
      eA4.confirmTeam();
      const pBefore = eA4.state.dirs.perception.progress;
      const resA4 = eA4.executeMonthlyAction('overtime', 'perception');
      const eA4Nat = new ManagerSandboxGameEngine();
      eA4Nat.initProject('A4测试');
      eA4Nat.selectTeamCard('perception', 'p_paper');
      eA4Nat.selectTeamCard('planning', 'n_lab');
      eA4Nat.selectTeamCard('fs', 'f_doc');
      eA4Nat.selectTeamCard('data', 'd_out');
      eA4Nat.selectTeamCard('oem', 'o_rel');
      eA4Nat.selectTeamCard('road', 'r_miles');
      eA4Nat.confirmTeam();
      eA4Nat.state.morale = eA4.state.morale;
      eA4Nat.applyNaturalProgress();
      const natGain = eA4Nat.state.dirs.perception.progress - pBefore;
      const pGain = (eA4.state.dirs.perception.progress - pBefore) - natGain;
      const a4Pass = pGain === 8 && resA4.actionResult.notes.some(n => n.includes('抗命') || n.includes('减半'));
      record('A4', a4Pass, `功勋老臣抗命减半，扣除自然进度 +${natGain} 后动作进度实际增加 +${pGain}（期望 +8）`);

      // A5: 不做离职摸底且年终奖全员发大饼，触发节后集体跑路崩盘
      const eA5 = new ManagerSandboxGameEngine();
      eA5.initProject('A5测试');
      DIRECTIONS.forEach(d => eA5.selectTeamCard(d.id, TEAM_CARDS.find(c => c.dir === d.id).id));
      eA5.confirmTeam();
      for (let m = 1; m <= 6; m++) {
        eA5.executeMonthlyAction('noop');
        while (eA5.currentEmergencyIndex < eA5.currentMonthEmergencies.length) {
          eA5.resolveEmergency('B');
        }
      }
      eA5.waiveAllSOP();
      const outA5 = eA5.confirmSOPRelease();
      record('A5', outA5.axes.safety.score <= 25, `不摸底全员画饼留任得分 ${outA5.axes.safety.score} (<= 25)`);

      // A6: M3 摸底基层与元老后，年终奖大会元老项显示真实跑路风险且 >= 60
      const eA6 = new ManagerSandboxGameEngine();
      eA6.initProject('A6测试');
      eA6.selectTeamCard('perception', 'p_paper');
      eA6.selectTeamCard('planning', 'n_lab');
      eA6.selectTeamCard('fs', 'f_doc');
      eA6.selectTeamCard('data', 'd_out');
      eA6.selectTeamCard('oem', 'o_rel');
      eA6.selectTeamCard('road', 'r_miles');
      eA6.confirmTeam();
      for (let m = 1; m <= 2; m++) {
        eA6.executeMonthlyAction('noop');
        while (eA6.currentEmergencyIndex < eA6.currentMonthEmergencies.length) {
          eA6.resolveEmergency('A');
        }
      }
      eA6.executeMonthlyAction('audit', 'road');
      while (eA6.currentEmergencyIndex < eA6.currentMonthEmergencies.length) {
        eA6.resolveEmergency('A');
      }
      for (let m = 4; m <= 6; m++) {
        eA6.executeMonthlyAction('noop');
        while (eA6.currentEmergencyIndex < eA6.currentMonthEmergencies.length) {
          eA6.resolveEmergency('A');
        }
      }
      const sopA6 = eA6.getSOPItemsCalculated();
      const rainItem = sopA6.find(it => it.id === 'rain_ped');
      record('A6', rainItem.is_audited && rainItem.true_risk >= 60, `HRBP摸底后元老真跑路风险为 ${rainItem.true_risk}% (>= 60) 且标红`);

      // A7: 破除大锅饭后召开画饼大会，大锅饭死灰复燃且激励秩序降级
      const eA7 = new ManagerSandboxGameEngine();
      eA7.initProject('A7测试');
      eA7.selectTeamCard('perception', 'p_zhou');
      eA7.selectTeamCard('planning', 'n_kai');
      eA7.selectTeamCard('fs', 'f_zhao');
      eA7.selectTeamCard('data', 'd_core');
      eA7.selectTeamCard('oem', 'o_disc');
      eA7.selectTeamCard('road', 'r_rain');
      eA7.confirmTeam();
      eA7.executeMonthlyAction('cut');
      const hadCut = eA7.state.feature_cut.includes('complex_intersection');
      eA7.executeMonthlyAction('oem_please_act', 'oem');
      const cutRestored = !eA7.state.feature_cut.includes('complex_intersection');
      record('A7', hadCut && cutRestored, `破除大锅饭后搞全员画饼大会，大锅饭乱象死灰复燃`);

      // A8: 预算不足时足额发年终奖禁用校验
      const eA8 = new ManagerSandboxGameEngine();
      eA8.initProject('A8测试');
      DIRECTIONS.forEach(d => eA8.selectTeamCard(d.id, TEAM_CARDS.find(c => c.dir === d.id).id));
      eA8.confirmTeam();
      eA8.state.budget = 500;
      const sopListA8 = eA8.getSOPItemsCalculated();
      const brakeStatus = sopListA8.find(x => x.id === 'brake');
      const attemptRepair = eA8.setSOPDecision('brake', 'repair');
      const a8Pass = brakeStatus.canRepair === false && attemptRepair === false;
      record('A8', a8Pass, `预算 500 万时支付 800 万骨干年终奖被正确阻断 (canRepair=${brakeStatus.canRepair}, attempt=${attemptRepair})`);

      // A9: 核算拉扯周数从 0 到 3 兑现轴明显衰减
      const eA9a = new ManagerSandboxGameEngine();
      eA9a.initProject('A9测试');
      DIRECTIONS.forEach(d => eA9a.selectTeamCard(d.id, TEAM_CARDS.find(c => c.dir === d.id).id));
      eA9a.confirmTeam();
      for (let m = 1; m <= 6; m++) {
        eA9a.executeMonthlyAction('noop');
        while (eA9a.currentEmergencyIndex < eA9a.currentMonthEmergencies.length) {
          eA9a.resolveEmergency('A');
        }
      }
      eA9a.setSOPDecision('cone', 'repair'); // +1 week
      eA9a.setSOPDecision('ghost', 'repair'); // +2 weeks -> total 3 weeks
      SOP_ITEMS.forEach(it => { if (!eA9a.sopDecisions[it.id]) eA9a.setSOPDecision(it.id, 'waive'); });
      const outA9 = eA9a.confirmSOPRelease();
      record('A9', outA9.axes.delivery.score < 50, `拉扯耗时 3 周兑现轴显著恶化 (score = ${outA9.axes.delivery.score})`);

      // A10: 组队页信息屏蔽
      const eA10 = new ManagerSandboxGameEngine();
      const publicCards = eA10.getPublicTeamCards();
      const allTraitIds = Object.keys(TRAIT_META);
      const allTraitNames = Object.values(TRAIT_META).map(t => t.name);
      const a10Pass = publicCards.length === TEAM_CARDS.length && publicCards.every(pub => {
        const raw = TEAM_CARDS.find(c => c.id === pub.id);
        if (!raw) return false;
        if ('true_power' in pub || 'traits' in pub || 'fake_bias' in pub) return false;
        const renderedText = `${pub.name} ${pub.salary_month} 万/月 规模: ${pub.headcount} 人 司龄/经验: ${pub.years} 年沉淀 ${pub.blurb}`;
        const serialized = JSON.stringify(pub);
        const hasTruePowerVal = renderedText.includes(String(raw.true_power));
        const hasTraitLeak = raw.traits.some(t =>
          renderedText.includes(t) ||
          serialized.includes(t) ||
          (TRAIT_META[t] && renderedText.includes(TRAIT_META[t].name))
        ) || allTraitIds.some(t => renderedText.includes(t)) || allTraitNames.some(n => renderedText.includes(n));
        return !hasTruePowerVal && !hasTraitLeak;
      });
      record('A10', a10Pass, `组队公开卡片视图共 ${publicCards.length} 张，均不含 true_power 与 traits 字段及对应值`);

    } catch (err) {
      record('FATAL', false, `测试运行异常: ${err.message}`);
    }

    return results;
  }

  const exportObj = {
    computeSeedFromName,
    Mulberry32,
    rngU32,
    ManagerSandboxGameEngine,
    runPRDTests
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportObj;
  } else {
    global.ManagerGameEngine = exportObj;
  }
})(typeof self !== 'undefined' ? self : this);
