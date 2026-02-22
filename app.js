// CLEAR — minimal, structured, non-addictive MVP
// No accounts, no badges, no streaks, no guilt notifications, no diagnosis language.
// Session-only: nothing stored to cloud, no localStorage.

const app = document.getElementById("app");

const state = {
  mode: "invite", // invite | step
  stepIndex: 0,
  selectedArea: null,
  selectedControl: null,
  realQuestion: "",
  chosenAction: null,
};

const AREAS = [
  { id: "pressure", label: "現實壓力" },
  { id: "compare", label: "比較牽動" },
  { id: "doubt", label: "自我懷疑" },
  { id: "delay", label: "決策拖延" },
  { id: "fog", label: "方向不明" },
];

const CONTROL = [
  { id: "control", label: "我能控制" },
  { id: "influence", label: "我能影響" },
  { id: "cannot", label: "我不能控制" },
];

const QUESTIONS = {
  pressure: [
    "你現在要解決的，是「問題」還是「面子」？",
    "你需要的是更多努力，還是更清楚的取捨？",
  ],
  compare: [
    "你在輸給別人，還是在輸給想像的標準？",
    "如果沒有人看見，你還會追這個嗎？",
  ],
  doubt: [
    "你懷疑的是能力，還是價值？",
    "你是在變更謹慎，還是在變更退縮？",
  ],
  delay: [
    "你是不會做，還是不想承擔做不好？",
    "你在等待更好的時機，還是在逃避決定？",
  ],
  fog: [
    "你真的沒有路，還是不想走那條路？",
    "你要的是方向，還是你要允許自己開始？",
  ],
};

const ACTIONS = {
  control: [
    "用 10 分鐘把「下一步」寫成一句話。",
    "把今天要做的事縮小到 1 件（可完成）。",
    "修正一個你正在拖延的最小行動。",
  ],
  influence: [
    "聯絡 1 個人：只問一個具體問題。",
    "整理 1 份你可提供的價值清單（3點）。",
    "為明天預留 30 分鐘，做一次清醒決策。",
  ],
  cannot: [
    "寫下你不能控制的 1 件事，然後停止內耗它。",
    "把注意力移回：你能控制的 1 個小動作。",
    "選擇「暫停」：休息 30 分鐘再決定。",
  ],
};

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  });
  children.forEach((c) => {
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}

function randPick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function render() {
  app.innerHTML = "";

  const brand = h("div", { class: "brand" }, [
    h("h1", {}, ["CLEAR"]),
    h("div", { class: "tag" }, ["Get Clear. Then Move."]),
  ]);
  app.appendChild(brand);

  if (state.mode === "invite") return renderInvite();
  return renderSteps();
}

function renderInvite() {
  app.appendChild(h("div", { class: "headline" }, ["清醒一下。再往前。"]));
  app.appendChild(
    h("p", { class: "sub" }, [
      "CLEAR 不是鼓勵工具，也不替你定義價值。",
      "它只提供結構，問出精準問題，決定權在你。",
    ])
  );

  app.appendChild(h("div", { class: "divider" }));

  const lines = [
    "CLEAR will not motivate you.",
    "It will not tell you what to feel.",
    "It will not define your value.",
    "",
    "It offers structure.",
    "It asks precise questions.",
    "It leaves the decision to you.",
    "",
    "If you prefer guidance, this may not be for you.",
    "If you prefer clarity, you may enter.",
  ];
  const pre = h("p", { class: "sub", style: "white-space:pre-line" }, [lines.join("\n")]);
  app.appendChild(pre);

  const btnRow = h("div", { class: "btnrow" }, [
    h("button", {
      class: "primary",
      onclick: () => {
        state.mode = "step";
        state.stepIndex = 0;
        state.selectedArea = null;
        state.selectedControl = null;
        state.realQuestion = "";
        state.chosenAction = null;
        render();
      },
    }, ["進入 CLEAR"]),
    h("button", {
      onclick: () => {
        // Quiet exit: no guilt.
        app.appendChild(h("p", { class: "small" }, ["已結束。你可以隨時再回來。"]));
      },
    }, ["再想想"]),
  ]);
  app.appendChild(btnRow);

  app.appendChild(
    h("p", { class: "small" }, [
      "隱私：本 MVP 不要求註冊；不保存到雲端；不做打卡、徽章、連續天數。",
    ])
  );

  renderFooter();
}

function renderSteps() {
  const steps = [
    { key: "C", name: "Circumstance", title: "你現在主要卡在哪？", render: renderStepC },
    { key: "L", name: "Location of Control", title: "這件事在哪個控制範圍？", render: renderStepL },
    { key: "E", name: "Extract", title: "把真正的問題寫成一句話", render: renderStepE },
    { key: "A", name: "Autonomy", title: "在這裡，你仍然可以選擇什麼？", render: renderStepA },
    { key: "R", name: "Run", title: "做一個可完成的小行動", render: renderStepR },
  ];

  const s = steps[state.stepIndex];

  app.appendChild(h("div", { class: "step" }, [
    h("span", { class: "pill" }, [`${s.key}`]),
    h("span", {}, [s.name]),
  ]));
  app.appendChild(h("div", { class: "q" }, [s.title]));
  s.render();

  renderFooter();
}

function nextStep() {
  state.stepIndex = Math.min(state.stepIndex + 1, 4);
  render();
}
function prevStep() {
  state.stepIndex = Math.max(state.stepIndex - 1, 0);
  render();
}

function renderStepC() {
  app.appendChild(h("p", { class: "hint" }, ["只選一個最主要的。"]));

  const row = h("div", { class: "btnrow" });
  AREAS.forEach(a => {
    row.appendChild(h("button", {
      class: state.selectedArea === a.id ? "primary" : "",
      onclick: () => { state.selectedArea = a.id; render(); }
    }, [a.label]));
  });
  app.appendChild(row);

  if (state.selectedArea) {
    const q = randPick(QUESTIONS[state.selectedArea]);
    app.appendChild(h("div", { class: "divider" }));
    app.appendChild(h("p", { class: "hint" }, ["提示問題："]));
    app.appendChild(h("div", { class: "q" }, [q]));
  }

  app.appendChild(h("div", { class: "btnrow" }, [
    h("button", { onclick: () => { state.mode = "invite"; render(); } }, ["退出"]),
    h("button", {
      class: "primary",
      onclick: () => { if (state.selectedArea) nextStep(); }
    }, ["下一步"])
  ]));
}

function renderStepL() {
  app.appendChild(h("p", { class: "hint" }, ["分辨控制範圍，焦慮會下降。"]));

  const row = h("div", { class: "btnrow" });
  CONTROL.forEach(c => {
    row.appendChild(h("button", {
      class: state.selectedControl === c.id ? "primary" : "",
      onclick: () => { state.selectedControl = c.id; render(); }
    }, [c.label]));
  });
  app.appendChild(row);

  app.appendChild(h("div", { class: "btnrow" }, [
    h("button", { onclick: prevStep }, ["上一步"]),
    h("button", {
      class: "primary",
      onclick: () => { if (state.selectedControl) nextStep(); }
    }, ["下一步"])
  ]));
}

function renderStepE() {
  app.appendChild(h("p", { class: "hint" }, ["一句話就好。越短越清楚。"]));

  const input = h("input", {
    class: "input",
    placeholder: "例如：我正在把價值綁在別人的回應上。",
    value: state.realQuestion,
    oninput: (e) => { state.realQuestion = e.target.value; }
  });
  app.appendChild(input);

  app.appendChild(h("div", { class: "btnrow" }, [
    h("button", { onclick: prevStep }, ["上一步"]),
    h("button", {
      class: "primary",
      onclick: () => nextStep()
    }, ["下一步"])
  ]));
}

function renderStepA() {
  app.appendChild(h("p", { class: "hint" }, [
    "選擇不是為了讓你感覺好，而是把主權拿回來。"
  ]));

  const options = [
    "修正一個標準",
    "縮小目標到可完成",
    "直接行動（不等完美）",
    "暫停（休息後再決定）"
  ];

  const row = h("div", { class: "btnrow" });
  options.forEach(opt => {
    row.appendChild(h("button", {
      class: state.chosenAction === opt ? "primary" : "",
      onclick: () => { state.chosenAction = opt; render(); }
    }, [opt]));
  });
  app.appendChild(row);

  app.appendChild(h("div", { class: "btnrow" }, [
    h("button", { onclick: prevStep }, ["上一步"]),
    h("button", { class: "primary", onclick: nextStep }, ["下一步"])
  ]));
}

function renderStepR() {
  app.appendChild(h("p", { class: "hint" }, ["10 分鐘內可完成。完成後就結束。"]));

  const actions = ACTIONS[state.selectedControl || "influence"];
  const row = h("div", { class: "btnrow" });
  actions.forEach(a => {
    row.appendChild(h("button", {
      class: state.chosenAction === a ? "primary" : "",
      onclick: () => { state.chosenAction = a; render(); }
    }, [a]));
  });
  app.appendChild(row);

  app.appendChild(h("div", { class: "divider" }));

  const doneRow = h("div", { class: "btnrow" }, [
    h("button", { onclick: prevStep }, ["上一步"]),
    h("button", {
      class: "primary",
      onclick: () => showEnd()
    }, ["我完成了"])
  ]);
  app.appendChild(doneRow);

  const shareRow = h("div", { class: "btnrow" }, [
    h("button", { onclick: () => share() }, ["分享這個框架（可選）"]),
    h("button", { onclick: () => { state.mode="invite"; render(); } }, ["回到入口"]),
  ]);
  app.appendChild(shareRow);
}

function showEnd() {
  app.innerHTML = "";
  app.appendChild(h("div", { class: "brand" }, [
    h("h1", {}, ["CLEAR"]),
    h("div", { class: "tag" }, ["End. No streaks."]),
  ]));
  app.appendChild(h("div", { class: "headline" }, ["已對齊。"]));
  app.appendChild(h("p", { class: "sub" }, [
    "你不是在證明自己。",
    "你只是在把主權拿回來。",
  ]));
  app.appendChild(h("div", { class: "divider" }));
  app.appendChild(h("p", { class: "sub" }, [
    "結束就是結束。",
    "你可以回到生活。",
  ]));

  const row = h("div", { class: "btnrow" }, [
    h("button", { class:"primary", onclick: () => { state.mode="invite"; render(); } }, ["再做一次 CLEAR"]),
    h("button", { onclick: () => share() }, ["分享（可選）"]),
  ]);
  app.appendChild(row);

  renderFooter();
}

async function share() {
  const text = "CLEAR：一個2分鐘的結構化清醒方法（不打卡、不徽章、不操控）。\nGet clear. Then move.";
  try {
    if (navigator.share) {
      await navigator.share({ title: "CLEAR", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("已複製到剪貼簿。");
    }
  } catch (_) {}
}

function renderFooter(){
  const foot = h("div", { class: "footer" }, [
    h("div", {}, ["© CLEAR MVP · No badges · No streaks"]),
    h("div", {}, [
      h("span", {}, ["PWA-ready · "]),
      h("a", { href: "https://github.com/", target: "_blank", rel: "noreferrer" }, ["GitHub Pages"])
    ])
  ]);
  app.appendChild(foot);
}

render();
