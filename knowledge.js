/**
 * 《带队吧，老板！》HR 知识锦囊（与 Obsidian「HR知识图谱」双向联动）
 * - 每个激励手段 / 职场风波 / 老板画像都挂载对应的 HR 专业知识卡
 * - 卡片 path 对应 Obsidian 仓库内 HR知识图谱 的笔记路径，可一键跳转深读
 * - 纯数据模块，不参与任何数值结算
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HRKnowledge = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const VAULT = 'Documents';
  const BASE = 'HR知识图谱/20_Cards/';

  // 知识卡片库：title=笔记名，dir=子目录，type=卡片类型，tip=一句话管理启示
  const CARDS = {
    forced_dist: { dir: 'Concepts', title: '绩效强制分布(活力曲线)与校准规则', type: '概念', tip: '强制分布只适合人才密度高、标准清晰的团队；小团队硬套 361 会制造互害与甩锅，必须配套校准会。' },
    pip: { dir: 'Toolkits', title: '工具-绩效改进计划(PIP)设计规范与面谈指南', type: '工具', tip: 'PIP 的本意是“改进”而非“劝退流程”，目标须 SMART、有资源支持，否则既失人心又埋法律风险。' },
    law40: { dir: 'Laws', title: '法条-不胜任工作调岗与解除合规链条(劳动合同法第40条)', type: '法条', tip: '“末位”≠“不胜任”：末位淘汰直接解除属违法，需经培训或调岗后仍不胜任才可解除。' },
    bonus_pool: { dir: 'Concepts', title: '业务与研发团队奖金包设计模型', type: '概念', tip: '奖金要“即时、可感知、与贡献挂钩”；里程碑奖比年底一次性大锅饭的激励效率高得多。' },
    equity: { dir: 'Concepts', title: '核心人才股权激励(期权与RSU)核心机制', type: '概念', tip: '期权是长期绑定工具而非现金替代品；没有行权路径与回购机制的期权，在员工眼里就是一张饼。' },
    retention: { dir: 'Toolkits', title: '工具-核心骨干离职预警信号与留人组合拳', type: '工具', tip: '离职从来不是突然的：请假变多、周会沉默、更新简历都是信号，留人要在预警期出手。' },
    salary_matrix: { dir: 'Toolkits', title: '工具-年度调薪矩阵(绩效×分位值)测算模型', type: '工具', tip: '调薪按“绩效 × 当前薪酬分位”双维矩阵分配，优先修复高绩效低分位的倒挂人群。' },
    broadband: { dir: 'Concepts', title: '宽带薪酬体系设计与CR值分析', type: '概念', tip: '新老倒挂的根源是没有薪酬带宽；用 CR 值（实际薪酬/中位值）定位谁被低估了。' },
    genz: { dir: 'SOPs', title: 'SOP-新生代(00后)与高潜极客员工激励及管理指南', type: 'SOP', tip: '00后要的是意义感、即时反馈与边界尊重；占用周末的“感动式团建”是负激励。' },
    morale: { dir: 'SOPs', title: 'SOP-团队士气低落与跨部门墙冲突干预', type: 'SOP', tip: '士气问题先诊断原因（钱/事/人/心），再对症下药，打鸡血和喊口号只会加速躺平。' },
    six_box: { dir: 'Concepts', title: '组织诊断六个盒子(Six-Box Model)', type: '概念', tip: '激励（Rewards）只是六个盒子之一：做多做少一个样，任何文化宣讲都救不回来。' },
    okr_kpi: { dir: 'Concepts', title: 'OKR与KPI的适用边界与混合落地模式', type: '概念', tip: 'OKR 管方向与创新，KPI 管结果与底线；把 OKR 直接挂钩奖金会立刻催生造假。' },
    grow: { dir: 'Toolkits', title: '工具-绩效辅导GROW模型与面谈话术', type: '工具', tip: '1-on-1 用 GROW（目标-现状-选项-意愿）提问，让员工自己说出问题和承诺。' },
    calibration: { dir: 'Toolkits', title: '工具-人才盘点校准会(Calibration)主持话术与控场清单', type: '工具', tip: '奖金和评级必须经过跨部门校准，用事实举证拉齐尺子，杜绝“会哭的孩子有奶吃”。' },
    nine_box: { dir: 'Concepts', title: '人才盘点九宫格(9-Box Grid)', type: '概念', tip: '绩效×潜力两维看人：老黄牛是“中坚”而非“明星”，激励方式要差异化。' },
    talent_review: { dir: 'SOPs', title: 'SOP-年度组织与人才盘点全流程', type: 'SOP', tip: '没有盘点就没有“知情权”：不知道谁是关键人、谁在看机会，年终分钱必然失准。' },
    people_analytics: { dir: 'Toolkits', title: '工具-人力成本与人效核心指标字典(People Analytics)', type: '工具', tip: '看人效要看人均产出与人事费用率，而不是加班时长和工位亮灯数。' },
    exit_sop: { dir: 'SOPs', title: 'SOP-员工离职交接、竞业限制启动与证明开具标准', type: 'SOP', tip: '竞业限制必须支付经济补偿，扣离职证明属违法；用法律武器“卡人”只会结仇。' },
    negotiation: { dir: 'Toolkits', title: '工具-高端候选人谈薪博弈与Offer促成话术', type: '工具', tip: '外部 Offer 是市场价的信号：反向 Offer 留人前先判断是“钱的问题”还是“心的问题”。' },
    netflix: { dir: '../30_Cases', title: '标杆拆解-奈飞(Netflix)极客文化：高人才密度、留任测试(Keeper Test)与市场顶薪', type: '案例', tip: '奈飞用“市场顶薪 + 留任测试”替代画饼与家文化，钱给够、坦诚说。' },
    huawei: { dir: '../30_Cases', title: '标杆拆解-华为力出一孔机制：BLM战略解码与“获取分享制”奖金分配', type: '案例', tip: '获取分享制：奖金来自团队创造的增量，向奋斗者倾斜，不搞平均主义。' },
    okr_fail: { dir: '../30_Cases', title: '败局复盘-某成长期企业强推OKR直接挂钩绩效导致全员躺平与造假', type: '案例', tip: '考核什么就得到什么：指标一旦变成刀，团队就会把精力全花在“看起来达标”上。' },
    onboarding: { dir: 'SOPs', title: 'SOP-新员工入职全流程体验设计(Pre-boarding到转正)', type: 'SOP', tip: '新人高薪入职、老人原地踏步，是最快制造“相对剥夺感”的方式。' }
  };

  // 激励手段 → 知识卡
  const ACTION_MAP = {
    overtime: ['forced_dist', 'law40', 'pip'],
    data_rain: ['bonus_pool', 'genz'],
    road_scene: ['genz', 'morale'],
    audit: ['retention', 'grow', 'talent_review'],
    cut: ['huawei', 'calibration'],
    safety_case: ['salary_matrix', 'broadband'],
    oem_please_act: ['equity', 'okr_fail'],
    noop: ['okr_kpi', 'people_analytics']
  };

  // 突发职场风波 → 知识卡
  const EVENT_MAP = {
    e_oem_add: ['broadband', 'salary_matrix', 'onboarding'],
    e_iface: ['calibration', 'huawei'],
    e_no_rain: ['genz', 'morale'],
    e_label: ['okr_fail', 'people_analytics'],
    e_sign: ['retention', 'negotiation', 'exit_sop'],
    e_competitor: ['people_analytics', 'six_box'],
    e_ip: ['equity', 'netflix'],
    e_ot_refuse: ['grow', 'morale']
  };

  // 老板画像 → 复盘必读
  const PROFILE_MAP = {
    goodhart: ['forced_dist', 'law40', 'okr_fail'],
    relay: ['equity', 'netflix', 'bonus_pool'],
    blind: ['talent_review', 'retention', 'grow'],
    shield: ['huawei', 'nine_box', 'salary_matrix'],
    balanced: ['six_box', 'bonus_pool', 'retention']
  };

  function getCard(id) {
    const c = CARDS[id];
    if (!c) return null;
    const relPath = (BASE + c.dir + '/' + c.title).replace('20_Cards/../', '');
    return {
      id,
      title: c.title,
      type: c.type,
      tip: c.tip,
      path: relPath,
      uri: 'obsidian://open?vault=' + encodeURIComponent(VAULT) + '&file=' + encodeURIComponent(relPath)
    };
  }

  function pick(map, key) {
    return (map[key] || []).map(getCard).filter(Boolean);
  }

  return {
    CARDS,
    ACTION_MAP,
    EVENT_MAP,
    PROFILE_MAP,
    getCard,
    forAction: id => pick(ACTION_MAP, id),
    forEvent: id => pick(EVENT_MAP, id),
    forProfile: id => pick(PROFILE_MAP, id)
  };
});
