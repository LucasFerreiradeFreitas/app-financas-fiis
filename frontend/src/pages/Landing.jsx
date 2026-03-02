import React, { useEffect, useRef } from "react";
import "../index.css";

// Mini componente de card de feature
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className="feature-card" style={{ animationDelay: delay }}>
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

// Mini componente de stat flutuante
function StatBadge({ value, label, top, left, right, delay }) {
  const style = { animationDelay: delay };
  if (top !== undefined) style.top = top;
  if (left !== undefined) style.left = left;
  if (right !== undefined) style.right = right;

  return (
    <div className="stat-badge" style={style}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Landing({ onEntrar, onCadastrar }) {
  const canvasRef = useRef(null);

  // Canvas animado com partículas/grade
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Pontos da grade
    const cols = 12;
    const rows = 8;
    const points = [];

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        points.push({
          x: (i / cols) * canvas.width,
          y: (j / rows) * canvas.height,
          ox: (i / cols) * canvas.width,
          oy: (j / rows) * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atualiza posições com leve flutuação
      points.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.x - p.ox) > 18) p.vx *= -1;
        if (Math.abs(p.y - p.oy) > 18) p.vy *= -1;
      });

      // Linhas entre pontos próximos
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = canvas.width / cols + 20;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 179, 237, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Pontos
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(147, 197, 253, 0.35)";
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* FUNDO com canvas animado */}
      <div className="landing-bg">
        <canvas ref={canvasRef} className="landing-canvas" />
        <div className="landing-glow glow-1" />
        <div className="landing-glow glow-2" />
        <div className="landing-glow glow-3" />
      </div>

      {/* NAVBAR */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="logo-pill">💰</div>
          <span>FinançasApp</span>
        </div>
        <nav className="landing-nav">
          <button onClick={onEntrar} className="btn-nav-ghost">
            Entrar
          </button>
          <button onClick={onCadastrar} className="btn-nav-primary">
            Cadastrar grátis
          </button>
        </nav>
      </header>

      {/* HERO */}
      <main className="landing-hero">
        <div className="hero-badge">✦ Controle financeiro inteligente</div>

        <h1 className="hero-title">
          Domine suas
          <br />
          <span className="hero-highlight">finanças</span> de um
          <br />
          jeito simples.
        </h1>

        <p className="hero-subtitle">
          Controle seu orçamento, gerencie sua carteira de FIIs e acompanhe cada
          centavo. Tudo em um painel elegante.
        </p>

        <div className="hero-actions">
          <button onClick={onCadastrar} className="btn-hero-primary">
            Começar gratuitamente
            <span className="btn-arrow">→</span>
          </button>
          <button onClick={onEntrar} className="btn-hero-ghost">
            Já tenho conta
          </button>
        </div>

        {/* Stats flutuantes */}
        <div className="hero-stats">
          <div className="stat-pill">
            <span className="stat-num">📊</span>
            Orçamento mensal
          </div>
          <div className="stat-pill">
            <span className="stat-num">📈</span>
            Carteira de FIIs
          </div>
          <div className="stat-pill">
            <span className="stat-num">🔒</span>
            100% seguro
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="features-label">O que você pode fazer</div>
        <h2 className="features-title">
          Tudo que você precisa,
          <br />
          em um só lugar
        </h2>

        <div className="features-grid">
          <FeatureCard
            icon="📊"
            title="Orçamento Mensal"
            desc="Registre receitas e despesas, veja o saldo em tempo real e visualize seu balanço com gráficos claros."
            delay="0s"
          />
          <FeatureCard
            icon="📈"
            title="Carteira de FIIs"
            desc="Acompanhe suas cotas, preço médio e patrimônio total com um gráfico de alocação por fundo."
            delay="0.1s"
          />
          <FeatureCard
            icon="🔐"
            title="Dados Protegidos"
            desc="Cada usuário acessa apenas os próprios dados. Login seguro com token JWT."
            delay="0.2s"
          />
          <FeatureCard
            icon="📱"
            title="Mobile Friendly"
            desc="Interface responsiva que funciona perfeitamente no celular, tablet e desktop."
            delay="0.3s"
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="landing-cta">
        <div className="cta-box">
          <h2>Pronto para começar?</h2>
          <p>
            Crie sua conta gratuitamente e tenha controle total das suas
            finanças.
          </p>
          <button onClick={onCadastrar} className="btn-hero-primary">
            Criar conta grátis
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <span>💰 FinançasApp</span>
        <span>Feito para quem quer crescer financeiramente</span>
      </footer>
    </div>
  );
}

export default Landing;
