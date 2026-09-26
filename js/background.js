/* 
  Kim Somangkol Physics Portfolio
  Quantum Particle & Energy Wave Interactive Background Canvas
*/

class QuantumBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 65;
    this.mouse = { x: null, y: null, radius: 150 };

    this.init();
    this.animate();
    this.handleResize();
    this.handleMouse();
  }

  init() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(168, 85, 247, ',
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  handleResize() {
    window.addEventListener('resize', () => {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    });
  }

  handleMouse() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawGrid() {
    const isDark = document.body.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)';
    const step = 60;

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Draw Particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.fill();

      // Connect near particles (Quantum entanglement visualizer)
      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          let lineAlpha = (1 - dist / 130) * 0.15;
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }

      // Mouse influence
      if (this.mouse.x !== null) {
        let mdx = p.x - this.mouse.x;
        let mdy = p.y - this.mouse.y;
        let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < this.mouse.radius) {
          let force = (this.mouse.radius - mdist) / this.mouse.radius;
          p.x += (mdx / mdist) * force * 2;
          p.y += (mdy / mdist) * force * 2;
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new QuantumBackground();
});
