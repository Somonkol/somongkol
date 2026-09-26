/* 
  Kim Somangkol Physics Portfolio
  Interactive Physics Formula Calculator Engine
*/

class PhysicsCalculator {
  constructor() {
    this.initTabs();
    this.initCalculators();
  }

  initTabs() {
    const tabs = document.querySelectorAll('.calc-tab');
    const panels = document.querySelectorAll('.calc-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.dataset.target;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  initCalculators() {
    // 1. Kinematics Calculator: v = u + at
    const kinU = document.getElementById('kin-u');
    const kinA = document.getElementById('kin-a');
    const kinT = document.getElementById('kin-t');
    const kinRes = document.getElementById('kin-res');

    const calcKin = () => {
      if (!kinU || !kinA || !kinT || !kinRes) return;
      const u = parseFloat(kinU.value) || 0;
      const a = parseFloat(kinA.value) || 0;
      const t = parseFloat(kinT.value) || 0;
      const v = u + (a * t);
      kinRes.innerText = v.toFixed(2) + " m/s";
    };

    [kinU, kinA, kinT].forEach(input => input && input.addEventListener('input', calcKin));

    // 2. Newton's Force Calculator: F = ma
    const forceM = document.getElementById('force-m');
    const forceA = document.getElementById('force-a');
    const forceRes = document.getElementById('force-res');

    const calcForce = () => {
      if (!forceM || !forceA || !forceRes) return;
      const m = parseFloat(forceM.value) || 0;
      const a = parseFloat(forceA.value) || 0;
      const f = m * a;
      forceRes.innerText = f.toFixed(2) + " N";
    };

    [forceM, forceA].forEach(input => input && input.addEventListener('input', calcForce));

    // 3. Kinetic Energy Calculator: Ek = 0.5 * m * v^2
    const keM = document.getElementById('ke-m');
    const keV = document.getElementById('ke-v');
    const keRes = document.getElementById('ke-res');

    const calcKE = () => {
      if (!keM || !keV || !keRes) return;
      const m = parseFloat(keM.value) || 0;
      const v = parseFloat(keV.value) || 0;
      const ek = 0.5 * m * Math.pow(v, 2);
      keRes.innerText = ek.toFixed(2) + " J";
    };

    [keM, keV].forEach(input => input && input.addEventListener('input', calcKE));

    // 4. Ohm's Law Calculator: V = I * R
    const ohmI = document.getElementById('ohm-i');
    const ohmR = document.getElementById('ohm-r');
    const ohmRes = document.getElementById('ohm-res');

    const calcOhm = () => {
      if (!ohmI || !ohmR || !ohmRes) return;
      const i = parseFloat(ohmI.value) || 0;
      const r = parseFloat(ohmR.value) || 0;
      const v = i * r;
      ohmRes.innerText = v.toFixed(2) + " V";
    };

    [ohmI, ohmR].forEach(input => input && input.addEventListener('input', calcOhm));

    // 5. Faraday's Law of Induction: e = -N * (dPhi / dt)
    const indN = document.getElementById('ind-n');
    const indDphi = document.getElementById('ind-dphi');
    const indDt = document.getElementById('ind-dt');
    const indRes = document.getElementById('ind-res');

    const calcInd = () => {
      if (!indN || !indDphi || !indDt || !indRes) return;
      const n = parseFloat(indN.value) || 0;
      const dPhi = parseFloat(indDphi.value) || 0;
      const dt = parseFloat(indDt.value) || 1;
      if (dt === 0) return;
      const e = Math.abs(n * (dPhi / dt));
      indRes.innerText = e.toFixed(2) + " V";
    };

    [indN, indDphi, indDt].forEach(input => input && input.addEventListener('input', calcInd));

    // 6. Self-Induction & Magnetic Energy: e = -L * (di / dt), W = 0.5 * L * i^2
    const selfL = document.getElementById('self-l');
    const selfDi = document.getElementById('self-di');
    const selfDt = document.getElementById('self-dt');
    const selfI = document.getElementById('self-i');
    const selfResE = document.getElementById('self-res-e');
    const selfResW = document.getElementById('self-res-w');

    const calcSelf = () => {
      if (!selfL || !selfDi || !selfDt || !selfResE) return;
      const l = parseFloat(selfL.value) || 0;
      const di = parseFloat(selfDi.value) || 0;
      const dt = parseFloat(selfDt.value) || 1;
      const i = parseFloat(selfI ? selfI.value : 0) || 0;
      if (dt === 0) return;
      const e = Math.abs(l * (di / dt));
      const w = 0.5 * l * Math.pow(i, 2);
      selfResE.innerText = e.toFixed(2) + " V";
      if (selfResW) selfResW.innerText = w.toFixed(3) + " J";
    };

    [selfL, selfDi, selfDt, selfI].forEach(input => input && input.addEventListener('input', calcSelf));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PhysicsCalculator();
});
