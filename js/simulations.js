/* 
  Kim Somangkol Physics Portfolio
  Virtual Physics Lab Interactive Canvas Simulations
  Includes Electricity & Magnetism (Induction, Self-Induction), Mechanics, Optics & Thermodynamics
*/

class PhysicsLab {
  constructor() {
    this.canvas = document.getElementById('lab-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.currentMode = 'induction'; // Default to Electromagnetic Induction
    this.time = 0;
    this.animationId = null;

    // 1. Electromagnetic Induction State (Faraday's & Lenz's Law)
    this.induction = {
      turns: 200,             // N: 50 to 500 turns
      magnetPos: 0.35,        // 0.0 to 1.0 normalized position
      magnetSpeed: 0,         // px/sec
      magnetPoleNRight: true, // true: N faces coil on right, false: S faces coil
      autoOscillate: true,    // auto back-and-forth motion
      oscSpeed: 1.4,
      oscAngle: 0,
      lastX: 0,
      lastTime: performance.now(),
      isDragging: false,
      dragOffset: 0,
      inducedEMF: 0,
      smoothedEMF: 0,
      galvanometerAngle: 0,
      flux: 0,
      current: 0,
      bulbBrightness: 0
    };

    // 2. Electromagnetic Self-Induction State (RL Circuit & Solenoid)
    this.selfInd = {
      L_base: 0.8,            // Base inductance in Henry (0.2 to 2.5 H)
      hasCore: true,          // Magnetic iron core (increases L by 4x)
      voltage: 12,            // DC voltage source E (6 to 24 V)
      R1: 10,                 // Resistor branch resistance (Ohms)
      R2: 10,                 // Coil branch resistance (Ohms)
      switchClosed: false,    // Knife switch K
      switchAnim: 1.0,        // 0 = closed, 1 = open
      tSwitch: 0,             // seconds since last switch change
      i1: 0,                  // current in resistor branch
      i2: 0,                  // current in inductor branch
      di2_dt: 0,              // rate of current change
      e_self: 0,              // self-induced EMF
      energy: 0,              // magnetic energy 0.5 * L * i^2
      sparkIntensity: 0,      // electric spark on opening switch
      neonFlash: 0,           // neon indicator flash
      history: []             // oscilloscope history buffer
    };

    // Gas Molecules for Thermodynamics Lab
    this.gasParticles = [];
    this.initGasParticles(40);

    // Pendulum State
    this.pendulum = {
      length: 150,
      gravity: 9.8,
      angle: Math.PI / 4,
      angularVelocity: 0,
      angularAcceleration: 0,
      damping: 0.999
    };

    // Prism State
    this.prism = {
      lightAngle: 25,
      refractionIndex: 1.5
    };

    // Projectile State
    this.projectile = {
      velocity: 60,
      angle: 45,
      t: 0,
      path: []
    };

    // Gas Laws States
    this.boyle = {
      volume: 10, // Liters (Piston height)
      temp: 300,  // Kelvin (Fixed)
    };

    this.charles = {
      temp: 300,  // Kelvin
      pressure: 1 // atm (Fixed)
    };

    this.gaylussac = {
      temp: 300,  // Kelvin
      volume: 10  // Liters (Fixed)
    };

    this.init();
  }

  initGasParticles(count) {
    this.gasParticles = [];
    for (let i = 0; i < count; i++) {
      this.gasParticles.push({
        x: Math.random() * 180 + 10,
        y: Math.random() * 180 + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 4,
        color: '#00f2fe'
      });
    }
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.updateControlPanelUI();
    this.startSimulation();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Tab buttons
    document.querySelectorAll('.lab-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lab-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.updateControlPanelUI();
        this.resetSimulation();
      });
    });

    // Control inputs
    const param1 = document.getElementById('lab-param1');
    const param2 = document.getElementById('lab-param2');

    if (param1) {
      param1.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const val1 = document.getElementById('lab-val1');

        if (this.currentMode === 'induction') {
          this.induction.magnetPos = val / 100;
          this.induction.autoOscillate = false;
          if (val1) val1.innerText = Math.round(val) + "%";
          this.updateExtraControlsUI();
        } else if (this.currentMode === 'self_induction') {
          this.selfInd.L_base = val;
          const effL = (val * (this.selfInd.hasCore ? 4.0 : 1.0)).toFixed(2);
          if (val1) val1.innerText = effL + " H";
        } else {
          if (val1) val1.innerText = val;
          if (this.currentMode === 'pendulum') this.pendulum.length = val;
          if (this.currentMode === 'prism') this.prism.lightAngle = val;
          if (this.currentMode === 'projectile') this.projectile.velocity = val;
          if (this.currentMode === 'boyle') this.boyle.volume = val;
          if (this.currentMode === 'charles') this.charles.temp = val;
          if (this.currentMode === 'gaylussac') this.gaylussac.temp = val;
        }
      });
    }

    if (param2) {
      param2.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const val2 = document.getElementById('lab-val2');

        if (this.currentMode === 'induction') {
          this.induction.turns = Math.round(val);
          if (val2) val2.innerText = Math.round(val);
        } else if (this.currentMode === 'self_induction') {
          this.selfInd.voltage = val;
          if (val2) val2.innerText = val + " V";
        } else {
          if (val2) val2.innerText = val;
          if (this.currentMode === 'pendulum') this.pendulum.gravity = val;
          if (this.currentMode === 'prism') this.prism.refractionIndex = val;
          if (this.currentMode === 'projectile') this.projectile.angle = val;
        }
      });
    }

    // Direct Canvas Interaction for Dragging Magnet & Toggling Knife Switch
    const getCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (cx - rect.left) * (this.canvas.width / rect.width),
        y: (cy - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const onPointerDown = (e) => {
      const { x, y } = getCoords(e);
      if (this.currentMode === 'induction') {
        const mw = Math.min(130, this.canvas.width * 0.22);
        const mh = 44;
        const cyCenter = this.canvas.height * 0.52;
        const coilX = this.canvas.width * 0.62;
        const coilW = Math.min(150, this.canvas.width * 0.25);
        const minX = mw / 2 + 25;
        const maxX = coilX + coilW / 2 + 10;
        const curX = minX + this.induction.magnetPos * (maxX - minX);

        if (x >= curX - mw / 2 - 20 && x <= curX + mw / 2 + 20 &&
            y >= cyCenter - mh / 2 - 20 && y <= cyCenter + mh / 2 + 20) {
          this.induction.isDragging = true;
          this.induction.autoOscillate = false;
          this.induction.dragOffset = x - curX;
          this.updateExtraControlsUI();
        }
      } else if (this.currentMode === 'self_induction') {
        // Knife switch coordinates
        const swX = this.canvas.width * 0.28;
        const swY = this.canvas.height * 0.22;
        if (Math.hypot(x - swX, y - swY) < 55) {
          this.toggleKnifeSwitch();
        }
      }
    };

    const onPointerMove = (e) => {
      if (this.currentMode === 'induction' && this.induction.isDragging) {
        const { x } = getCoords(e);
        const mw = Math.min(130, this.canvas.width * 0.22);
        const coilX = this.canvas.width * 0.62;
        const coilW = Math.min(150, this.canvas.width * 0.25);
        const minX = mw / 2 + 25;
        const maxX = coilX + coilW / 2 + 10;

        const targetX = x - (this.induction.dragOffset || 0);
        const normPos = Math.max(0, Math.min(1, (targetX - minX) / (maxX - minX)));
        this.induction.magnetPos = normPos;

        const slider = document.getElementById('lab-param1');
        if (slider) slider.value = Math.round(normPos * 100);
        const val1 = document.getElementById('lab-val1');
        if (val1) val1.innerText = Math.round(normPos * 100) + "%";
      }
    };

    const onPointerUp = () => {
      if (this.currentMode === 'induction') {
        this.induction.isDragging = false;
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  toggleKnifeSwitch() {
    const wasClosed = this.selfInd.switchClosed;
    this.selfInd.switchClosed = !wasClosed;
    this.selfInd.tSwitch = 0;

    if (wasClosed && !this.selfInd.switchClosed) {
      if (this.selfInd.i2 > 0.05) {
        this.selfInd.sparkIntensity = 1.0;
        this.selfInd.neonFlash = 1.0;
      }
    }
    this.updateExtraControlsUI();
  }

  updateExtraControlsUI() {
    const container = document.getElementById('lab-extra-controls');
    if (!container) return;
    container.innerHTML = '';

    if (this.currentMode === 'induction') {
      // 1. Flip Poles Button
      const flipBtn = document.createElement('button');
      flipBtn.className = 'lab-action-btn';
      flipBtn.innerHTML = `🔄 បញ្ច្រាសប៉ូល (${this.induction.magnetPoleNRight ? "N ស្តាំ" : "S ស្តាំ"})`;
      flipBtn.title = "ប្ដូរប៉ូលមេដែកដែលចូលជិតរបុំ";
      flipBtn.onclick = () => {
        this.induction.magnetPoleNRight = !this.induction.magnetPoleNRight;
        this.updateExtraControlsUI();
      };
      container.appendChild(flipBtn);

      // 2. Auto-Oscillate Button
      const oscBtn = document.createElement('button');
      oscBtn.className = 'lab-action-btn' + (this.induction.autoOscillate ? ' active' : '');
      oscBtn.innerHTML = `⏯️ លំយោល (${this.induction.autoOscillate ? "កំពុងរំកិល" : "ផ្អាក"})`;
      oscBtn.title = "ចលនារំកិលមេដែកស្វ័យប្រវត្តិ";
      oscBtn.onclick = () => {
        this.induction.autoOscillate = !this.induction.autoOscillate;
        this.updateExtraControlsUI();
      };
      container.appendChild(oscBtn);

      // 3. Quick Thrust Button
      const thrustBtn = document.createElement('button');
      thrustBtn.className = 'lab-action-btn';
      thrustBtn.innerHTML = '⚡ រុញចូល / ដកចេញ';
      thrustBtn.title = "រុញមេដែកចូលក្នុងរបុំយ៉ាងរហ័ស";
      thrustBtn.onclick = () => {
        this.induction.autoOscillate = false;
        let t = 0;
        const initial = this.induction.magnetPos;
        const target = initial < 0.5 ? 0.85 : 0.15;
        const thrustInterval = setInterval(() => {
          t += 0.1;
          this.induction.magnetPos = initial + (target - initial) * Math.sin(t * Math.PI * 0.5);
          if (t >= 1.0) {
            this.induction.magnetPos = target;
            clearInterval(thrustInterval);
          }
          const slider = document.getElementById('lab-param1');
          if (slider) slider.value = Math.round(this.induction.magnetPos * 100);
          const val1 = document.getElementById('lab-val1');
          if (val1) val1.innerText = Math.round(this.induction.magnetPos * 100) + "%";
        }, 20);
        this.updateExtraControlsUI();
      };
      container.appendChild(thrustBtn);

    } else if (this.currentMode === 'self_induction') {
      // 1. Knife Switch Toggle Button
      const swBtn = document.createElement('button');
      swBtn.className = 'lab-action-btn' + (this.selfInd.switchClosed ? ' active' : '');
      swBtn.innerHTML = `🔌 ${this.selfInd.switchClosed ? "បើកកុងតាក់ (Open K)" : "បិទកុងតាក់ (Close K)"}`;
      swBtn.title = "ចុចដើម្បីបិទ ឬបើកកុងតាក់កាំបិត K";
      swBtn.onclick = () => this.toggleKnifeSwitch();
      container.appendChild(swBtn);

      // 2. Iron Core Toggle Button
      const coreBtn = document.createElement('button');
      coreBtn.className = 'lab-action-btn' + (this.selfInd.hasCore ? ' active' : '');
      coreBtn.innerHTML = `🧲 ${this.selfInd.hasCore ? "ដកស្នូលដែកចេញ" : "ដាក់ស្នូលដែក (Core x4)"}`;
      coreBtn.title = "បន្ថែមស្នូលដែកដើម្បីបង្កើនអាំងឌុចតង់បូប៊ីន";
      coreBtn.onclick = () => {
        this.selfInd.hasCore = !this.selfInd.hasCore;
        this.updateControlPanelUI();
      };
      container.appendChild(coreBtn);

      // 3. Clear Trace Button
      const resetTraceBtn = document.createElement('button');
      resetTraceBtn.className = 'lab-action-btn';
      resetTraceBtn.innerHTML = '🔄 សម្អាតក្រាហ្វ';
      resetTraceBtn.title = "សម្អាតខ្សែកោងអូស៊ីឡូស្កុប";
      resetTraceBtn.onclick = () => {
        this.selfInd.history = [];
      };
      container.appendChild(resetTraceBtn);
    }
  }

  updateControlPanelUI() {
    const label1 = document.getElementById('lab-label1');
    const label2 = document.getElementById('lab-label2');
    const param1 = document.getElementById('lab-param1');
    const param2 = document.getElementById('lab-param2');
    if (!label1 || !label2 || !param1 || !param2) return;
    const group2 = param2.parentElement;

    group2.style.display = 'flex'; // Default show param2
    this.updateExtraControlsUI();

    if (this.currentMode === 'induction') {
      label1.innerHTML = "ទីតាំងមេដែក (\\(x\\)): <span id='lab-val1'>" + Math.round(this.induction.magnetPos * 100) + "%</span>";
      param1.min = 0; param1.max = 100; param1.step = 1; param1.value = Math.round(this.induction.magnetPos * 100);

      label2.innerHTML = "ចំនួនរង្វាយរបុំ (\\(N\\)): <span id='lab-val2'>" + this.induction.turns + "</span>";
      param2.min = 50; param2.max = 500; param2.step = 25; param2.value = this.induction.turns;
    } else if (this.currentMode === 'self_induction') {
      const effL = (this.selfInd.L_base * (this.selfInd.hasCore ? 4.0 : 1.0)).toFixed(2);
      label1.innerHTML = "អាំងឌុចតង់បូប៊ីន (\\(L\\)): <span id='lab-val1'>" + effL + " H</span>";
      param1.min = 0.2; param1.max = 2.5; param1.step = 0.1; param1.value = this.selfInd.L_base;

      label2.innerHTML = "តង់ស្យុងប្រភព (\\(E\\)): <span id='lab-val2'>" + this.selfInd.voltage + " V</span>";
      param2.min = 6; param2.max = 24; param2.step = 1; param2.value = this.selfInd.voltage;
    } else if (this.currentMode === 'boyle') {
      label1.innerHTML = "កែប្រែមាឌ ពីស្តុង (\\(V\\)): <span id='lab-val1'>" + this.boyle.volume + " L</span>";
      param1.min = 4; param1.max = 16; param1.step = 0.5; param1.value = this.boyle.volume;
      group2.style.display = 'none'; // Only 1 slider for T = const
    } else if (this.currentMode === 'charles') {
      label1.innerHTML = "កែប្រែកម្ដៅ (\\(T\\)): <span id='lab-val1'>" + this.charles.temp + " K</span>";
      param1.min = 150; param1.max = 600; param1.step = 10; param1.value = this.charles.temp;
      group2.style.display = 'none'; // Only 1 slider for P = const
    } else if (this.currentMode === 'gaylussac') {
      label1.innerHTML = "កែប្រែកម្ដៅ (\\(T\\)): <span id='lab-val1'>" + this.gaylussac.temp + " K</span>";
      param1.min = 150; param1.max = 600; param1.step = 10; param1.value = this.gaylussac.temp;
      group2.style.display = 'none'; // Only 1 slider for V = const
    } else if (this.currentMode === 'pendulum') {
      label1.innerHTML = "ប្រវែងខ្សែ (\\(L\\)): <span id='lab-val1'>" + this.pendulum.length + " cm</span>";
      param1.min = 80; param1.max = 240; param1.step = 1; param1.value = this.pendulum.length;

      label2.innerHTML = "សំទុះទាញ (\\(g\\)): <span id='lab-val2'>" + this.pendulum.gravity + " m/s²</span>";
      param2.min = 1.6; param2.max = 20; param2.value = this.pendulum.gravity; param2.step = 0.1;
    } else if (this.currentMode === 'prism') {
      label1.innerHTML = "មុំចាំងចូល (\\(i\\)): <span id='lab-val1'>" + this.prism.lightAngle + "°</span>";
      param1.min = 10; param1.max = 50; param1.step = 1; param1.value = this.prism.lightAngle;

      label2.innerHTML = "សូចនាករបាក់ (\\(n\\)): <span id='lab-val2'>" + this.prism.refractionIndex + "</span>";
      param2.min = 1.1; param2.max = 2.4; param2.value = this.prism.refractionIndex; param2.step = 0.05;
    } else if (this.currentMode === 'projectile') {
      label1.innerHTML = "ល្បឿនដើម (\\(v_0\\)): <span id='lab-val1'>" + this.projectile.velocity + " m/s</span>";
      param1.min = 30; param1.max = 100; param1.step = 1; param1.value = this.projectile.velocity;

      label2.innerHTML = "មុំបោះ (\\(\\theta\\)): <span id='lab-val2'>" + this.projectile.angle + "°</span>";
      param2.min = 15; param2.max = 85; param2.value = this.projectile.angle; param2.step = 1;
    }

    if (window.renderMathInElement) {
      renderMathInElement(document.querySelector('.lab-controls'));
      renderMathInElement(document.querySelector('.telemetry-box'));
    }
  }

  resetSimulation() {
    this.time = 0;
    if (this.currentMode === 'induction') {
      this.induction.magnetPos = 0.35;
      this.induction.autoOscillate = true;
      this.induction.smoothedEMF = 0;
      this.induction.galvanometerAngle = 0;
    } else if (this.currentMode === 'self_induction') {
      this.selfInd.switchClosed = false;
      this.selfInd.switchAnim = 1.0;
      this.selfInd.tSwitch = 0;
      this.selfInd.i1 = 0;
      this.selfInd.i2 = 0;
      this.selfInd.history = [];
      this.selfInd.sparkIntensity = 0;
      this.selfInd.neonFlash = 0;
    } else if (this.currentMode === 'pendulum') {
      this.pendulum.angle = Math.PI / 4;
      this.pendulum.angularVelocity = 0;
    } else if (this.currentMode === 'projectile') {
      this.projectile.t = 0;
      this.projectile.path = [];
    }
  }

  startSimulation() {
    const render = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.currentMode === 'induction') this.drawInduction();
      else if (this.currentMode === 'self_induction') this.drawSelfInduction();
      else if (this.currentMode === 'boyle') this.drawBoyle();
      else if (this.currentMode === 'charles') this.drawCharles();
      else if (this.currentMode === 'gaylussac') this.drawGayLussac();
      else if (this.currentMode === 'pendulum') this.drawPendulum();
      else if (this.currentMode === 'prism') this.drawPrism();
      else if (this.currentMode === 'projectile') this.drawProjectile();

      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  // --- GAS LAWS SIMULATIONS ---

  // 1. Boyle's Law: T = const => P * V = const (P = k / V)
  drawBoyle() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const V = this.boyle.volume; // 4L to 16L
    const P = (100 / V).toFixed(2); // atm (Pressure inversely proportional to Volume)

    const boxWidth = 260;
    const boxLeft = (width - boxWidth) / 2;
    const boxBottom = height - 60;
    const pistonHeight = V * 16; // dynamic height
    const boxTop = boxBottom - pistonHeight;

    // Cylinder Walls
    this.ctx.strokeStyle = '#4facfe';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(boxLeft, boxBottom - 260);
    this.ctx.lineTo(boxLeft, boxBottom);
    this.ctx.lineTo(boxLeft + boxWidth, boxBottom);
    this.ctx.lineTo(boxLeft + boxWidth, boxBottom - 260);
    this.ctx.stroke();

    // Metallic Piston Cap
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(boxLeft + 4, boxTop - 15, boxWidth - 8, 15);
    
    // Piston Handle Rod
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(boxLeft + boxWidth / 2 - 8, boxTop - 90, 16, 75);

    // Update and draw Gas Particles inside volume bounds
    this.updateAndDrawGasParticles(boxLeft + 10, boxTop + 10, boxWidth - 20, boxBottom - boxTop - 20, 1.0);

    // Pressure Gauge Readout on right
    this.drawGauge(width - 90, 100, P, 0, 25, "P (atm)", '#00f2fe');

    // Telemetry UI
    const constantVal = (P * V).toFixed(1);
    document.getElementById('tel-1').innerText = P + " atm";
    document.getElementById('tel-2').innerText = constantVal + " atm·L";
    document.getElementById('tel-label1').innerHTML = "សម្ពាធ (\\(P = \\frac{k}{V}\\)):";
    document.getElementById('tel-label2').innerHTML = "ថេរច្បាប់ប៊យ (\\(P \\cdot V\\)):";
  }

  // 2. Charles's Law: P = const => V / T = const (V = c * T)
  drawCharles() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const T = this.charles.temp; // 150K to 600K
    const V = (T / 30).toFixed(1); // Volume expands linearly with Temp (5L to 20L)

    const boxWidth = 260;
    const boxLeft = (width - boxWidth) / 2;
    const boxBottom = height - 80;
    const pistonHeight = V * 12;
    const boxTop = boxBottom - pistonHeight;

    // Draw Flame Heater under Cylinder
    this.drawFlame(boxLeft + boxWidth / 2, boxBottom + 25, (T - 150) / 450);

    // Cylinder Walls
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(boxLeft, boxBottom - 260);
    this.ctx.lineTo(boxLeft, boxBottom);
    this.ctx.lineTo(boxLeft + boxWidth, boxBottom);
    this.ctx.lineTo(boxLeft + boxWidth, boxBottom - 260);
    this.ctx.stroke();

    // Piston Cap (Piston moves UP as Temperature rises)
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(boxLeft + 4, boxTop - 15, boxWidth - 8, 15);

    // Gas Particle Speed increases with Temperature
    const speedFactor = Math.sqrt(T / 300);
    this.updateAndDrawGasParticles(boxLeft + 10, boxTop + 10, boxWidth - 20, boxBottom - boxTop - 20, speedFactor);

    // Thermometer Readout
    this.drawThermometer(80, 80, T, 150, 600);

    // Telemetry UI
    const ratio = (V / T).toFixed(4);
    document.getElementById('tel-1').innerText = V + " L";
    document.getElementById('tel-2').innerText = ratio + " L/K";
    document.getElementById('tel-label1').innerHTML = "មាឌឧស្ម័ន (\\(V = c \\cdot T\\)):";
    document.getElementById('tel-label2').innerHTML = "ថេរច្បាប់សាល (\\(\\frac{V}{T}\\)):";
  }

  // 3. Gay-Lussac's Law: V = const => P / T = const (P = c * T)
  drawGayLussac() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const T = this.gaylussac.temp; // 150K to 600K
    const P = (T / 150).toFixed(2); // Pressure increases linearly with Temp (1 atm to 4 atm)

    const boxWidth = 260;
    const boxLeft = (width - boxWidth) / 2;
    const boxBottom = height - 80;
    const boxTop = boxBottom - 160; // FIXED VOLUME (Rigid Container)

    // Draw Flame Heater under Container
    this.drawFlame(boxLeft + boxWidth / 2, boxBottom + 25, (T - 150) / 450);

    // Rigid Closed Container
    this.ctx.strokeStyle = '#ec4899';
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(boxLeft, boxTop, boxWidth, 160);

    // Gas Particle Speed & Kinetic Collision increases with T
    const speedFactor = Math.sqrt(T / 250);
    this.updateAndDrawGasParticles(boxLeft + 10, boxTop + 10, boxWidth - 20, 140, speedFactor);

    // Pressure Gauge Readout on right
    this.drawGauge(width - 90, 100, P, 0, 5, "P (atm)", '#ec4899');
    
    // Thermometer Readout on left
    this.drawThermometer(80, 80, T, 150, 600);

    // Telemetry UI
    const ratio = (P / T).toFixed(5);
    document.getElementById('tel-1').innerText = P + " atm";
    document.getElementById('tel-2').innerText = ratio + " atm/K";
    document.getElementById('tel-label1').innerHTML = "សម្ពាធ (\\(P = c \\cdot T\\)):";
    document.getElementById('tel-label2').innerHTML = "ថេរច្បាប់កេលុយសាក់ (\\(\\frac{P}{T}\\)):";
  }

  // Helper: Draw Gas Particles inside boundary
  updateAndDrawGasParticles(minX, minY, w, h, speedMult) {
    this.gasParticles.forEach(p => {
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;

      if (p.x <= minX || p.x >= minX + w) p.vx *= -1;
      if (p.y <= minY || p.y >= minY + h) p.vy *= -1;

      // Keep within bounds
      if (p.x < minX) p.x = minX + 2;
      if (p.x > minX + w) p.x = minX + w - 2;
      if (p.y < minY) p.y = minY + 2;
      if (p.y > minY + h) p.y = minY + h - 2;

      this.ctx.fillStyle = speedMult > 1.2 ? '#ec4899' : '#00f2fe';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  // Helper: Draw Pressure Gauge
  drawGauge(cx, cy, val, minVal, maxVal, labelText, color) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.fill();
    this.ctx.stroke();

    // Gauge Needle
    const percent = Math.min(Math.max((val - minVal) / (maxVal - minVal), 0), 1);
    const angle = Math.PI * 0.75 + percent * Math.PI * 1.5;
    const nx = cx + 32 * Math.cos(angle);
    const ny = cy + 32 * Math.sin(angle);

    this.ctx.strokeStyle = '#ff4757';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(nx, ny);
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Outfit';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(labelText, cx, cy + 24);
    this.ctx.restore();
  }

  // Helper: Draw Thermometer
  drawThermometer(x, y, tempK, minT, maxT) {
    const percent = (tempK - minT) / (maxT - minT);
    const fillH = percent * 100;

    this.ctx.save();
    // Glass tube
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x, y, 16, 120);
    this.ctx.strokeRect(x, y, 16, 120);

    // Mercury Bulb
    this.ctx.fillStyle = '#ff4757';
    this.ctx.beginPath();
    this.ctx.arc(x + 8, y + 130, 16, 0, Math.PI * 2);
    this.ctx.fill();

    // Mercury Level
    this.ctx.fillRect(x + 3, y + 120 - fillH, 10, fillH);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Kantumruy Pro';
    this.ctx.fillText(tempK + " K", x - 10, y - 10);
    this.ctx.restore();
  }

  // Helper: Draw Flame
  drawFlame(cx, cy, intensity) {
    if (intensity <= 0.05) return;
    this.ctx.save();
    const h = 20 + intensity * 35;

    const grad = this.ctx.createLinearGradient(cx, cy, cx, cy - h);
    grad.addColorStop(0, '#ff4757');
    grad.addColorStop(0.5, '#ffa500');
    grad.addColorStop(1, '#ffff00');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 20, cy);
    this.ctx.quadraticCurveTo(cx - 10, cy - h / 2, cx, cy - h);
    this.ctx.quadraticCurveTo(cx + 10, cy - h / 2, cx + 20, cy);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // --- MECHANICS & OPTICS SIMULATIONS ---

  drawPendulum() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const pivotX = width / 2;
    const pivotY = 50;

    const g = this.pendulum.gravity * 0.05;
    const L = this.pendulum.length;

    this.pendulum.angularAcceleration = (-1 * g / L) * Math.sin(this.pendulum.angle);
    this.pendulum.angularVelocity += this.pendulum.angularAcceleration;
    this.pendulum.angularVelocity *= this.pendulum.damping;
    this.pendulum.angle += this.pendulum.angularVelocity;

    const bobX = pivotX + L * Math.sin(this.pendulum.angle);
    const bobY = pivotY + L * Math.cos(this.pendulum.angle);

    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(pivotX - 60, pivotY);
    this.ctx.lineTo(pivotX + 60, pivotY);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#00f2fe';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(pivotX, pivotY);
    this.ctx.lineTo(bobX, bobY);
    this.ctx.stroke();

    const glow = this.ctx.createRadialGradient(bobX, bobY, 2, bobX, bobY, 24);
    glow.addColorStop(0, 'rgba(0, 242, 254, 1)');
    glow.addColorStop(1, 'rgba(0, 242, 254, 0)');
    
    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(bobX, bobY, 24, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
    this.ctx.fill();

    const period = (2 * Math.PI * Math.sqrt(this.pendulum.length / (this.pendulum.gravity * 10))).toFixed(2);
    const freq = (1 / period).toFixed(2);

    document.getElementById('tel-1').innerText = period + " s";
    document.getElementById('tel-2').innerText = freq + " Hz";
    document.getElementById('tel-label1').innerHTML = "ខួប (\\(T = 2\\pi\\sqrt{\\frac{L}{g}}\\)):";
    document.getElementById('tel-label2').innerHTML = "ប្រេកង់ (\\(f = \\frac{1}{T}\\)):";
  }

  drawPrism() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2 + 20;
    const size = 180;

    const p1 = { x: cx, y: cy - size / 1.2 };
    const p2 = { x: cx - size, y: cy + size / 1.8 };
    const p3 = { x: cx + size, y: cy + size / 1.8 };

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.strokeStyle = '#4facfe';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    const entryY = cy + 20;
    const angleOffset = (this.prism.lightAngle - 30) * 2;
    const startX = 40;
    const startY = cy + angleOffset;
    const entryX = cx - size * 0.5;

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(entryX, entryY);
    this.ctx.stroke();

    const spectrumColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    const exitX = cx + size * 0.5;

    spectrumColors.forEach((color, index) => {
      const spread = index * 4 * (this.prism.refractionIndex / 1.5);
      const exitY = entryY + spread - 10;
      const targetX = width - 40;
      const targetY = exitY + (index * 8) + 20;

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(entryX, entryY);
      this.ctx.lineTo(exitX, exitY);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(exitX, exitY);
      this.ctx.lineTo(targetX, targetY);
      this.ctx.stroke();
    });

    const n = this.prism.refractionIndex;
    const devAngle = ((n - 1) * 60).toFixed(1);

    document.getElementById('tel-1').innerText = n.toFixed(2);
    document.getElementById('tel-2').innerText = devAngle + "°";
    document.getElementById('tel-label1').innerHTML = "សូចនាករបាក់ (\\(n = \\frac{\\sin i}{\\sin r}\\)):";
    document.getElementById('tel-label2').innerHTML = "មុំវៀង (\\(D = (n-1)A\\)):";
  }

  drawProjectile() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const originX = 60;
    const originY = height - 50;

    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(20, originY);
    this.ctx.lineTo(width - 20, originY);
    this.ctx.stroke();

    const rad = (this.projectile.angle * Math.PI) / 180;
    const v0 = this.projectile.velocity;
    const g = 9.8;

    const R = (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;
    const H = (Math.pow(v0, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);

    const scaleX = (width - 120) / 1000;
    const scaleY = (height - 100) / 400;

    this.projectile.t += 0.15;
    const t = this.projectile.t;

    const posX = v0 * Math.cos(rad) * t;
    const posY = v0 * Math.sin(rad) * t - 0.5 * g * Math.pow(t, 2);

    if (posY >= 0) {
      this.projectile.path.push({ x: originX + posX * scaleX * 8, y: originY - posY * scaleY * 8 });
    } else if (this.projectile.path.length > 0) {
      setTimeout(() => {
        this.projectile.t = 0;
        this.projectile.path = [];
      }, 1000);
    }

    if (this.projectile.path.length > 1) {
      this.ctx.strokeStyle = '#00f2fe';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(this.projectile.path[0].x, this.projectile.path[0].y);
      for (let i = 1; i < this.projectile.path.length; i++) {
        this.ctx.lineTo(this.projectile.path[i].x, this.projectile.path[i].y);
      }
      this.ctx.stroke();
    }

    if (this.projectile.path.length > 0) {
      const currentPos = this.projectile.path[this.projectile.path.length - 1];
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    document.getElementById('tel-1').innerText = R.toFixed(1) + " m";
    document.getElementById('tel-2').innerText = H.toFixed(1) + " m";
    document.getElementById('tel-label1').innerHTML = "ចម្ងាយបោះសរុប (\\(R = \\frac{v_0^2 \\sin 2\\theta}{g}\\)):";
    document.getElementById('tel-label2').innerHTML = "កម្ពស់អតិបរមា (\\(H = \\frac{v_0^2 \\sin^2\\theta}{2g}\\)):";
  }

  // =========================================================================
  // --- ELECTRICITY & MAGNETISM SIMULATIONS ---
  // =========================================================================

  // 1. Electromagnetic Induction (Faraday's Law & Lenz's Law)
  // e = -N * (dPhi / dt)
  drawInduction() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    const cy = height * 0.54;
    const coilX = width * 0.63;
    const coilW = Math.min(150, width * 0.25);
    const coilH = 86;
    const mw = Math.min(130, width * 0.22);
    const mh = 42;

    const minX = mw / 2 + 25;
    const maxX = coilX + coilW / 2 + 10;

    // Auto-oscillation when not dragging
    if (this.induction.autoOscillate && !this.induction.isDragging) {
      this.induction.oscAngle += 0.038 * this.induction.oscSpeed;
      this.induction.magnetPos = 0.38 + 0.32 * Math.sin(this.induction.oscAngle);
      const slider = document.getElementById('lab-param1');
      if (slider) slider.value = Math.round(this.induction.magnetPos * 100);
      const val1 = document.getElementById('lab-val1');
      if (val1) val1.innerText = Math.round(this.induction.magnetPos * 100) + "%";
    }

    const magnetX = minX + this.induction.magnetPos * (maxX - minX);

    // Compute velocity dx / dt
    const now = performance.now();
    const dt = Math.max((now - this.induction.lastTime) / 1000, 0.008);
    const dx = magnetX - this.induction.lastX;
    const vx = dx / dt; // px/sec
    this.induction.lastX = magnetX;
    this.induction.lastTime = now;
    this.induction.magnetSpeed = vx;

    // Physics calculations
    const poleOffset = this.induction.magnetPoleNRight ? (mw / 2) : (-mw / 2);
    const frontPoleX = magnetX + poleOffset;
    const dist = (frontPoleX - coilX) / 65; // normalized distance to coil center
    const poleSign = this.induction.magnetPoleNRight ? 1 : -1;

    // Magnetic field along solenoid axis: B(u)
    const B0 = 0.85; // Tesla
    const B = (B0 / Math.pow(1 + dist * dist, 1.5)) * poleSign;
    const flux_mWb = B * 0.04 * 1000;
    this.induction.flux = flux_mWb;

    // Faraday's Law: e = -N * (dPhi / dt)
    const dB_du = -3 * dist * Math.pow(1 + dist * dist, -2.5) * B0 * poleSign;
    const du_dt = vx / 65;
    const dPhi_dt = dB_du * du_dt * 0.04;
    const rawEMF = - (this.induction.turns) * dPhi_dt;

    // Smooth response
    this.induction.smoothedEMF += (rawEMF - this.induction.smoothedEMF) * 0.22;
    const emf = this.induction.smoothedEMF;
    const R_circuit = 12; // Ohms
    const current_mA = (emf / R_circuit) * 1000;
    this.induction.current = current_mA;

    // Galvanometer needle angle
    const targetAngle = Math.max(-Math.PI * 0.36, Math.min(Math.PI * 0.36, (current_mA / 70) * (Math.PI * 0.36)));
    this.induction.galvanometerAngle += (targetAngle - this.induction.galvanometerAngle) * 0.18;

    // Light bulb glow
    const bulbPower = Math.pow(current_mA / 50, 2);
    this.induction.bulbBrightness = Math.min(1.0, bulbPower);

    // DRAW COMPONENTS
    const meterX = width * 0.60;
    const meterY = 88;
    const bulbX = Math.min(width - 55, width * 0.86);
    const bulbY = 88;

    // 1. Magnetic Field Lines
    this.drawMagneticFieldLines(magnetX, cy, mw, mh, poleSign, dist);

    // 2. Circuit Wires & Flowing Current Particles
    this.drawInductionCircuitWires(coilX, coilW, coilH, cy, meterX, meterY, bulbX, bulbY, current_mA);

    // 3. Zero-Center Galvanometer
    this.drawGalvanometer(meterX, meterY, this.induction.galvanometerAngle, current_mA);

    // 4. Light Bulb
    this.drawBulb(bulbX, bulbY, this.induction.bulbBrightness);

    // 5. Solenoid / Coil Apparatus
    this.drawSolenoid(coilX, cy, coilW, coilH, this.induction.turns, current_mA, poleSign, dist);

    // 6. Bar Magnet
    this.drawBarMagnet(magnetX, cy, mw, mh, this.induction.magnetPoleNRight, this.induction.isDragging);

    // 7. Explanatory Banner & Lenz's Law Status
    this.drawInductionBanner(width, height, vx, poleSign, emf, current_mA);

    // Telemetry updates
    const tel1 = document.getElementById('tel-1');
    const tel2 = document.getElementById('tel-2');
    if (tel1 && tel2) {
      tel1.innerText = Math.abs(flux_mWb).toFixed(2) + " mWb";
      tel2.innerText = (emf >= 0 ? "+" : "") + emf.toFixed(2) + " V (" + (current_mA >= 0 ? "+" : "") + current_mA.toFixed(1) + " mA)";
    }
  }

  drawBarMagnet(x, y, w, h, poleNRight, isDragging) {
    const ctx = this.ctx;
    ctx.save();

    // Subtle drop shadow / glow
    if (isDragging) {
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
    }

    const rx = x - w / 2;
    const ry = y - h / 2;
    const halfW = w / 2;
    const r = 6;

    // Left Half
    const leftColor = poleNRight ? '#2563eb' : '#dc2626'; // Blue S or Red N
    const leftText = poleNRight ? 'S' : 'N';
    const leftGrad = ctx.createLinearGradient(rx, ry, rx, ry + h);
    leftGrad.addColorStop(0, poleNRight ? '#3b82f6' : '#ef4444');
    leftGrad.addColorStop(1, leftColor);

    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + halfW, ry);
    ctx.lineTo(rx + halfW, ry + h);
    ctx.lineTo(rx + r, ry + h);
    ctx.arcTo(rx, ry + h, rx, ry + h - r, r);
    ctx.lineTo(rx, ry + r);
    ctx.arcTo(rx, ry, rx + r, ry, r);
    ctx.closePath();
    ctx.fill();

    // Right Half
    const rightColor = poleNRight ? '#dc2626' : '#2563eb'; // Red N or Blue S
    const rightText = poleNRight ? 'N' : 'S';
    const rightGrad = ctx.createLinearGradient(rx + halfW, ry, rx + halfW, ry + h);
    rightGrad.addColorStop(0, poleNRight ? '#ef4444' : '#3b82f6');
    rightGrad.addColorStop(1, rightColor);

    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(rx + halfW, ry);
    ctx.lineTo(rx + w - r, ry);
    ctx.arcTo(rx + w, ry, rx + w, ry + r, r);
    ctx.lineTo(rx + w, ry + h - r);
    ctx.arcTo(rx + w, ry + h, rx + w - r, ry + h, r);
    ctx.lineTo(rx + halfW, ry + h);
    ctx.closePath();
    ctx.fill();

    // Specular highlight gloss
    ctx.shadowColor = 'transparent';
    const gloss = ctx.createLinearGradient(rx, ry, rx, ry + h * 0.45);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(rx + 2, ry + 2, w - 4, h * 0.42);

    // Center divider
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx + halfW, ry);
    ctx.lineTo(rx + halfW, ry + h);
    ctx.stroke();

    // Pole Letters
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(leftText, rx + halfW * 0.5, y + 1);
    ctx.fillText(rightText, rx + halfW * 1.5, y + 1);

    // Drag Handle Badge above magnet
    ctx.font = '11px Kantumruy Pro, sans-serif';
    ctx.fillStyle = isDragging ? '#00f2fe' : 'rgba(255, 255, 255, 0.65)';
    ctx.fillText("✋ អូសមេដែក (Drag)", x, ry - 12);

    ctx.restore();
  }

  drawMagneticFieldLines(mx, my, mw, mh, poleSign, dist) {
    const ctx = this.ctx;
    ctx.save();

    const nX = poleSign > 0 ? (mx + mw / 2) : (mx - mw / 2);
    const sX = poleSign > 0 ? (mx - mw / 2) : (mx + mw / 2);
    const dir = poleSign > 0 ? 1 : -1;

    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -(performance.now() * 0.02 * dir);

    // Loop over 4 pairs of magnetic field arches
    const arches = [28, 55, 95, 140];
    arches.forEach((spread, idx) => {
      ctx.strokeStyle = idx < 2 ? 'rgba(0, 242, 254, 0.45)' : 'rgba(56, 189, 248, 0.2)';

      // Upper arch
      ctx.beginPath();
      ctx.moveTo(nX, my - 6);
      ctx.bezierCurveTo(nX + dir * spread * 0.9, my - spread, sX - dir * spread * 0.9, my - spread, sX, my - 6);
      ctx.stroke();

      // Lower arch
      ctx.beginPath();
      ctx.moveTo(nX, my + 6);
      ctx.bezierCurveTo(nX + dir * spread * 0.9, my + spread, sX - dir * spread * 0.9, my + spread, sX, my + 6);
      ctx.stroke();
    });

    ctx.restore();
  }

  drawSolenoid(cx, cy, cw, ch, turns, current_mA, poleSign, dist) {
    const ctx = this.ctx;
    ctx.save();

    const xLeft = cx - cw / 2;
    const xRight = cx + cw / 2;
    const yTop = cy - ch / 2;
    const yBottom = cy + ch / 2;

    // 1. Acrylic cylinder core support
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(xLeft, yTop, cw, ch);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xLeft, yTop, cw, ch);

    // Cylinder end caps
    ctx.fillStyle = '#334155';
    ctx.fillRect(xLeft - 6, yTop - 6, 8, ch + 12);
    ctx.fillRect(xRight - 2, yTop - 6, 8, ch + 12);

    // Stand legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(xLeft + 12, yBottom, 8, 35);
    ctx.fillRect(xRight - 20, yBottom, 8, 35);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(xLeft, yBottom + 35, cw, 6);

    // 2. Wire Windings (Helical Coils)
    const numLoops = 10;
    const loopSpacing = cw / numLoops;
    const isCurrentActive = Math.abs(current_mA) > 0.8;
    const wireColor = isCurrentActive ? '#f97316' : '#d97706';
    const wireGlow = isCurrentActive ? '#ffedd5' : '#fbbf24';

    for (let i = 0; i < numLoops; i++) {
      const lx = xLeft + i * loopSpacing + loopSpacing * 0.5;

      // Back half of loop (darker)
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(lx, cy, loopSpacing * 0.45, ch * 0.48, 0, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();

      // Front half of loop (brighter with metallic sheen)
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.ellipse(lx, cy, loopSpacing * 0.45, ch * 0.48, 0, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();

      // Highlight line
      ctx.strokeStyle = wireGlow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(lx, cy, loopSpacing * 0.4, ch * 0.46, 0, Math.PI * 1.6, Math.PI * 0.4);
      ctx.stroke();

      // Direction Arrows on Front Loops (Lenz's Law Current Flow)
      if (isCurrentActive && i % 2 === 0) {
        const arrowDir = current_mA > 0 ? 1 : -1;
        const ay = cy + (arrowDir > 0 ? 8 : -8);
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.moveTo(lx + 6, ay);
        ctx.lineTo(lx - 4, ay - 4 * arrowDir);
        ctx.lineTo(lx - 4, ay + 4 * arrowDir);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Solenoid Turn Label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Kantumruy Pro, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`របុំខ្សែ (N = ${turns} រង្វាយ)`, cx, yBottom + 24);

    // Lenz's Law Induced Pole Face Badge
    if (isCurrentActive && Math.abs(dist) < 2.5) {
      const inducedPoleOnLeft = (current_mA * poleSign > 0) ? "N" : "S";
      const badgeColor = inducedPoleOnLeft === "N" ? "#ef4444" : "#3b82f6";

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(xLeft - 38, cy - 14, 28, 28, 4);
      } else {
        ctx.rect(xLeft - 38, cy - 14, 28, 28);
      }
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Outfit';
      ctx.fillText(inducedPoleOnLeft, xLeft - 24, cy + 5);
      ctx.font = '10px Kantumruy Pro';
      ctx.fillStyle = badgeColor;
      ctx.fillText("ប៉ូលអាំងឌ្វី", xLeft - 24, cy - 18);
    }

    ctx.restore();
  }

  drawInductionCircuitWires(coilX, coilW, coilH, cy, meterX, meterY, bulbX, bulbY, current_mA) {
    const ctx = this.ctx;
    ctx.save();

    const t1X = coilX - coilW / 2 + 10;
    const t1Y = cy - coilH / 2;
    const t2X = coilX + coilW / 2 - 10;
    const t2Y = cy + coilH / 2;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Path 1: Coil Top -> Meter Left
    ctx.beginPath();
    ctx.moveTo(t1X, t1Y);
    ctx.lineTo(t1X, meterY);
    ctx.lineTo(meterX - 35, meterY);
    ctx.stroke();

    // Path 2: Meter Right -> Bulb Left
    ctx.beginPath();
    ctx.moveTo(meterX + 35, meterY);
    ctx.lineTo(bulbX - 22, bulbY);
    ctx.stroke();

    // Path 3: Bulb Right -> Return down and under to Coil Bottom
    ctx.beginPath();
    ctx.moveTo(bulbX + 22, bulbY);
    ctx.lineTo(bulbX + 45, bulbY);
    ctx.lineTo(bulbX + 45, cy + coilH / 2 + 25);
    ctx.lineTo(t2X, cy + coilH / 2 + 25);
    ctx.lineTo(t2X, t2Y);
    ctx.stroke();

    // Animated electron flow dots
    if (Math.abs(current_mA) > 0.5) {
      const speed = current_mA * 0.05;
      const offset = (performance.now() * speed * 0.08) % 40;

      ctx.fillStyle = '#ffff00';
      const drawDotsOnLine = (x1, y1, x2, y2) => {
        const len = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.floor(len / 35);
        for (let s = 0; s <= steps; s++) {
          const t = ((s * 35 + offset + len) % len) / len;
          const px = x1 + (x2 - x1) * t;
          const py = y1 + (y2 - y1) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawDotsOnLine(t1X, t1Y, t1X, meterY);
      drawDotsOnLine(t1X, meterY, meterX - 35, meterY);
      drawDotsOnLine(meterX + 35, meterY, bulbX - 22, bulbY);
      drawDotsOnLine(bulbX + 22, bulbY, bulbX + 45, bulbY);
      drawDotsOnLine(bulbX + 45, bulbY, bulbX + 45, cy + coilH / 2 + 25);
      drawDotsOnLine(bulbX + 45, cy + coilH / 2 + 25, t2X, cy + coilH / 2 + 25);
      drawDotsOnLine(t2X, cy + coilH / 2 + 25, t2X, t2Y);
    }

    ctx.restore();
  }

  drawGalvanometer(cx, cy, needleAngle, current_mA) {
    const ctx = this.ctx;
    ctx.save();

    const r = 36;

    // Bezel
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dial face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Scale arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Scale ticks: -50, -25, 0, +25, +50
    const ticks = [-50, -25, 0, 25, 50];
    ticks.forEach(val => {
      const angle = Math.PI * 1.5 + (val / 50) * (Math.PI * 0.35);
      const x1 = cx + (r * 0.72) * Math.cos(angle);
      const y1 = cy + (r * 0.72) * Math.sin(angle);
      const x2 = cx + (r * 0.88) * Math.cos(angle);
      const y2 = cy + (r * 0.88) * Math.sin(angle);

      ctx.strokeStyle = val === 0 ? '#00f2fe' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = val === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Zero tick mark '0'
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 9px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText("0", cx, cy - r * 0.48);

    // Galvanometer Emblem 'G'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = 'bold 15px Outfit';
    ctx.fillText("G", cx, cy + 16);

    // Indicator Needle
    const needleAngleAbs = Math.PI * 1.5 + needleAngle;
    const nx = cx + (r * 0.82) * Math.cos(needleAngleAbs);
    const ny = cy + (r * 0.82) * Math.sin(needleAngleAbs);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center pivot cap
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Readout label below
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 11px Outfit';
    ctx.fillText((current_mA >= 0 ? "+" : "") + current_mA.toFixed(1) + " mA", cx, cy + r + 16);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Kantumruy Pro';
    ctx.fillText("ហ្គាល់វ៉ាណូម៉ែត្រ G", cx, cy + r + 28);

    ctx.restore();
  }

  drawBulb(cx, cy, brightness) {
    const ctx = this.ctx;
    ctx.save();

    // Screw base
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 8, cy + 18, 16, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 9, cy + 22, 18, 2);
    ctx.fillRect(cx - 9, cy + 26, 18, 2);

    // Radiant Glow when lit
    if (brightness > 0.05) {
      const glowR = 25 + brightness * 35;
      const glowGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, glowR);
      glowGrad.addColorStop(0, `rgba(255, 240, 180, ${brightness * 0.9})`);
      glowGrad.addColorStop(0.4, `rgba(251, 191, 36, ${brightness * 0.6})`);
      glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass Bulb Envelope
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = brightness > 0.1 ? `rgba(255, 250, 220, ${0.2 + brightness * 0.5})` : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = brightness > 0.1 ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tungsten Filament
    ctx.strokeStyle = brightness > 0.1 ? '#ffffff' : '#64748b';
    ctx.lineWidth = brightness > 0.1 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 12);
    ctx.lineTo(cx - 4, cy - 2);
    ctx.lineTo(cx, cy - 6);
    ctx.lineTo(cx + 4, cy - 2);
    ctx.lineTo(cx + 6, cy + 12);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px Kantumruy Pro';
    ctx.textAlign = 'center';
    ctx.fillText("អំពូលភ្លើង", cx, cy + 42);

    ctx.restore();
  }

  drawInductionBanner(width, height, vx, poleSign, emf, current_mA) {
    const ctx = this.ctx;
    ctx.save();

    // Top Header Ribbon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 12, width - 32, 34);
    ctx.strokeStyle = 'var(--border-glass)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 12, width - 32, 34);

    ctx.font = 'bold 12px Kantumruy Pro, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (Math.abs(vx) > 8) {
      if (vx > 0) {
        ctx.fillStyle = '#34d399';
        ctx.fillText("🟢 មេដែកកំពុងរំកិលចូល ➔ ហ្លុចកើន (ΔΦ > 0) ➔ ចរន្តអាំងឌ្វីបង្កើតដែនច្រានមេដែក (ច្បាប់ឡិន)!", 28, 29);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText("🟡 មេដែកកំពុងរំកិលចេញ ➔ ហ្លុចថយ (ΔΦ < 0) ➔ ចរន្តអាំងឌ្វីបង្កើតដែនទាញមេដែក (ច្បាប់ឡិន)!", 28, 29);
      }
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText("⚪ មេដែកនៅស្ងៀម ➔ គ្មានបម្រែបម្រួលហ្លុច (ΔΦ/Δt = 0 ⟹ e = 0) (គ្មានចរន្តអាំងឌ្វី)", 28, 29);
    }

    ctx.restore();
  }

  // =========================================================================
  // 2. Electromagnetic Self-Induction (RL Circuit & Solenoid)
  // e = -L * (di / dt) , W = 1/2 * L * i^2
  // =========================================================================
  drawSelfInduction() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const L_eff = this.selfInd.L_base * (this.selfInd.hasCore ? 4.0 : 1.0);
    const tau = L_eff / this.selfInd.R2;
    const E = this.selfInd.voltage;
    const I_max1 = E / this.selfInd.R1;
    const I_max2 = E / this.selfInd.R2;

    const dt = 0.025;

    if (this.selfInd.switchClosed) {
      this.selfInd.switchAnim += (0 - this.selfInd.switchAnim) * 0.25; // Close blade
      this.selfInd.tSwitch += dt;

      // Resistor branch reaches steady state immediately
      this.selfInd.i1 = I_max1;

      // Inductor branch establishes current gradually: i2(t) = I_max * (1 - e^(-t / tau))
      this.selfInd.i2 = I_max2 * (1 - Math.exp(-this.selfInd.tSwitch / tau));
      this.selfInd.di2_dt = (E / L_eff) * Math.exp(-this.selfInd.tSwitch / tau);
      this.selfInd.e_self = -L_eff * this.selfInd.di2_dt; // Back EMF
      this.selfInd.energy = 0.5 * L_eff * Math.pow(this.selfInd.i2, 2);

      this.selfInd.sparkIntensity = Math.max(0, this.selfInd.sparkIntensity - 0.05);
      this.selfInd.neonFlash = Math.max(0, this.selfInd.neonFlash - 0.05);
    } else {
      this.selfInd.switchAnim += (1 - this.selfInd.switchAnim) * 0.25; // Open blade
      this.selfInd.i1 = 0;
      this.selfInd.i2 = 0;
      this.selfInd.di2_dt = 0;
      this.selfInd.e_self = 0;
      this.selfInd.energy = 0;

      this.selfInd.sparkIntensity = Math.max(0, this.selfInd.sparkIntensity - 0.035);
      this.selfInd.neonFlash = Math.max(0, this.selfInd.neonFlash - 0.035);
    }

    // Oscilloscope history
    this.time += dt;
    if (Math.floor(this.time * 40) % 2 === 0) {
      this.selfInd.history.push({
        i1: this.selfInd.i1,
        i2: this.selfInd.i2,
        closed: this.selfInd.switchClosed
      });
      if (this.selfInd.history.length > 130) {
        this.selfInd.history.shift();
      }
    }

    // DRAW SCHEMATIC & INSTRUMENTS
    this.drawRLCircuit(width, height, E, L_eff, tau, I_max1, I_max2);
    this.drawOscilloscope(width, height, tau, I_max1);
    this.drawSelfInductionBanner(width, height, tau);

    // Update Telemetry
    const tel1 = document.getElementById('tel-1');
    const tel2 = document.getElementById('tel-2');
    if (tel1 && tel2) {
      tel1.innerText = this.selfInd.i2.toFixed(2) + " A (τ = " + tau.toFixed(2) + " s)";
      tel2.innerText = this.selfInd.energy.toFixed(3) + " J (e = " + this.selfInd.e_self.toFixed(1) + " V)";
    }
  }

  drawRLCircuit(width, height, E, L_eff, tau, I_max1, I_max2) {
    const ctx = this.ctx;
    ctx.save();

    // Circuit Layout Coordinates
    const xLeft = 45;
    const yTop = 85;
    const yBottom = height - 55;
    const xSwitch = Math.min(160, width * 0.22);
    const xSplit = Math.min(235, width * 0.32);
    const xR = xSplit + 60;
    const xL1 = xR + 65;
    const xBobbin = xSplit + 60;
    const xL2 = xBobbin + 65;
    const xMerge = xL1 + 55;
    const yBranch1 = yTop;
    const yBranch2 = 195;

    // --- MAIN CIRCUIT WIRES ---
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Battery Left to Switch
    ctx.beginPath();
    ctx.moveTo(xLeft, (yTop + yBottom) / 2 - 25);
    ctx.lineTo(xLeft, yTop);
    ctx.lineTo(xSwitch - 15, yTop);
    ctx.stroke();

    // Switch Right to Split
    ctx.beginPath();
    ctx.moveTo(xSwitch + 18, yTop);
    ctx.lineTo(xSplit, yTop);
    ctx.stroke();

    // Split to Branch 1
    ctx.beginPath();
    ctx.moveTo(xSplit, yTop);
    ctx.lineTo(xR - 22, yBranch1);
    ctx.stroke();

    // Branch 1: R1 to Bulb 1
    ctx.beginPath();
    ctx.moveTo(xR + 22, yBranch1);
    ctx.lineTo(xL1 - 16, yBranch1);
    ctx.stroke();

    // Branch 1: Bulb 1 to Merge
    ctx.beginPath();
    ctx.moveTo(xL1 + 16, yBranch1);
    ctx.lineTo(xMerge, yBranch1);
    ctx.lineTo(xMerge, (yBranch1 + yBranch2) / 2);
    ctx.stroke();

    // Split to Branch 2
    ctx.beginPath();
    ctx.moveTo(xSplit, yTop);
    ctx.lineTo(xSplit, yBranch2);
    ctx.lineTo(xBobbin - 25, yBranch2);
    ctx.stroke();

    // Branch 2: Bobbin to Bulb 2
    ctx.beginPath();
    ctx.moveTo(xBobbin + 25, yBranch2);
    ctx.lineTo(xL2 - 16, yBranch2);
    ctx.stroke();

    // Branch 2: Bulb 2 to Merge
    ctx.beginPath();
    ctx.moveTo(xL2 + 16, yBranch2);
    ctx.lineTo(xMerge, yBranch2);
    ctx.lineTo(xMerge, (yBranch1 + yBranch2) / 2);
    ctx.stroke();

    // Merge to Bottom Rail
    ctx.beginPath();
    ctx.moveTo(xMerge, (yBranch1 + yBranch2) / 2);
    ctx.lineTo(xMerge, yBottom);
    ctx.lineTo(xLeft, yBottom);
    ctx.lineTo(xLeft, (yTop + yBottom) / 2 + 25);
    ctx.stroke();

    // --- DC SOURCE (BATTERY) ---
    const batY = (yTop + yBottom) / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(xLeft - 18, batY - 26, 36, 52);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(xLeft - 18, batY - 26, 36, 52);

    // Battery cell lines
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(xLeft - 12, batY - 12);
    ctx.lineTo(xLeft + 12, batY - 12);
    ctx.stroke();

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(xLeft - 7, batY + 12);
    ctx.lineTo(xLeft + 7, batY + 12);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(`${E}V`, xLeft, batY + 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillText("+", xLeft - 12, batY - 16);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText("-", xLeft - 12, batY + 22);

    // --- KNIFE SWITCH K ---
    const swBladeAngle = this.selfInd.switchAnim * (Math.PI * 0.22);
    // Switch terminals
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(xSwitch - 15, yTop, 5, 0, Math.PI * 2);
    ctx.arc(xSwitch + 18, yTop, 5, 0, Math.PI * 2);
    ctx.fill();

    // Switch Blade
    ctx.save();
    ctx.translate(xSwitch - 15, yTop);
    ctx.rotate(-swBladeAngle);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(34, 0);
    ctx.stroke();
    // Blade handle
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(28, -4, 10, 8);
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Outfit';
    ctx.fillText("K", xSwitch, yTop - 24);

    // Spark Effect at Switch Contact on Break
    if (this.selfInd.sparkIntensity > 0.05) {
      const sp = this.selfInd.sparkIntensity;
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(xSwitch + 18, yTop);
      ctx.lineTo(xSwitch + 10 + (Math.random() - 0.5) * 14, yTop - (Math.random() - 0.5) * 16);
      ctx.lineTo(xSwitch - 15 + 28 * Math.cos(-swBladeAngle), yTop + 28 * Math.sin(-swBladeAngle));
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Neon Flash Alert
      ctx.fillStyle = `rgba(255, 107, 53, ${sp * 0.9})`;
      ctx.font = 'bold 11px Kantumruy Pro';
      ctx.fillText("⚡ ភ្លើងឆាបផ្ដាច់ចរន្ត!", xSwitch + 45, yTop - 14);
    }

    // --- BRANCH 1: RESISTOR R1 & BULB L1 ---
    // Resistor R1
    ctx.fillStyle = '#d97706';
    ctx.fillRect(xR - 18, yBranch1 - 9, 36, 18);
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xR - 18, yBranch1 - 9, 36, 18);
    // Color bands
    ctx.fillStyle = '#78350f'; ctx.fillRect(xR - 10, yBranch1 - 9, 4, 18);
    ctx.fillStyle = '#000000'; ctx.fillRect(xR - 3, yBranch1 - 9, 4, 18);
    ctx.fillStyle = '#000000'; ctx.fillRect(xR + 4, yBranch1 - 9, 4, 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Outfit';
    ctx.fillText("R₁ = 10Ω", xR, yBranch1 - 15);

    // Bulb L1
    const bright1 = this.selfInd.switchClosed ? 1.0 : 0.0;
    this.drawCircuitBulb(xL1, yBranch1, bright1, "L₁ (ភ្លាមៗ)", '#fbbf24');

    // --- BRANCH 2: BOBBIN / SOLENOID L & BULB L2 ---
    // Bobbin Cylinder & Core
    const bobW = 54;
    const bobH = 34;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(xBobbin - bobW / 2, yBranch2 - bobH / 2, bobW, bobH);

    // Iron Core inside bobbin
    if (this.selfInd.hasCore) {
      const coreGrad = ctx.createLinearGradient(xBobbin - bobW / 2, yBranch2, xBobbin + bobW / 2, yBranch2);
      coreGrad.addColorStop(0, '#475569');
      coreGrad.addColorStop(0.5, '#94a3b8');
      coreGrad.addColorStop(1, '#334155');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(xBobbin - bobW / 2 + 4, yBranch2 - 6, bobW - 8, 12);
    }

    // Bobbin Coils
    const bobCoils = 6;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3.5;
    for (let c = 0; c < bobCoils; c++) {
      const cx = xBobbin - bobW / 2 + 5 + c * 8;
      ctx.beginPath();
      ctx.arc(cx, yBranch2, bobH / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#00f2fe';
    ctx.font = '11px Outfit';
    ctx.fillText(`L = ${L_eff.toFixed(1)}H`, xBobbin, yBranch2 - 22);

    // Bulb L2 (Smooth gradual ignition with current i2)
    const bright2 = this.selfInd.i2 / I_max2;
    this.drawCircuitBulb(xL2, yBranch2, bright2, "L₂ (សន្សឹមៗ)", '#38bdf8');

    // Current Flow Animation Dots
    if (this.selfInd.switchClosed) {
      const t = performance.now() * 0.05;

      // Branch 1 dots (constant speed)
      ctx.fillStyle = '#fbbf24';
      for (let d = 0; d < 3; d++) {
        const dotX = xSplit + ((t * 2 + d * 40) % (xMerge - xSplit));
        ctx.beginPath();
        ctx.arc(dotX, yBranch1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Branch 2 dots (accelerating with i2)
      ctx.fillStyle = '#00f2fe';
      const speed2 = (this.selfInd.i2 / I_max2) * 2;
      for (let d = 0; d < 3; d++) {
        const dotX = xSplit + ((t * speed2 + d * 40) % (xMerge - xSplit));
        ctx.beginPath();
        ctx.arc(dotX, yBranch2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawCircuitBulb(x, y, brightness, labelText, activeColor) {
    const ctx = this.ctx;
    ctx.save();

    // Glow aura
    if (brightness > 0.05) {
      const glowR = 12 + brightness * 22;
      const glow = ctx.createRadialGradient(x, y, 2, x, y, glowR);
      glow.addColorStop(0, `rgba(255, 250, 200, ${brightness * 0.95})`);
      glow.addColorStop(0.5, `rgba(251, 191, 36, ${brightness * 0.55})`);
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass globe
    ctx.fillStyle = brightness > 0.1 ? `rgba(255, 255, 255, ${0.2 + brightness * 0.6})` : 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = brightness > 0.1 ? '#fbbf24' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Filament cross
    ctx.strokeStyle = brightness > 0.1 ? '#ffffff' : '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y + 5);
    ctx.moveTo(x + 5, y - 5);
    ctx.lineTo(x - 5, y + 5);
    ctx.stroke();

    // Label
    ctx.fillStyle = brightness > 0.5 ? activeColor : '#94a3b8';
    ctx.font = '10px Kantumruy Pro';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, x, y + 26);

    ctx.restore();
  }

  drawOscilloscope(width, height, tau, I_max) {
    const ctx = this.ctx;
    ctx.save();

    const scopeW = Math.min(240, width * 0.36);
    const scopeH = 155;
    const scopeX = width - scopeW - 20;
    const scopeY = 55;

    // Bezel
    ctx.fillStyle = '#090d16';
    ctx.fillRect(scopeX, scopeY, scopeW, scopeH);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);

    // CRT Screen Grid
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    const cols = 6;
    const rows = 4;
    for (let c = 1; c < cols; c++) {
      const gx = scopeX + (scopeW / cols) * c;
      ctx.beginPath();
      ctx.moveTo(gx, scopeY);
      ctx.lineTo(gx, scopeY + scopeH);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const gy = scopeY + (scopeH / rows) * r;
      ctx.beginPath();
      ctx.moveTo(scopeX, gy);
      ctx.lineTo(scopeX + scopeW, gy);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 10px Kantumruy Pro, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("📈 អូស៊ីឡូស្កុប i(t)", scopeX + 8, scopeY + 14);

    // Plot Traces from history
    const hist = this.selfInd.history;
    if (hist.length > 1) {
      const stepX = (scopeW - 16) / 130;
      const baseY = scopeY + scopeH - 15;
      const maxPlotH = scopeH - 45;

      // Trace 1: i1(t) Resistor Branch (Green/Amber)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const px = scopeX + 8 + i * stepX;
        const py = baseY - (hist[i].i1 / (I_max || 1)) * maxPlotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Trace 2: i2(t) Inductor Branch (Cyan Glow)
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0, 242, 254, 0.6)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < hist.length; i++) {
        const px = scopeX + 8 + i * stepX;
        const py = baseY - (hist[i].i2 / (I_max || 1)) * maxPlotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Legend
    ctx.font = '9px Kantumruy Pro';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText("— i₁(t) រេស៊ីស្តង់", scopeX + 8, scopeY + scopeH - 6);
    ctx.fillStyle = '#00f2fe';
    ctx.fillText("— i₂(t) បូប៊ីន", scopeX + 110, scopeY + scopeH - 6);

    ctx.restore();
  }

  drawSelfInductionBanner(width, height, tau) {
    const ctx = this.ctx;
    ctx.save();

    // Top Header Ribbon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 12, width - 32, 34);
    ctx.strokeStyle = 'var(--border-glass)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 12, width - 32, 34);

    ctx.font = 'bold 12px Kantumruy Pro, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (this.selfInd.switchClosed) {
      if (this.selfInd.tSwitch < tau * 3) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`⏳ កំពុងបង្កើតចរន្ត៖ ក.អ.ច. អូតូអាំងឌ្វី e = -L(di/dt) ប្រឆាំងការកើនឡើងនៃចរន្ត ➔ L₂ ភ្លឺយឺតជាង L₁ (τ = ${tau.toFixed(2)}s)!`, 28, 29);
      } else {
        ctx.fillStyle = '#34d399';
        ctx.fillText("✅ របបអចិន្ត្រៃយ៍៖ ចរន្តថេរ (di/dt = 0 ⟹ e = 0) ➔ អំពូលទាំងពីរ L₁ និង L₂ ភ្លឺស្មើគ្នា!", 28, 29);
      }
    } else {
      if (this.selfInd.sparkIntensity > 0.05) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText("⚡ បាតុភូតផ្ដាច់ចរន្ត៖ ចរន្តធ្លាក់ចុះគំហុក ➔ ក.អ.ច. អូតូអាំងឌ្វីឡើងខ្ពស់ខ្លាំង បង្កជាភ្លើងឆាប (Spark)!", 28, 29);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("⏹️ កុងតាក់បើក៖ គ្មានចរន្តហូរក្នុងសៀគ្វី (ចុចប៊ូតុង ឬចុចលើកុងតាក់ K ដើម្បីបិទពិសោធន៍)", 28, 29);
      }
    }

    ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.labInstance = new PhysicsLab();
});
