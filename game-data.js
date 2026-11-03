// 人力资源与组织激励沙盘（《带队吧，老板！》）- 静态数据配置
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GameData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const PRD_CONFIG = {
    game_title: "带队吧，老板！",
    game_subtitle: "人力资源与组织激励沙盘 · 纯管理版",
    default_project_name: "代号-跃迁",
    total_months: 6,
    initial_budget: 8000,
    initial_morale: 72,
    initial_market: 70,       // 对应：画饼信誉度 / 雇主品牌口碑
    initial_oem_relation: 60, // 对应：董事会信任 / 组织协同度
    salary_overrun_threshold: 0.08,
    balance: {
      natural_progress_rate: 0.18,
      freeze_converging_sum: 100,
      freeze_stable_sum: 130,
      func_w_progress: 0.5,
      func_w_road: 0.5,
      delay_penalty_per_week: 4,
      blind_waive_risk_min: 25, // 高离职风险席位的真实风险判定阈值
      blind_waive_penalty: 10,  // 现金兑现不足时每对一项高危席位发大饼扣除的留任分
      blind_waive_exempt: ['gnss'], // 豁免项
      knowing_waive_min_repair_weeks: 3, // 高危席位足额兑现达到该权重才免扣
      min_improve_actions: 2, // 至少做几次实质激励动作才可能拿 A
      improve_action_ids: ['data_rain', 'road_scene', 'safety_case'], // 实质激励动作：即时项目红包、带薪团建关怀、普调福利兜底
      audit_bonus_per_dir: 1.5, // 每个做过 HRBP 深度摸底的维度计入综合分的知情度加分
      dedupe_substantive_actions: true, // 同一实质激励动作重复做只算 1 次
      score_weights: {
        safety: 0.30,   // 核心留任率（防提桶跑路）
        function: 0.25, // 真实业务产出
        delivery: 0.15, // 组织协同与承诺兑现
        cost: 0.15,     // 薪酬包人效比
        morale: 0.15    // 团队敬业度
      }
    }
  };

  // 完全去职能化的 6 大核心团队生态位（保留内部 id 映射以确保引擎确定性）
  const DIRECTIONS = [
    { id: "perception", name: "① 开山元老席位（定海神针）", short_name: "开山元老", default_progress: 8 },
    { id: "planning",   name: "② 业务王牌席位（扛鼎主力）", short_name: "业务王牌", default_progress: 8 },
    { id: "fs",         name: "③ 中坚骨干席位（中流砥柱）", short_name: "中坚骨干", default_progress: 5 },
    { id: "data",       name: "④ 青年生力军席位（活力冲锋）", short_name: "青年生力军", default_progress: 10 },
    { id: "oem",        name: "⑤ 协同枢纽席位（跨界粘合）", short_name: "协同枢纽", default_progress: 12 },
    { id: "road",       name: "⑥ 基层执行席位（底座支撑）", short_name: "基层执行", default_progress: 10 }
  ];

  const TRAIT_META = {
    report_pretty: {
      name: "PPT 汇报大师",
      tag_class: "tag-pretty",
      desc: "深谙向上管理与周报精装修。高压考核下真实产出不增，反而全力包装表面苦劳与虚假业绩。"
    },
    no_mgmt: {
      name: "只认钱/反画饼",
      tag_class: "tag-nomgmt",
      desc: "实力强悍但极度务实，对上市期权大饼、家文化洗脑与末尾淘汰威胁极度反感，只认可真金白银与公平规则。"
    },
    no_ot: {
      name: "反内卷/重边界",
      tag_class: "tag-noot",
      desc: "死守下班与周末边界，强制军事拓展或抓考勤会触发强烈逆反；但在尊重边界与即时激励下产出极高。"
    },
    oem_please: {
      name: "和稀泥老好人",
      tag_class: "tag-oem",
      desc: "害怕得罪人，喜欢搞大锅饭平均主义，遇到高层施压或跨部门甩锅时容易无底线妥协。"
    }
  };

  const TEAM_CARDS = [
    // ① 开山元老席位 (perception)
    {
      id: "p_paper",
      dir: "perception",
      name: "老陈 · 功勋老臣班底",
      headcount: 18,
      salary_month: 280,
      years: 6,
      blurb: "跟着公司从零起步的元老派。资历深、排场大、汇报PPT极具战略高度，但平时喜欢端架子吃老本。",
      true_power: 38,
      traits: ["no_ot"],
      fake_bias: { reported_coverage: 18 },
      anonymous_quotes: {
        micromanaged: "老板居然拿 361 末尾淘汰和抓考勤来治我们这帮开国功臣？行，大家一起演戏混日子呗。",
        empowered: "老板给足了元老体面，也没搞虚头巴脑的折腾，这把老骨头就陪公司再拼一次！"
      }
    },
    {
      id: "p_zhou",
      dir: "perception",
      name: "大林 · 创业死忠实力派",
      headcount: 8,
      salary_month: 160,
      years: 12,
      blurb: "真正扛过无数硬仗的定海神针。说话直、脾气硬，最恨老板画假饼或给空降兵开高薪造成倒挂。",
      true_power: 72,
      traits: ["no_mgmt"],
      fake_bias: { reported_coverage: 4 },
      anonymous_quotes: {
        micromanaged: "天天开会画上市期权大饼、搞狼性口号，当年承诺的分红都没兑现，当我们是傻子吗？",
        empowered: "老板从不画空头大饼，项目奖金说到做到，跟着实在人干活心里踏实！"
      }
    },

    // ② 业务王牌席位 (planning)
    {
      id: "n_lab",
      dir: "planning",
      name: "阿杰 · 狼性野心家团队",
      headcount: 12,
      salary_month: 220,
      years: 5,
      blurb: "高调张扬的明星团队。周报业绩永远全司第一，极其渴望高 Title 与晋升，但擅长挑容易出彩的活干。",
      true_power: 40,
      traits: ["no_ot"],
      fake_bias: { reported_shadow: 16 },
      anonymous_quotes: {
        micromanaged: "老板要看狼性冲刺指标？那我们就把存量业绩拆成十份报上去，数字好看谁不会刷。",
        empowered: "奖罚分明、不搞大锅饭，让我们真正把精力花在攻克核心业务硬骨头上了。"
      }
    },
    {
      id: "n_kai",
      dir: "planning",
      name: "高冷 · 高薪雇佣兵王牌",
      headcount: 6,
      salary_month: 140,
      years: 9,
      blurb: "单兵作战能力极强的精英小队。明码标价：钱给够什么硬仗都能啃，但对团建、家文化和期权画饼完全免疫。",
      true_power: 68,
      traits: ["no_ot"],
      fake_bias: { reported_shadow: 5 },
      anonymous_quotes: {
        micromanaged: "少跟我们谈什么三年上市财务自由，猎头电话就在手边，加班不给奖金那就准点下班。",
        empowered: "老板痛快！里程碑红包和年终奖一分不少，还不占周末搞破冰，这活我们接了！"
      }
    },

    // ③ 中坚骨干席位 (fs)
    {
      id: "f_doc",
      dir: "fs",
      name: "精明 · 算盘性价比小队",
      headcount: 10,
      salary_month: 150,
      years: 7,
      blurb: "职场算盘打得最响的熟手。给多少钱干多少活，汇报文档滴水不漏，但遇到苦活累活永远在走流程。",
      true_power: 36,
      traits: ["report_pretty"],
      fake_bias: { reported_fs_green: true },
      anonymous_quotes: {
        micromanaged: "老板从不找我们私下聊薪资诉求，只要表格填得漂亮就能混过去，年底拿完钱就溜。",
        empowered: "HRBP 居然连我们的真实工作量和外部猎头报价都摸清了，收起小心思好好干吧。"
      }
    },
    {
      id: "f_zhao",
      dir: "fs",
      name: "老周 · 房贷背锅老黄牛",
      headcount: 4,
      salary_month: 90,
      years: 14,
      blurb: "背着房贷车贷的实在人。任劳任怨兜底脏活累活，不善言辞不会哭穷，最看重五险一金与稳定年终奖。",
      true_power: 74,
      traits: ["no_mgmt"],
      fake_bias: {},
      anonymous_quotes: {
        micromanaged: "平时脏活累活全是我们背，发奖金却给会写 PPT 的人，年底再用期权打发我，房贷谁帮我还？",
        empowered: "没想到老板注意到了我们默默兜底的苦劳，还专门批了调薪和福利保障，太感动了！"
      }
    },

    // ④ 青年生力军席位 (data)
    {
      id: "d_out",
      dir: "data",
      name: "小满 · 凑数刷量外围组",
      headcount: 40,
      salary_month: 180,
      years: 3,
      blurb: "人多热闹的年轻团队。表面工时与产出数字惊人，但遇到没人盯的枯燥任务就开启带薪摸鱼糊弄模式。",
      true_power: 32,
      traits: ["report_pretty"],
      fake_bias: { reported_corners: 20 },
      anonymous_quotes: {
        micromanaged: "反正老板只看表面KPI数字，大家把任务拆碎刷满工单就行，难啃的活直接糊弄过去。",
        empowered: "老板发了里程碑即时红包还亲自下场摸底，摸鱼混不走了，赶紧拿出真本事吧。"
      }
    },
    {
      id: "d_core",
      dir: "data",
      name: "小鹿 · 00后整顿职场先锋",
      headcount: 7,
      salary_month: 110,
      years: 8,
      blurb: "脑洞大、冲劲足的Z世代精锐。吃软不吃硬，给足情绪价值与即时红包能爆肝，但极度反感爹味说教与周末团建。",
      true_power: 70,
      traits: ["no_ot"],
      fake_bias: { reported_corners: 2 },
      anonymous_quotes: {
        micromanaged: "大周末拉我们去郊区搞军事拓展喊口号？还要写感恩小作文？简历已更新，随时提桶跑路！",
        empowered: "工作日带薪聚餐+直接发红包不画饼，神仙老板！这波冲刺我们00后包圆了！"
      }
    },

    // ⑤ 协同枢纽席位 (oem)
    {
      id: "o_rel",
      dir: "oem",
      name: "林姐 · 茶水间和事佬组",
      headcount: 6,
      salary_month: 100,
      years: 6,
      blurb: "笑脸迎人的气氛组。谁来闹事都靠“私下安抚+口头许诺”和稀泥，表面一团和气，实则经常替老板乱开空头支票。",
      true_power: 35,
      traits: ["oem_please"],
      fake_bias: { reported_oem_green: true },
      anonymous_quotes: {
        micromanaged: "老板要省钱画大饼，底下员工要闹事，我只能两边瞒着私下许诺升职加薪，年底肯定要穿帮。",
        empowered: "老板建立了透明公正的分配规则，我终于不用天天在茶水间靠哄骗和稀泥过日子了。"
      }
    },
    {
      id: "o_disc",
      dir: "oem",
      name: "铁面 · 铁腕HRBP与运营组",
      headcount: 3,
      salary_month: 70,
      years: 11,
      blurb: "原则性极强的组织守门人。坚持薪酬公平与考核红线，绝不配合搞虚假文化作秀，常被混子员工背后记恨。",
      true_power: 66,
      traits: ["no_mgmt"],
      fake_bias: {},
      anonymous_quotes: {
        micromanaged: "老板天天搞形式主义洗脑大会、给吵闹的人私下塞糖，把薪酬体系全破坏了，没法管！",
        empowered: "老板守住了激励公平底线，没有让会哭的孩子多吃奶，组织风气无比清爽。"
      }
    },

    // ⑥ 基层执行席位 (road)
    {
      id: "r_miles",
      dir: "road",
      name: "老油条 · 表演型加班大队",
      headcount: 20,
      salary_month: 160,
      years: 4,
      blurb: "每晚十点工位灯火通明、朋友圈深夜晒公司夜景。然而仔细一看，白天两小时的活被拉长到十小时慢慢磨。",
      true_power: 34,
      traits: ["report_pretty"],
      fake_bias: { reported_mileage_bias: 25 },
      anonymous_quotes: {
        micromanaged: "老板喜欢看狼性加班？那还不简单，吃完晚饭在工位刷手机到十点再打车报销，全员拿满勤奖！",
        empowered: "改成看真实业务产出和带薪福利后，演加班没用了，只能老老实实把活干漂亮。"
      }
    },
    {
      id: "r_rain",
      dir: "road",
      name: "阿宅 · 实用主义实干派",
      headcount: 9,
      salary_month: 130,
      years: 10,
      blurb: "沉默寡言的执行铁军。从不参加酒局应酬，准点高效干完所有硬活。所有画饼对他无效，唯独认购物卡与带薪假。",
      true_power: 71,
      traits: ["no_ot"],
      fake_bias: { reported_mileage_bias: -5 },
      anonymous_quotes: {
        micromanaged: "周末拉我们去荒野徒步破冰？别闹了，我们还不如在家睡觉，再折腾直接裸辞。",
        empowered: "不逼我们社交、团建改在周五下午还发购物卡，这辈子就跟定这个老板了！"
      }
    }
  ];

  const MONTHLY_ACTIONS = [
    {
      id: "overtime",
      name: "强推「361 强制正态分布 & PIP 末尾淘汰」",
      short_name: "361 末尾淘汰",
      cost: 400,
      requires_dir: true,
      valid_dirs: ["perception", "planning"],
      desc: "划定 10% 末尾淘汰红线高压鞭策。目标席位表面业绩暴涨，但全员陷入恐慌内耗（敬业度-8）。若遇反内卷或务实派将触发剧烈抗命。"
    },
    {
      id: "data_rain",
      name: "发放「里程碑即时项目红包（Spot Bonus）」",
      short_name: "即时项目红包",
      cost: 450,
      requires_dir: true,
      valid_dirs: ["data"],
      desc: "不画远期空头大饼，打赢阶段硬仗当场发真金白银现金奖！大幅提升青年生力军与开山元老的真实业务产出与留任忠诚度。"
    },
    {
      id: "road_scene",
      name: "举办团队团建活动（团建流派二选一）",
      short_name: "组织团建活动",
      cost: 400,
      requires_dir: true,
      valid_dirs: ["road"],
      desc: "决定本季度的团建方式：是搞感动老板的【周末铁血军事拓展】，还是搞员工真正喜欢的【周五带薪腐败游 & 发购物卡】。"
    },
    {
      id: "audit",
      name: "开展「HRBP 深度离职摸底 & 1-on-1 谈心」",
      short_name: "HRBP 离职摸底",
      cost: 80,
      requires_dir: true,
      valid_dirs: ["data", "road", "fs"],
      desc: "绕过表面和谐的周报，与核心员工私下一对一交心。彻底摸清外部猎头挖角、薪资倒挂怨气与带薪摸鱼真相，降低年底跑路风险。"
    },
    {
      id: "cut",
      name: "重塑激励边界：砍掉「大锅饭与无效加班表演」",
      short_name: "破除大锅饭",
      cost: 0,
      requires_dir: false,
      valid_dirs: [],
      desc: "叫停全员平分奖金的大锅饭与形式主义打卡，将资源集中给核心业务王牌。短期会得罪混日子的與论，但业务王牌产出大涨。"
    },
    {
      id: "safety_case",
      name: "设立「骨干留任调薪池 & 保底福利盾」",
      short_name: "调薪福利兜底",
      cost: 500,
      requires_dir: true,
      valid_dirs: ["fs"],
      desc: "拿出真金白银专项预算，消除内部薪资倒挂、升级五险一金与餐补福利。大幅压降中坚骨干的离职暗雷，筑牢团队底盘。"
    },
    {
      id: "oem_please_act",
      name: "召开「全员上市期权画饼 & 价值观洗脑大会」",
      short_name: "上市期权画饼",
      cost: 250,
      requires_dir: true,
      valid_dirs: ["oem"],
      desc: "租下豪华会场高喊“三年上市全员财务自由”！短期向董事会汇报极好看，但透支画饼信誉，且让此前破除的大锅饭乱象死灰复燃。"
    },
    {
      id: "noop",
      name: "推行「弹性工作制 · 不打卡不折腾」",
      short_name: "弹性不折腾",
      cost: 0,
      requires_dir: false,
      valid_dirs: [],
      desc: "本月不搞任何运动式考核与洗脑开会，给予员工充分信任与自主空间，观察团队自然产出。"
    }
  ];

  const ROAD_SCENE_OPTIONS = {
    highway: {
      id: "highway",
      name: "流派 A：周末两天一夜「铁血狼性军事拓展」",
      desc: "占用员工双休日去郊区拉练喊口号。发在公司公众号上感动了高管（表面工时暴增+20），但员工怨声载道，真实凝聚力仅+1。"
    },
    urban_rain: {
      id: "urban_rain",
      name: "流派 B：周五下午「带薪腐败游 + 京东购物卡」",
      desc: "占用半天工作时间吃喝玩乐并发放实用购物卡。表面工时汇报不好看（仅+4），但基层与元老心气大振，真实战斗力与留任率暴涨！"
    }
  };

  const EMERGENCY_EVENTS = [
    {
      id: "e_oem_add",
      weight: 3,
      title: "茶水间风暴：新老员工「薪资倒挂」工资条泄密",
      body: "新招员工把薪资单忘在打印机上，干了三年的老骨干发现新人 Base 比自己还高 35%！现在整个团队气压低到冰点，工位上没人干活。",
      opt_a: {
        text: "顶住预算压力，立即建立公平职级带宽并纠偏倒挂",
        desc: "公开透明定分止争，董事会短期嫌贵-6，画饼水分挤出-4，但激励体系升一级。"
      },
      opt_b: {
        text: "发全员邮件严查「谁违反密薪制高压线」，杀鸡儆猴",
        desc: "捂嘴立威，董事会觉得你有手腕+6，但核心王牌极度心寒产出-8。"
      },
      opt_c: {
        text: "私下找老员工画大饼：「明年上市期权给你翻倍」",
        desc: "表面暂时稳住+4，但埋下巨额期权债，年底年终奖大会王牌与青年军跑路风险各+8！"
      }
    },
    {
      id: "e_iface",
      weight: 3,
      title: "抢功劳大战：季度评优会上两大主力拍桌互撕",
      body: "季度奖金分配会上，汇报精美的团队把默默兜底团队熬夜三个月的成果全算在自己头上，双方当场拍桌子互骂，团队濒临分裂。",
      opt_a: {
        text: "拉通全链路贡献度复盘，按真实产出重新切分奖金",
        desc: "不看PPT看实绩，元老与王牌席位产出各+3，团队敬业度+4。"
      },
      opt_b: {
        text: "偏袒嘴甜会来事的一方，敲打老实人「要有大局观」",
        desc: "谁会哭给谁吃奶，元老表面+4，但王牌主力心寒-6，全员敬业度-4。"
      },
      opt_c: {
        text: "和稀泥搞「阳光普照大锅饭」，两边奖金平分",
        desc: "看似谁都不罪，实则干活的人彻底心冷，团队敬业度重挫-8。"
      }
    },
    {
      id: "e_no_rain",
      weight: 2,
      title: "周末团建抗议：全员接龙请假抵制「荒野拉练」",
      body: "行政通知周六周日全员去郊区搞两天一夜军事化破冰，早上六点集合跑五公里，群里一半员工开始晒病假条接龙抵制。",
      opt_a: {
        text: "叫停周末拉练，改为周五下午带薪下午茶+双休放假",
        desc: "尊重员工休息边界，团队敬业度+3，当期表面工时小幅-2。"
      },
      opt_b: {
        text: "下死命令：「无故缺席团建者按旷工扣发年终奖」",
        desc: "强行拉去军训，表面执行力+4，但全员在匿名群骂翻天，敬业度暴跌-12！"
      },
      opt_c: {
        text: "借团建之名直接下达「狼性冲刺军令状」",
        desc: "按高压淘汰机制强推（若团队带反内卷特质将触发抗命减半）。"
      }
    },
    {
      id: "e_label",
      weight: 2,
      title: "匿名社区热帖：青年员工吐槽公司「带薪摸鱼攻略」",
      body: "职场匿名社区突然火了一篇帖子，详细拆解在你手下如何用精美周报掩盖每天只干两小时活的「摸鱼养老秘籍」。",
      opt_a: {
        text: "发放专项激励重构考核，淘汰混子并重奖实干者",
        desc: "刮骨疗毒，投入专项激励金-60万，青年生力军真实产出能力+8。"
      },
      opt_b: {
        text: "删帖捂盖子，继续拿好看的虚假工时向董事会邀功",
        desc: "默许摸鱼造假，青年生力军真实战力-6，但下月表面汇报数字再虚增+10。"
      },
      opt_c: {
        text: "安排 HRBP 开展一对一深度离职与状态摸底",
        desc: "立刻免费触发一次青年生力军深度摸底，查明真实摸鱼率与离职倾向！"
      }
    },
    {
      id: "e_sign",
      weight: 2,
      title: "猎头挖角摊牌：核心老黄牛拿着涨薪 40% Offer 辞职",
      body: "年底冲刺最吃紧的时候，平时从不叫苦的中坚骨干突然递交辞呈，对家开了涨薪 40% 的全现金 Offer，他问你公司承诺的奖金到底有没有谱。",
      opt_a: {
        text: "真诚肯定其不可替代价值，兑现专项留任津贴",
        desc: "留人又留心，骨干席位进度+2，团队敬业度+2，全员看到老实人不被亏待。"
      },
      opt_b: {
        text: "冷笑表示「地球离了谁都转」，换个听话新人顶上",
        desc: "表面省钱进度+8，但骨干寒心交接敷衍，真实核心底盘-10，敬业度-6。"
      },
      opt_c: {
        text: "扣住离职证明不批，并用「竞业协议与期权作废」恐吓",
        desc: "强行把人按下（表面状态变绿），但结下死仇，年底骨干集中爆发跑路风险+15！"
      }
    },
    {
      id: "e_competitor",
      weight: 2,
      title: "大老板深夜发飙：「为什么十点半工位空了一半？！」",
      body: "集团大老板昨晚十点半突击视察，拍下空荡荡的办公区发进高管群质问你为什么没有大厂狼性，要求下周起抓晚九点打卡。",
      opt_a: {
        text: "拿出团队硬核业务产出数据向上抗辩，拒绝形式主义抓考勤",
        desc: "给团队当挡风墙，顶住老板压力不折腾员工，护住团队心气。"
      },
      opt_b: {
        text: "当「焦虑二传手」，连夜宣布全员 996 抓考勤打卡",
        desc: "讨好大老板+8，但等同搞洗脑折腾，团队激励秩序倒退降级！"
      },
      opt_c: {
        text: "暗中教员工「下班别关电脑屏幕、椅背挂件外套」演给老板看",
        desc: "表面应付了老板+5，但全员学会弄虚作假，组织风气滑坡。"
      }
    },
    {
      id: "e_ip",
      weight: 2,
      title: "期权贬值传闻：外部疯传公司「上市无望、期权变废纸」",
      body: "自媒体爆料公司下一轮融资受阻、上市遥遥无期，当初冲着期权降薪加盟的元老与骨干人心惶惶，私下都在联系猎头。",
      opt_a: {
        text: "批一笔小额现金分红补贴，用真金白银给团队吃定心丸",
        desc: "务实安抚，花费40万预算，开山元老真实留任战力+3。"
      },
      opt_b: {
        text: "主动向董事会争取期权回购窗口，给全员放带薪假休整一周",
        desc: "极具担当！消耗180万，休整延期1周，元老真实凝聚力大幅+8！"
      },
      opt_c: {
        text: "继续吹牛画大饼：「明年必去纳斯达克敲钟，谁信谣开除谁」",
        desc: "元老真实信任-4，年底元老席位掀桌提桶跑路风险激增+10！"
      }
    },
    {
      id: "e_ot_refuse",
      weight: 4,
      title: "HRBP 警报：核心团队出现集体「带薪摸鱼（Quiet Quitting）」",
      body: "后台数据显示某核心团队近期全员卡点上下班、周会一言不发，对老板画的任何大饼只回一个「收到」表情包。",
      opt_a: {
        text: "开展走心 1-on-1，砍掉无效周报与爹味早会",
        desc: "真正倾听打工人痛点，团队敬业度恢复+4。"
      },
      opt_b: {
        text: "找团队小组长吃顿便饭温和敲打",
        desc: "隔靴搔痒的怀柔安抚，团队敬业度微幅+2。"
      },
      opt_c: {
        text: "在全员大会上拍桌子痛批「年轻人不讲奉献、只谈钱」",
        desc: "爹味说教彻底激怒全员，组织信任崩塌，团队敬业度暴降-6。"
      }
    }
  ];

  // 终局大考：年底年终奖与调薪分配大会（Annual Review）6 大席位留任检定
  const SOP_ITEMS = [
    {
      id: "rain_ped",
      title: "① 开山元老席位 · 年终分红与期权兑现",
      desc: "元老们熬了一整年，紧盯着年底分红是否如约兑现。若用空头期权打发，极易引发老臣反水带走核心人脉。",
      repair_cost: 600,
      repair_weeks: 2,
      base_risk: 52,
      risk_from: ["perception.true_quality", "road.true_quality", "data.true_quality"]
    },
    {
      id: "cone",
      title: "② 业务王牌席位 · 高额绩效奖金包兑现",
      desc: "外部猎头已拿着高薪 Offer 在楼下咖啡厅蹲守王牌主力。奖金少一分钱，节后立刻跳槽去对家。",
      repair_cost: 350,
      repair_weeks: 1,
      base_risk: 36,
      risk_from: ["perception.true_quality", "planning.true_quality"]
    },
    {
      id: "ghost",
      title: "④ 青年生力军席位 · 年终奖与晋升兑现",
      desc: "年轻人最恨“平时画大饼、年底扣绩效”。若年终奖打折，分分钟在小红书/脉脉发帖直播提桶跑路。",
      repair_cost: 550,
      repair_weeks: 2,
      base_risk: 42,
      risk_from: ["perception.true_quality", "data.true_quality"]
    },
    {
      id: "gnss",
      title: "⑤ 协同枢纽席位 · 夹心层委屈奖与调薪",
      desc: "受了一整年夹板气的协同中枢，若年底连碗热汤都喝不上，跨部门流程将在节后彻底摆烂瘫痪。",
      repair_cost: 300,
      repair_weeks: 1,
      base_risk: 30,
      risk_from: ["planning.true_quality"]
    },
    {
      id: "brake",
      title: "③ 中坚骨干席位 · 房贷老黄牛足额年终奖",
      desc: "老黄牛指望着这笔年终奖还房贷、交孩子学费。一旦克扣或用废纸期权抵扣，老实人被逼急了直接劳动仲裁！",
      repair_cost: 800,
      repair_weeks: 2,
      base_risk: 40,
      risk_from: ["fs.true_quality"]
    },
    {
      id: "label",
      title: "⑥ 基层执行席位 · 十三薪与过年阳光红包",
      desc: "基层员工算的是最实在的过年回家路费与年货钱。连基层十三薪都赖，节后工位直接空一半。",
      repair_cost: 120,
      repair_weeks: 1,
      base_risk: 28,
      risk_from: ["true_label_dispute"]
    }
  ];

  const BRICK_SUBTITLES = [
    "大年初八开工第一天，核心骨干集体递交辞呈，工位空无一人",
    "年终奖发期权大饼引发众怒，员工在脉脉热搜霸榜曝光，猎头连夜搬空团队",
    "老黄牛带着核心业务资料集体跳槽对家，董事会连夜宣布将你免职",
    "你省下了年终奖预算，却把整支团队送给了竞争对手"
  ];

  const PENALTY_BRICK_SUBTITLE = "全员年终奖被你用空头大饼打发，节后爆发集体离职与劳动仲裁，团队原地解散";

  // 纯 HR 版 5 大老板管理风格画像图鉴
  const MANAGEMENT_PROFILES = [
    {
      id: "goodhart",
      title: "周扒皮转世·狼性压榨机",
      tagline: "“只要把 361 淘汰刀架在脖子上，连空气都能挤出KPI——直到所有人提桶跑路。”",
      condition: (history) => history.filter(h => h.action_id === 'overtime').length >= 2,
      desc: "你极度迷信 361 末尾淘汰与高压恐吓。表面工时与周报数字确实被刷到了极致，但团队安全感彻底归零——留下的全在演加班，能干的全在改简历。"
    },
    {
      id: "relay",
      title: "画饼大师·PPT 造梦家",
      tagline: "“张口三年上市敲钟，闭口期权财务自由；除了真金白银，你什么都舍得给。”",
      condition: (history, state) => history.filter(h => h.action_id === 'oem_please_act').length >= 2,
      desc: "你把零成本的空气大饼烙出了米其林的质感，试图用洗脑大会代替真金白银的薪酬激励。直到年底分钱那一刻你才明白：透支信任的画饼，是利息最高的高利贷。"
    },
    {
      id: "blind",
      title: "格子间里的盲人老板",
      tagline: "“坐在独立办公室里看周报，你以为大家都把公司当家。”",
      condition: (history, state) => !state.audited.road && !state.audited.data && !state.audited.safety,
      desc: "整整一年你从未做过哪怕一次 HRBP 深度离职摸底与 1-on-1 交心。你对茶水间的薪资倒挂怨气、猎头挖角暗流一无所知，在虚假的岁月静好中迎来了春招跳槽大爆炸。"
    },
    {
      id: "shield",
      title: "人间清醒·赋能型破局者",
      tagline: "“给雇佣兵发钱，给实干家兜底，把团建办在工作日，把尊重落到细节里。”",
      condition: (history, state) => history.filter(h => h.action_id === 'cut' || h.action_id === 'safety_case').length >= 2,
      desc: "你深谙职场人性的真相：不搞感动自己的周末军事拉练，不画无法兑现的空头期权，坚决破除大锅饭并用真金白银为老黄牛兜底，带出了一支死心塌地的高战力铁军！"
    },
    {
      id: "balanced",
      title: "精打细算·务实当家人",
      tagline: "“在抠门的董事会预算与打工人日益增长的薪资诉求之间，极限走钢丝。”",
      condition: () => true, // fallback
      desc: "你在有限的薪酬包、紧迫的业务目标与复杂的人性诉求之间艰难寻找平衡。你体会到了当老板的不易：每一分奖金都是博弈，每一次妥协都有代价。"
    }
  ];

  function deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    Object.getOwnPropertyNames(obj).forEach((key) => {
      const val = obj[key];
      if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
        deepFreeze(val);
      }
    });
    return Object.freeze(obj);
  }

  // 深冻结除 PRD_CONFIG 外的全局静态常量（保留 PRD_CONFIG 可写以便测试临时覆盖 balance）
  [
    DIRECTIONS,
    TRAIT_META,
    TEAM_CARDS,
    MONTHLY_ACTIONS,
    ROAD_SCENE_OPTIONS,
    EMERGENCY_EVENTS,
    SOP_ITEMS,
    BRICK_SUBTITLES,
    MANAGEMENT_PROFILES
  ].forEach(deepFreeze);

  return {
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
  };
});
