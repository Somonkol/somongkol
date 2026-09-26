/* 
  Kim Somangkol Physics Portfolio
  Virtual Physics Lab Interactive Canvas Simulations
  Includes Mechanics, Optics & Thermodynamics Gas Laws (Boyle, Charles, Gay-Lussac)
*/

class PhysicsLab {
  constructor() {
    this.canvas = document.getElementById('lab-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.currentMode = 'boyle'; // Default to Boyle's Law
    this.time = 0;
    this.animationId = null;

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
    // 1. Boyle's Law (T = const, P * V = const)
    this.boyle = {
      volume: 10, // Liters (Piston height)
      temp: 300,  // Kelvin (Fixed)
    };

    // 2. Charles's Law (P = const, V / T = const)
    this.charles = {
      temp: 300,  // Kelvin
      pressure: 1 // atm (Fixed)
    };

    // 3. Gay-Lussac's Law (V = const, P / T = const)
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
        document.getElementById('lab-val1').innerText = val;
        
        if (this.currentMode === 'pendulum') this.pendulum.length = val;
        if (this.currentMode === 'prism') this.prism.lightAngle = val;
        if (this.currentMode === 'projectile') this.projectile.velocity = val;
        if (this.currentMode === 'boyle') this.boyle.volume = val;
        if (this.currentMode === 'charles') this.charles.temp = val;
        if (this.currentMode === 'gaylussac') this.gaylussac.temp = val;
      });
    }

    if (param2) {
      param2.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('lab-val2').innerText = val;

        if (this.currentMode === 'pendulum') this.pendulum.gravity = val;
        if (this.currentMode === 'prism') this.prism.refractionIndex = val;
        if (this.currentMode === 'projectile') this.projectile.angle = val;
      });
    }
  }

  updateControlPanelUI() {
    const label1 = document.getElementById('lab-label1');
    const label2 = document.getElementById('lab-label2');
    const param1 = document.getElementById('lab-param1');
    const param2 = document.getElementById('lab-param2');
    const group2 = param2.parentElement;

    group2.style.display = 'flex'; // Default show param2

    if (this.currentMode === 'boyle') {
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
    if (this.currentMode === 'pendulum') {
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

      if (this.currentMode === 'boyle') this.drawBoyle();
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
}

document.addEventListener('DOMContentLoaded', () => {
  window.labInstance = new PhysicsLab();
});
