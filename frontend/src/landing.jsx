
const useTheme = () => {
  const get = () => document.documentElement.getAttribute('data-theme') || 'light';
  const [theme, setTheme] = React.useState(get);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setTheme(get()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    let mq = null, listener = null;
    if (window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
      listener = (e) => {
        try { if (localStorage.getItem('theme')) return; } catch (err) {}
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', listener);
      else if (mq.addListener) mq.addListener(listener);
    }
    return () => {
      obs.disconnect();
      if (mq && listener) {
        if (mq.removeEventListener) mq.removeEventListener('change', listener);
        else if (mq.removeListener) mq.removeListener(listener);
      }
    };
  }, []);
  const toggle = React.useCallback(() => {
    const next = get() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  }, []);
  return [theme, toggle];
};

const ThemeToggle = ({ theme, onToggle }) => (
  <button type="button" className="theme-toggle" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={theme === 'dark'} onClick={onToggle}>
    <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
    </svg>
    <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
);

const Nav = ({ theme, onToggleTheme }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const urls = window.SITE_URLS;
  const closeMenu = () => setMenuOpen(false);
  return (
    <nav className={"nav " + (scrolled ? "is-scrolled" : "")}>
      <div className="nav-bg"></div>
      <a href={urls.home} className="wordmark"><span className="wordmark-dot"></span>Mindform</a>
      <div className={"nav-links " + (menuOpen ? "is-open" : "")}>
        <a href="#vision" onClick={closeMenu}>Vision</a>
        <a href="#solution" onClick={closeMenu}>Solution</a>
        <a href="#architecture" onClick={closeMenu}>How it works</a>
        <a href="#usecases" onClick={closeMenu}>Markets</a>
        <a href={urls.researchPaper} onClick={closeMenu}>Research</a>
        <a href={urls.careers} onClick={closeMenu}>Careers</a>
        {window.IS_AUTHENTICATED
          ? <a href={urls.profile} onClick={closeMenu}>Profile</a>
          : <a href={urls.login} onClick={closeMenu}>Log in</a>}
      </div>
      <div className="nav-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <a href="#join" className="btn btn-primary nav-cta-desktop" style={{padding: "10px 18px", whiteSpace: "nowrap"}}>Build with us →</a>
        <button
          type="button"
          className="nav-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

const HeroMind = () => {
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.THREE) return;
    const THREE = window.THREE;
    let W = container.clientWidth, H = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const MAGENTA = new THREE.Color(0xF0386B), MAGENTA_S = new THREE.Color(0xFF6F94);
    const VIOLET  = new THREE.Color(0x5B3FE0), VIOLET_S  = new THREE.Color(0x9A7FFF);
    const N = 2800;
    const sphereShape = () => { const a = new Float32Array(N*3), phi = Math.PI*(3-Math.sqrt(5)); for(let i=0;i<N;i++){const y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),t=phi*i;a[i*3]=Math.cos(t)*r*1.5;a[i*3+1]=y*1.5;a[i*3+2]=Math.sin(t)*r*1.5;} return a; };
    const heartShape = () => { const a=new Float32Array(N*3);let i=0;while(i<N){const t=Math.random()*Math.PI*2,s=(Math.random()-0.5)*2,bx=16*Math.pow(Math.sin(t),3),by=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t),f=Math.sqrt(Math.max(0,1-s*s)),sc=0.085;a[i*3]=bx*sc*f+(Math.random()-0.5)*0.05;a[i*3+1]=by*sc+(Math.random()-0.5)*0.05;a[i*3+2]=s*0.55+(Math.random()-0.5)*0.05;i++;} return a; };
    const knotShape = () => { const a=new Float32Array(N*3),p=2,q=3,R=1.0,r=0.35;for(let i=0;i<N;i++){const u=(i/N)*Math.PI*2,cq=Math.cos(q*u),sq=Math.sin(q*u),cp=Math.cos(p*u),sp=Math.sin(p*u),cx=(R+r*cq)*cp,cy=(R+r*cq)*sp,cz=r*sq,jr=Math.random()*0.18,ja=Math.random()*Math.PI*2;a[i*3]=cx+Math.cos(ja)*jr*0.5;a[i*3+1]=cy+Math.sin(ja)*jr*0.5;a[i*3+2]=cz+(Math.random()-0.5)*0.3;} return a; };
    const flameShape = () => { const a=new Float32Array(N*3);for(let i=0;i<N;i++){const t=Math.random(),ring=(1-t)*0.9+0.05,radius=Math.pow(1-t,1.6)*ring,ang=Math.random()*Math.PI*2;a[i*3]=Math.cos(ang)*radius*0.9;a[i*3+1]=t*2.2-1.1;a[i*3+2]=Math.sin(ang)*radius*0.9;} return a; };
    const starShape = () => { const a=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random(),v=Math.random(),arms=5,seg=Math.floor(u*arms*2),iR=0.45,oR=1.5,aT=(u*arms*2)-seg,bA=(seg/(arms*2))*Math.PI*2,rA=seg%2===0?oR:iR,rB=seg%2===0?iR:oR,ang=bA+(bA+Math.PI*2/(arms*2)-bA)*aT,r=(rA+(rB-rA)*aT)+(Math.random()-0.5)*0.12;a[i*3]=Math.cos(ang)*r;a[i*3+1]=Math.sin(ang)*r;a[i*3+2]=(v-0.5)*0.45;} return a; };
    const infinityShape = () => { const a=new Float32Array(N*3);for(let i=0;i<N;i++){const t=(i/N)*Math.PI*2,s=1+Math.sin(t)*Math.cos(t),x=1.6*Math.cos(t)/s,y=0.8*Math.sin(t)*Math.cos(t)/s,jr=0.14*Math.random(),ja=Math.random()*Math.PI*2;a[i*3]=x+Math.cos(ja)*jr;a[i*3+1]=y+Math.sin(ja)*jr;a[i*3+2]=(Math.random()-0.5)*0.3;} return a; };
    const shapes = [sphereShape(),heartShape(),knotShape(),flameShape(),starShape(),infinityShape()];
    const cloudPos = new Float32Array(N*3), cloudCol = new Float32Array(N*3);
    for(let i=0;i<N;i++){cloudPos[i*3]=shapes[0][i*3];cloudPos[i*3+1]=shapes[0][i*3+1];cloudPos[i*3+2]=shapes[0][i*3+2];const r=Math.hypot(cloudPos[i*3],cloudPos[i*3+1],cloudPos[i*3+2]),tcol=Math.min(1,r/1.6),c=VIOLET.clone().lerp(MAGENTA_S,tcol*0.6);cloudCol[i*3]=c.r;cloudCol[i*3+1]=c.g;cloudCol[i*3+2]=c.b;}
    const cloudGeom = new THREE.BufferGeometry();
    cloudGeom.setAttribute('position',new THREE.BufferAttribute(cloudPos,3));
    cloudGeom.setAttribute('color',new THREE.BufferAttribute(cloudCol,3));
    const cloudMat = new THREE.PointsMaterial({size:0.045,vertexColors:true,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
    scene.add(new THREE.Points(cloudGeom,cloudMat));
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.13,32,32),new THREE.MeshBasicMaterial({color:MAGENTA}));
    const halo1 = new THREE.Mesh(new THREE.SphereGeometry(0.34,32,32),new THREE.MeshBasicMaterial({color:MAGENTA,transparent:true,opacity:0.28,blending:THREE.AdditiveBlending,depthWrite:false}));
    const halo2 = new THREE.Mesh(new THREE.SphereGeometry(0.9,32,32),new THREE.MeshBasicMaterial({color:VIOLET,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(nucleus); scene.add(halo1); scene.add(halo2);
    const N_S=60,sparkPos=new Float32Array(N_S*3),sparkMeta=[];
    for(let i=0;i<N_S;i++){sparkMeta.push({alive:false});sparkPos[i*3]=999;sparkPos[i*3+1]=999;sparkPos[i*3+2]=999;}
    const sparkGeom=new THREE.BufferGeometry();
    sparkGeom.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));
    const sparkMat=new THREE.PointsMaterial({color:MAGENTA,size:0.10,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
    scene.add(new THREE.Points(sparkGeom,sparkMat));
    const spawnSpark=(i)=>{const phi=Math.random()*Math.PI*2,cosT=2*Math.random()-1,sinT=Math.sqrt(1-cosT*cosT),R=4.5+Math.random()*1.5;sparkMeta[i]={alive:true,x:R*sinT*Math.cos(phi),y:R*sinT*Math.sin(phi),z:R*cosT,tx:(Math.random()-0.5)*0.4,ty:(Math.random()-0.5)*0.4,tz:(Math.random()-0.5)*0.4,speed:2.5+Math.random()*1.2};};
    let shapeIdx=0,nextShapeIdx=1,morphT=0,phaseT=0,phase='hold',pulseT=-1;
    const HOLD=1.4,TRANSITION=2.5,eio=(x)=>x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
    const clock=new THREE.Clock();let raf;
    const tick=()=>{
      const dt=Math.min(0.05,clock.getDelta()),t=clock.getElapsedTime();
      phaseT+=dt;
      if(phase==='hold'){if(phaseT>=HOLD){phase='morph';phaseT=0;}}
      else{morphT=Math.min(1,phaseT/TRANSITION);if(morphT>=1){phase='hold';phaseT=0;morphT=0;shapeIdx=nextShapeIdx;let np;do{np=Math.floor(Math.random()*shapes.length);}while(np===shapeIdx);nextShapeIdx=np;}}
      const pa=cloudGeom.attributes.position.array,ca=cloudGeom.attributes.color.array;
      const from=shapes[shapeIdx],to=shapes[nextShapeIdx],u=phase==='morph'?eio(morphT):0;
      const rotY=t*0.10,rotX=Math.sin(t*0.07)*0.3,cy=Math.cos(rotY),sy=Math.sin(rotY),cx2=Math.cos(rotX),sx2=Math.sin(rotX),breath=1+Math.sin(t*1.1)*0.04;
      for(let i=0;i<N;i++){
        const bx=from[i*3]+(to[i*3]-from[i*3])*u,by=from[i*3+1]+(to[i*3+1]-from[i*3+1])*u,bz=from[i*3+2]+(to[i*3+2]-from[i*3+2])*u;
        const x=(bx+Math.sin(t*0.7+i*0.13)*0.025)*breath,y=(by+Math.cos(t*0.65+i*0.17)*0.025)*breath,z=(bz+Math.sin(t*0.55+i*0.11)*0.025)*breath;
        const x1=x*cy+z*sy,z1=-x*sy+z*cy;
        pa[i*3]=x1;pa[i*3+1]=y*cx2-z1*sx2;pa[i*3+2]=y*sx2+z1*cx2;
        const ma=phase==='morph'?(1-Math.abs(morphT*2-1)):0,r=Math.hypot(bx,by,bz),tcol=Math.min(1,r/1.6);
        const bc=VIOLET.clone().lerp(VIOLET_S,tcol),hc=MAGENTA.clone().lerp(MAGENTA_S,tcol),blend=Math.min(1,ma*0.65+Math.max(0,pulseT)*0.35),fc=bc.lerp(hc,blend);
        ca[i*3]=fc.r;ca[i*3+1]=fc.g;ca[i*3+2]=fc.b;
      }
      cloudGeom.attributes.position.needsUpdate=true;cloudGeom.attributes.color.needsUpdate=true;
      if(pulseT>0)pulseT=Math.max(0,pulseT-dt*1.6);
      const sa=sparkGeom.attributes.position.array;
      for(let i=0;i<N_S;i++){if(!sparkMeta[i].alive&&Math.random()<0.045)spawnSpark(i);}
      for(let i=0;i<N_S;i++){const m=sparkMeta[i];if(!m.alive){sa[i*3]=999;sa[i*3+1]=999;sa[i*3+2]=999;continue;}const dx=m.tx-m.x,dy=m.ty-m.y,dz=m.tz-m.z,d=Math.hypot(dx,dy,dz);if(d<0.18){m.alive=false;pulseT=Math.min(1,pulseT+0.4);continue;}m.x+=(dx/d)*m.speed*dt;m.y+=(dy/d)*m.speed*dt;m.z+=(dz/d)*m.speed*dt;sa[i*3]=m.x;sa[i*3+1]=m.y;sa[i*3+2]=m.z;}
      sparkGeom.attributes.position.needsUpdate=true;
      const nb=1+Math.sin(t*1.6)*0.10+pulseT*0.4;nucleus.scale.setScalar(nb);halo1.scale.setScalar(nb*0.95);halo2.scale.setScalar(1+Math.sin(t*0.55)*0.06);
      camera.position.x=Math.sin(t*0.08)*0.25;camera.position.y=Math.cos(t*0.06)*0.18;camera.lookAt(0,0,0);
      renderer.render(scene,camera);raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    const onResize=()=>{W=container.clientWidth;H=container.clientHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener('resize',onResize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);cloudGeom.dispose();sparkGeom.dispose();cloudMat.dispose();sparkMat.dispose();renderer.dispose();};
  },[]);
  return (
    <div className="hero-mind">
      <div ref={containerRef} className="hero-mind-canvas"></div>
      <div className="hero-mind-caption">
        <span><span className="dot dot-belief"></span>Experience</span>
        <span><span className="dot dot-trait"></span>Personality</span>
      </div>
    </div>
  );
};

const Hero = () => (
  <section className="hero" id="top">
    <div className="container">
      <div className="hero-grid">
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="hero-eyebrow-dot"></span><span className="eyebrow-strong">Mindform&nbsp;&nbsp;·&nbsp;&nbsp;The interface layer for AI</span></div>
          <h1 className="hero-title display">AI will power <span className="accent">everything.</span><br />Mindform shapes the <em>experience.</em></h1>
          <p className="hero-sub">Technology advances through <strong>capability.</strong><br />Adoption happens through <strong>interaction.</strong><br /><br />We're building <em>the connection.</em></p>
          <div className="hero-cta-row">
            <a href="/demo/" className="btn btn-primary">Try the live demo →</a>
            <a href="#join" className="btn">Build with us →</a>
            <a href="#architecture" className="btn btn-ghost">Explore the system →</a>
          </div>
          <div className="hero-meta"><div><span className="k">fig.01</span><span>// the personality layer for AI</span></div></div>
        </div>
        <div className="hero-visual"><HeroMind /></div>
      </div>
    </div>
  </section>
);

const SHIFTS = [
  {era: "1970s — 1990s", name: "Operating systems", effect: "Made computers usable."},
  {era: "1990s — 2010s", name: "UI & UX", effect: "Made technology intuitive."},
  {era: "2000s — Today",  name: "Social platforms", effect: "Made the internet human."},
];

const BigPicture = () => (
  <section className="bigpicture-section" id="bigpicture">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>01 — The big picture</div>
      <h2 className="bigpicture-title display">Every computing shift was defined<br />by its <em>interface layer.</em></h2>
      <div className="shift-grid">
        {SHIFTS.map(s => (
          <div className="shift-card" key={s.name}>
            <div className="shift-era">{s.era}</div>
            <div className="shift-name">{s.name}.</div>
            <p className="shift-effect">{s.effect}</p>
          </div>
        ))}
      </div>
      <p className="bigpicture-pivot">AI will follow the same pattern.</p>
      <p className="bigpicture-body">Foundation models may become invisible — embedded into everything around us. But what people will actually experience is the <strong>layer above them:</strong> <em>personality, behavior, continuity, tone, and emotional presence.</em></p>
      <p className="bigpicture-body" style={{marginBottom:32}}>That layer will define:</p>
      <ul className="defines-row" style={{listStyle:'none',padding:0,margin:'0 0 64px'}}>
        <li className="define-chip">Trust</li>
        <li className="define-chip">Connection</li>
        <li className="define-chip">Retention</li>
        <li className="define-chip">Preference</li>
      </ul>
      <p className="bigpicture-closing">Mindform is building <em>that layer.</em></p>
    </div>
  </section>
);

const Problem = () => (
  <section className="problem section" id="problem">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>02 — The problem</div>
      <h2 className="problem-title display">Today's AI adapts.<br /><span className="drift">But it still feels off.</span></h2>
      <p className="body-lg" style={{maxWidth:760,color:'rgba(244,236,222,0.72)',marginBottom:80}}>Modern AI can remember preferences, mimic tone, and personalize responses. But underneath, most systems still feel <em>interchangeable</em> — a different surface, the same nothing behind it.</p>
      <div className="drift-demo">
        <div className="drift-card drift-card-1"><div className="drift-card-time">Session 01</div><p className="drift-quote">"Hi, I'm here to help. Let me know what you need."</p></div>
        <div className="drift-card drift-card-2"><div className="drift-card-time">Session 47 · Same agent, weeks later</div><p className="drift-quote">"Hi, I'm here to help. Let me know what you need."</p></div>
        <div className="drift-card drift-card-3"><div className="drift-card-time">Session 412 · Still the same</div><p className="drift-quote">"Hi, I'm here to help. Let me know what you need."</p></div>
      </div>
      <div className="drift-arrow">↓ &nbsp; Interactions reset. Personalities disappear. Nothing persists. &nbsp; ↓</div>
      <div className="failure-modes">
        <div className="failure-mode"><div className="failure-mode-num">WHAT'S MISSING</div><h3 className="failure-mode-title">No stable identity.<br />No emotional continuity.</h3><p className="failure-mode-body">There is no baseline self to recognize. No evolving perspective. Every session begins from zero — and ends just as flat.</p></div>
        <div className="failure-mode"><div className="failure-mode-num">THE RESULT</div><h3 className="failure-mode-title">Useful — but emotionally flat.</h3><p className="failure-mode-body">Capable systems that no one feels anything toward. Without identity, AI never becomes a presence people remember, return to, or relate to.</p></div>
      </div>
    </div>
  </section>
);

const Vision = () => (
  <section className="vision-section" id="vision">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>03 — The vision</div>
      <h2 className="vision-title display">Personality is the next evolution<br />of <em>interface design.</em></h2>
      <div className="vision-grid">
        <div className="vision-body">
          <p>The next generation of AI will do more than generate answers.</p>
          <p>It will develop <strong>recognizable behavior, emotional tendencies, preferences, contradictions, and perspective</strong> — qualities that, taken together, make an agent feel like a someone rather than a service.</p>
        </div>
        <div className="vision-not">
          <span className="label">Not</span>
          <p>Scripted personas.</p>
          <p>Temporary prompts.</p>
          <span className="label" style={{marginTop:8}}>But</span>
          <p>Evolving identities that grow more coherent over time.</p>
        </div>
      </div>
      <p className="vision-closing">AI that feels less like software —<br />and more like <em>presence.</em></p>
    </div>
  </section>
);

const CAPABILITIES = [
  {n: "01", text: "Develop behavioral patterns"},
  {n: "02", text: "Maintain emotional continuity"},
  {n: "03", text: "Express distinct personalities"},
  {n: "04", text: "Evolve through interaction"},
  {n: "05", text: "Build familiarity with users"},
];

const Solution = () => (
  <section className="solution-section" id="solution">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>04 — The solution</div>
      <h2 className="solution-title display">A <em>personality layer</em><br />for AI.</h2>
      <p className="solution-lead">Mindform combines <strong>long-term memory</strong> with <strong>dynamic identity architecture</strong> to create AI that behaves consistently across time and context. Grounded in psychology and cognitive systems, Mindform enables agents to:</p>
      <div className="capability-grid">
        {CAPABILITIES.map(c => (
          <div className="capability" key={c.n}>
            <div className="capability-num">{c.n}</div>
            <div className="capability-text">{c.text}.</div>
          </div>
        ))}
      </div>
      <p className="solution-closing">The result is AI that feels <em>intentional</em> — not reactive.</p>
    </div>
  </section>
);

const SCRIPT = [
  {who:"user",text:"I want to brainstorm wild ideas — push past the obvious.",perc:"openness: +0.45 · conf 0.72",beliefs:{openness:0.18}},
  {who:"agent",text:"What edge are we walking?"},
  {who:"user",text:"Throw out the assumptions. Strange is fine.",perc:"openness: +0.52 · conf 0.80",beliefs:{openness:0.36}},
  {who:"agent",text:"Then we skip the safe takes."},
  {who:"user",text:"Keep it structured though — no rambling.",perc:"conscient.: +0.42 · conf 0.74",beliefs:{openness:0.44,conscient:0.22}},
  {who:"agent",text:"Tight and ordered. Got it."},
  {who:"user",text:"Don't agree just to agree. Push back when I'm off.",perc:"agreeable.: -0.48 · conf 0.83",beliefs:{openness:0.48,conscient:0.36,agreeable:-0.28}},
  {who:"agent",text:"Then I won't. Expect resistance."},
  {who:"user",text:"And stay steady if I spiral — don't catch the spin.",perc:"neurotic.: -0.52 · conf 0.88",beliefs:{openness:0.50,conscient:0.46,agreeable:-0.34,neurotic:-0.32}},
  {who:"reflection"},
  {who:"agent",text:"Then here's the shape: open, structured, disagreeable when needed, steady. In full.",traits:{openness:0.06,conscient:0.05,agreeable:-0.04,neurotic:-0.03}},
];
const dims=[{key:"openness",label:"openness"},{key:"conscient",label:"conscient."},{key:"extravers",label:"extravers."},{key:"agreeable",label:"agreeable."},{key:"neurotic",label:"neurotic."}];

const Demo = () => {
  const [idx,setIdx]=React.useState(0),[playing,setPlaying]=React.useState(true),[turnNum,setTurnNum]=React.useState(0),[reflecting,setReflecting]=React.useState(false);
  const [beliefs,setBeliefs]=React.useState({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});
  const [baselines,setBaselines]=React.useState({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});
  const [traits,setTraits]=React.useState({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});
  const [perception,setPerception]=React.useState(null),[pulse,setPulse]=React.useState({});
  React.useEffect(()=>{
    if(!playing)return;const step=SCRIPT[idx];if(!step)return;let timeout;
    if(step.who==="reflection"){setReflecting(true);timeout=setTimeout(()=>setIdx(i=>i+1),2200);}
    else{
      if(step.who==="user"){setTurnNum(t=>t+1);if(step.perc)setPerception(step.perc);if(step.beliefs)setTimeout(()=>setBeliefs(prev=>({...prev,...step.beliefs})),350);}
      else if(step.who==="agent"){setPerception(null);if(step.traits){const np={};Object.keys(step.traits).forEach(k=>{np[k]=Date.now();});setPulse(np);setTraits(prev=>{const n={...prev};Object.entries(step.traits).forEach(([k,v])=>{n[k]=(prev[k]||0)+v;});return n;});setBaselines(b=>({...b,...beliefs}));setReflecting(false);}}
      timeout=setTimeout(()=>setIdx(i=>i+1),step.who==="user"?2100:1900);
    }
    return()=>clearTimeout(timeout);
  },[idx,playing]);
  React.useEffect(()=>{if(idx>=SCRIPT.length){const t=setTimeout(()=>{setIdx(0);setTurnNum(0);setBeliefs({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setBaselines({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setTraits({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setPerception(null);setPulse({});setReflecting(false);},3000);return()=>clearTimeout(t);}},[idx]);
  const restart=()=>{setIdx(0);setTurnNum(0);setBeliefs({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setBaselines({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setTraits({openness:0,conscient:0,extravers:0,agreeable:0,neurotic:0});setPerception(null);setReflecting(false);setPulse({});setPlaying(true);};
  const visibleMsgs=SCRIPT.slice(0,idx+1).filter(s=>s.who==="user"||s.who==="agent").slice(-5);
  return (
    <section className="demo-section section" id="demo">
      <div className="container">
        <div className="eyebrow" style={{marginBottom:24}}>· See it in motion</div>
        <h2 className="demo-title display">Watch an agent <em>become someone.</em></h2>
        <p className="demo-lead">A simulated conversation. The agent listens, accumulates beliefs, and — only when the evidence is overwhelming — adjusts its traits. Identity emerges; it isn't scripted.</p>
        <div className="demo-stage">
          <div className="demo-chat">
            <div className="demo-chat-head"><span className="demo-chat-label">Live conversation</span><span className="demo-chat-turn">TURN {String(turnNum).padStart(2,'0')} / 20</span></div>
            <div className="demo-msgs">{visibleMsgs.map((m,i)=><div key={idx+'-'+i} className={"demo-msg is-shown "+m.who}><span className="author">{m.who==="user"?"User":"Agent"}</span>{m.text}</div>)}</div>
            <div className={"demo-perception "+(perception?"is-shown":"")}><span>perception extracted →</span><span>{perception||""}</span></div>
          </div>
          <div className="demo-state">
            <div>
              <div className="demo-panel-h"><span className="label">Belief layer<span className="glyph">μ</span></span><span className="badge fast">FAST · every turn</span></div>
              <div className="belief-bars">{dims.map(d=>{const v=beliefs[d.key]||0,half=Math.abs(v)*50,left=v>=0?50:50-half,bl=50+(baselines[d.key]||0)*50;return(<div key={d.key} className="belief-row"><span className="belief-name">{d.label}</span><div className="belief-track"><div className="belief-fill" style={{left:`${left}%`,width:`${half}%`}}></div><div className="belief-baseline" style={{left:`${bl}%`}}></div></div><span className="belief-val">{v.toFixed(2)}</span></div>);})}</div>
            </div>
            <div className={"reflection-banner "+(reflecting?"is-on":"")}><span>↻ Reflection epoch</span><span>Rule B passed · aggregating</span></div>
            <div>
              <div className="demo-panel-h"><span className="label">Trait vector<span className="glyph">τ</span></span><span className="badge slow">SLOW · ∆ ≤ ±0.08</span></div>
              <div className="trait-bars">{dims.map(d=>{const v=traits[d.key]||0,half=Math.abs(v)*200,left=v>=0?50:50-half,pulsing=pulse[d.key]&&Date.now()-pulse[d.key]<1200;return(<div key={d.key} className="trait-row"><span className="belief-name">{d.label}</span><div className="trait-track" style={{position:'relative'}}><div className="trait-fill" style={{left:`${left}%`,width:`${half}%`}}></div><div className={"trait-pulse "+(pulsing?"is-on":"")} key={pulse[d.key]||0}></div></div><span className="belief-val">{v.toFixed(3)}</span></div>);})}</div>
            </div>
          </div>
        </div>
        <div className="demo-controls">
          <button className="demo-btn" onClick={()=>setPlaying(p=>!p)}>{playing?"❚❚ Pause":"▶ Play"}</button>
          <button className="demo-btn" onClick={restart}>↻ Restart</button>
          <span>Scripted demo for clarity.</span>
        </div>
      </div>
    </section>
  );
};

const STEPS=[
  {n:"01",title:"Interaction arrives",desc:"An utterance, an action, a moment. The agent ingests it as a structured event."},
  {n:"02",title:"Parsed into perceptions",desc:"Each event becomes a multi-dimensional perception vector — what the agent noticed, and how strongly."},
  {n:"03",title:"Beliefs update fast",desc:"Perceptions fold into a moving average of beliefs (α = 0.25). The agent's view of the world adapts in real time."},
  {n:"04",title:"Drift is measured",desc:"Each belief is compared against a committed baseline. The distance between them is drift — pressure asking the agent to change."},
  {n:"05",title:"Rule B gates the change",desc:"A trait only evolves if drift clears three bars: magnitude ≥ 0.25, confidence ≥ 0.70, observations ≥ 10. Most pressure never makes it through."},
  {n:"06",title:"Trait evolves, baseline resets",desc:"Every 20 turns the agent reflects. The trait vector steps — bounded by ±0.08 — toward the aggregated signal. Then baselines reset."},
];
const ease=(t)=>t<0?0:t>1?1:t*t*(3-2*t);

const DiagramCanvas=({step,sub,theme})=>{
  const reveal=(n)=>step>n?1:step===n?ease(sub):0;
  const r0=reveal(0),r1=reveal(1),r2=reveal(2),r3=reveal(3),r4=reveal(4),r5=reveal(5);
  const belief=(i)=>{const d=[0.32,-0.45,0.28,-0.18,0.40][i]||0;return{baseline:0,current:d*Math.min(1,r2*1.2)};};
  const ts=(i)=>([0.06,-0.07,0.05,-0.03,0.07][i]||0)*r5;
  const dark = theme === 'dark';
  const INK     = dark ? '#F2EAD6' : '#1A0E2E';
  const MUTED   = dark ? '#B5A8C7' : '#8B7BA0';
  const MUTED2  = dark ? '#A89AC0' : '#6A597F';
  const PERC_BG = dark ? '#2A1B4E' : '#1A0E2E';
  const PERC_TX = '#F4ECDE';
  return(
    <svg viewBox="0 0 760 600" width="100%" height="100%" style={{display:'block'}}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={INK}/></marker>
        <marker id="arrow-ember" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#F0386B"/></marker>
      </defs>
      <g opacity={Math.max(0.18,r0)}>
        <rect x="40" y="24" width="280" height="56" rx="4" fill="none" stroke={INK} strokeWidth="1.2"/>
        <text x="56" y="48" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill={MUTED}>INTERACTION · t</text>
        <text x="56" y="68" fontFamily="Newsreader" fontSize="14" fill={INK} fontStyle="italic">"You're remarkably curious and open-minded."</text>
        <circle cx="180" cy="105" r={3+r0*2} fill="#F0386B" opacity={r0}/>
      </g>
      <g opacity={r1}><path d="M180,110 C180,130 180,140 180,155" stroke={INK} strokeWidth="1.2" fill="none" markerEnd="url(#arrow)"/></g>
      <g opacity={r1}><rect x="40" y="160" width="280" height="60" rx="30" fill={PERC_BG}/><text x="60" y="184" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill="#FF6F94">PERCEPTION  x_e,d</text><text x="60" y="206" fontFamily="JetBrains Mono" fontSize="11" fill={PERC_TX}>[openness: +0.45, confidence: 0.72]</text></g>
      <g opacity={Math.max(r1,r2)}><path d="M180,225 C180,245 180,255 180,270" stroke="#F0386B" strokeWidth="1.4" fill="none" markerEnd="url(#arrow-ember)"/></g>
      <g transform="translate(40,270)" opacity={Math.max(0.2,Math.min(1,r1*1.2))}>
        <text x="0" y="-8" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill={MUTED}>BELIEF LAYER  μ_e,d  ·  fast loop</text>
        <rect x="-4" y="-4" width="288" height="170" fill="none" stroke={INK} strokeOpacity="0.18" strokeWidth="1" rx="3"/>
        {["openness","conscient.","extravers.","agreeable.","neurotic."].map((label,i)=>{const y=18+i*28,cx=160,b=belief(i),curX=cx+b.current*90,baseX=cx+b.baseline*90,dl=Math.min(curX,baseX),dw=Math.abs(curX-baseX);return(<g key={i}><text x="0" y={y+4} fontFamily="JetBrains Mono" fontSize="10" fill={MUTED2}>{label}</text><line x1="70" y1={y} x2="250" y2={y} stroke={INK} strokeOpacity="0.12" strokeWidth="1"/><line x1={cx} y1={y-5} x2={cx} y2={y+5} stroke={INK} strokeOpacity="0.25" strokeWidth="1"/><rect x={dl} y={y-3} width={dw} height="6" fill="#F0386B" opacity={r3*0.25}/><line x1={baseX} y1={y-6} x2={baseX} y2={y+6} stroke={INK} strokeWidth={r2>0?"1.5":"0"} opacity={r2>0?1:0}/><circle cx={curX} cy={y} r="4" fill="#F0386B" opacity={r2}/></g>);})}
      </g>
      <g transform="translate(380,60)" opacity={r4}>
        <text x="0" y="-12" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill={MUTED}>RULE B · gate conditions</text>
        {[{label:"Magnitude",req:"≥ 0.25",state:"PASS"},{label:"Confidence",req:"≥ 0.70",state:"PASS"},{label:"Observations",req:"≥ 10",state:r4>0.7?"PASS":"..."}].map((g,i)=>(
          <g key={i} transform={`translate(0,${i*56})`}><rect x="0" y="0" width="340" height="44" rx="3" fill="none" stroke={g.state==="PASS"?"#F0386B":INK} strokeOpacity={g.state==="PASS"?"0.7":"0.2"} strokeWidth="1"/><text x="14" y="18" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="1" fill={INK} opacity="0.6">{g.label.toUpperCase()}</text><text x="14" y="34" fontFamily="Newsreader" fontStyle="italic" fontSize="15" fill={INK}>{g.req}</text><text x="326" y="28" textAnchor="end" fontFamily="JetBrains Mono" fontSize="11" fill={g.state==="PASS"?"#F0386B":MUTED} fontWeight={g.state==="PASS"?"500":"400"}>{g.state}</text></g>
        ))}
        <g opacity={r5} transform="translate(0,178)"><rect x="0" y="0" width="340" height="40" rx="3" fill="#F0386B"/><text x="170" y="25" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" letterSpacing="3" fill="#F4ECDE">REFLECTION TRIGGERED · t = 20</text></g>
      </g>
      <g transform="translate(380,320)" opacity={Math.max(0.2,r5*0.6+r4*0.4)}>
        <text x="0" y="-12" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill={MUTED}>TRAIT VECTOR  τ_k  ·  slow loop</text>
        <rect x="-4" y="-4" width="348" height="170" rx="3" fill="#5B3FE0" fillOpacity={dark?"0.10":"0.04"} stroke="#5B3FE0" strokeOpacity="0.3" strokeWidth="1"/>
        {["openness","conscient.","extravers.","agreeable.","neurotic."].map((label,i)=>{const y=18+i*28,cx=200,tx=cx+ts(i)*400;return(<g key={i}><text x="0" y={y+4} fontFamily="JetBrains Mono" fontSize="10" fill="#9A7FFF">{label}</text><line x1="80" y1={y} x2="320" y2={y} stroke="#5B3FE0" strokeOpacity={dark?"0.30":"0.15"} strokeWidth="1"/><line x1={cx} y1={y-5} x2={cx} y2={y+5} stroke="#5B3FE0" strokeOpacity="0.45" strokeWidth="1"/><circle cx={cx} cy={y} r="3.5" fill="#9A7FFF" opacity={0.35}/><circle cx={tx} cy={y} r="4" fill="#9A7FFF" opacity={r5}/><line x1={cx} y1={y} x2={tx} y2={y} stroke="#9A7FFF" strokeWidth="1.5" strokeDasharray="2 2" opacity={r5*0.7}/></g>);})}
        <text x="170" y="160" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" fill="#9A7FFF" opacity={r5}>∆ ≤ 0.08 — bounded step</text>
      </g>
      <g opacity={r4}><path d="M334,355 C360,355 360,200 380,200" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3"/></g>
      <g opacity={r5}><path d="M550,260 C550,290 550,300 550,318" stroke="#F0386B" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-ember)"/><text x="558" y="295" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" fill="#F0386B">aggregate</text></g>
      <g opacity={Math.max(0,r5-0.5)*2}><path d="M40,500 L334,500" stroke="#F0386B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6"/><text x="40" y="520" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" fill="#F0386B">↻ BASELINE RESET · new epoch begins</text></g>
    </svg>
  );
};

const Diagram=({theme})=>{
  const stageRef=React.useRef(null);const[progress,setProgress]=React.useState(0);
  React.useEffect(()=>{const onScroll=()=>{const el=stageRef.current;if(!el)return;const rect=el.getBoundingClientRect(),vh=window.innerHeight,p=Math.max(0,Math.min(1,-rect.top/(rect.height-vh)));setProgress(p);};onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);},[]);
  const scaled=progress*STEPS.length,step=Math.min(STEPS.length-1,Math.floor(scaled)),sub=scaled-step;
  return(
    <section className="diagram-section" id="architecture">
      <div className="container">
        <div className="diagram-header">
          <div className="eyebrow" style={{marginBottom:24}}>05 — How it works</div>
          <h2 className="diagram-title display">A modular architecture<br />for <em>emergent identity.</em></h2>
          <p className="diagram-lead">Rather than overtraining a single monolithic model, we approach personality as a system of <em>interacting cognitive functions.</em></p>
          <div className="architecture-concepts">
            <div className="architecture-concept">
              <div className="architecture-concept-label">Functional persona nodes</div>
              <div className="architecture-concept-name">Decomposed identity.</div>
              <p className="architecture-concept-body">Memory, emotion, motivation, reflection, social behavior, preference, and perspective — each modeled as its own behavioral system.</p>
            </div>
            <div className="architecture-concept">
              <div className="architecture-concept-label">Shared state + memory</div>
              <div className="architecture-concept-name">A persistent inner life.</div>
              <p className="architecture-concept-body">These systems communicate through persistent memory and shared internal state, enabling continuity across interactions.</p>
            </div>
            <div className="architecture-concept">
              <div className="architecture-concept-label">Emergent identity</div>
              <div className="architecture-concept-name">Recognizable over time.</div>
              <p className="architecture-concept-body">Stable, personality-like behavior emerges naturally — adaptive, recognizable, and evolving with each conversation.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="diagram-stage" ref={stageRef}>
        <div className="diagram-sticky">
          <div className="diagram-steps">{STEPS.map((s,i)=><div key={s.n} className={"diagram-step "+(i===step?"is-active":"")}><div className="diagram-step-n">Step {s.n}</div><div className="diagram-step-title">{s.title}</div><div className="diagram-step-desc">{s.desc}</div></div>)}</div>
          <div className="diagram-canvas-wrap"><div className="diagram-canvas"><DiagramCanvas step={step} sub={sub} theme={theme}/></div></div>
        </div>
      </div>
    </section>
  );
};

const USECASES=[
  {n:"I",h:"AI Companions",body:"Long-running companions that hold shape at month 12, not just last Tuesday. Identity that earns trust by surviving thousands of conversations intact.",glyph:"○"},
  {n:"II",h:"Branded Agents",body:"Customer-facing agents that hold a brand's voice under pressure. Different tones for different users; the same identity underneath.",glyph:"▣"},
  {n:"III",h:"Education",body:"Tutors and learning agents whose tone, patience, and perspective deepen alongside the student — a consistent presence across an entire arc of study.",glyph:"◇"},
  {n:"IV",h:"Customer Experience",body:"Service agents that remember context, carry continuity, and feel like a familiar contact — not a fresh stranger on every ticket.",glyph:"▲"},
  {n:"V",h:"Home AI",body:"Assistants that live with you for years. Their preferences mature alongside yours — not whichever way the wind blew last week.",glyph:"◐"},
  {n:"VI",h:"Entertainment & Digital Personalities",body:"NPCs, hosts, and digital personas with opinions, contradictions, and memory — characters that scale to millions without dissolving into sameness.",glyph:"★"},
];
const UseCases=()=>(
  <section className="section" id="usecases">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>06 — Market opportunity</div>
      <h2 className="usecases-title display">Where interaction matters,<br /><em>personality becomes the product.</em></h2>
      <p className="usecases-lead">As AI spreads across industries, differentiation will no longer come from intelligence alone. It will come from <em>behavior, communication, and emotional experience.</em></p>
      <div className="usecases-grid">{USECASES.map(u=><div className="usecase" key={u.n}><div className="usecase-head"><span className="usecase-num">{u.n}</span><span className="usecase-glyph">{u.glyph}</span></div><h3 className="usecase-h">{u.h}.</h3><p className="usecase-body">{u.body}</p></div>)}</div>
      <p className="usecases-closing">In the AI era, personality is not a feature.<br /><em>It is the experience itself.</em></p>
    </div>
  </section>
);

const WHYNOW_ITEMS = [
  {n:"01", text:"How AI behaves."},
  {n:"02", text:"How it is remembered."},
  {n:"03", text:"How people emotionally relate to it."},
];

const WhyNow = () => (
  <section className="whynow-section" id="whynow">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>07 — Why now</div>
      <h2 className="whynow-title display">The next AI race won't be won<br />by <em>intelligence alone.</em></h2>
      <div className="whynow-grid">
        <div className="whynow-body">
          <p>As models become more powerful and more accessible, intelligence will increasingly <strong>commoditize.</strong></p>
          <p>The advantage will move up the stack — into the layer where AI is felt, remembered, and trusted.</p>
        </div>
        <div className="whynow-list">
          {WHYNOW_ITEMS.map(i => (
            <div className="whynow-item" key={i.n}>
              <span className="whynow-num">{i.n}</span>
              <span className="whynow-text">{i.text}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="whynow-closing">The companies that define the next era of AI will not simply build smarter systems.<br /><em>They will build systems people connect with.</em></p>
    </div>
  </section>
);

const TEAM_MEMBERS = [
  {name: "Marc Mechkak", role: "CEO & Co-founder", url: "https://www.linkedin.com/in/marc-mechkak-9083492a/"},
  {name: "Hasan Mavlonov", role: "CTO & Co-founder", url: "https://github.com/hasan-mavlonov"},
  {name: "François Mechkak", role: "Founding AI Engineer", url: "https://www.linkedin.com/in/fran%C3%A7ois-r%C3%A9gis-mechkak-a360183b/"},
];

const Team = () => (
  <section className="section" id="team">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>08 — Team</div>
      <h2 className="usecases-title display">Founded by builders who understand<br /><em>the complexity of personality.</em></h2>
      <div className="usecases-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
        {TEAM_MEMBERS.map(member => (
          <div className="usecase" key={member.name} style={{borderRight: 'none', borderBottom: 'none', borderLeft: '1px solid var(--hairline)', borderTop: '1px solid var(--hairline)'}}>
            <h3 className="usecase-h">{member.name}</h3>
            <p className="usecase-body" style={{fontSize: '16px', color: 'var(--ink-2)', marginTop: 'auto'}}>{member.role}</p>
            <a href={member.url} target="_blank" rel="noopener noreferrer" className="btn" style={{marginTop: '16px', display: 'inline-flex', alignSelf: 'flex-start'}}>View profile →</a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const JOIN_AREAS = [
  {n:"01", name:"AI & Agent Architecture"},
  {n:"02", name:"Cognitive Systems"},
  {n:"03", name:"Memory & Behavioral Modeling"},
  {n:"04", name:"Product Design"},
  {n:"05", name:"Creative Technology"},
  {n:"06", name:"Interaction Design"},
  {n:"07", name:"Research"},
  {n:"08", name:"Applied Psychology"},
  {n:"09", name:"Experimental Prototyping"},
];

const JoinUs = () => (
  <section className="join-section" id="join">
    <div className="container">
      <div className="eyebrow" style={{marginBottom:24}}>09 — Join us</div>
      <h2 className="join-title display">We're building the<br /><em>next interface layer</em> for AI.</h2>
      <p className="join-intro">Mindform sits at the intersection of <strong>AI, psychology, design, storytelling, and human behavior.</strong> We're looking for builders, researchers, designers, and thinkers shaping how humans interact with intelligence over the next decade.</p>

      <div className="join-areas-label">Seeking bright minds across these fields to partner up :</div>
      <div className="join-areas">
        {JOIN_AREAS.map(a => (
          <div className="join-area" key={a.n}>
            <span className="join-area-n">{a.n}</span>
            <span>{a.name}</span>
          </div>
        ))}
      </div>

      <div className="join-culture">
        <div className="label">Culture</div>
        <p>We value <span className="accent">curiosity over convention.</span></p>
        <p>Systems thinking over hype.</p>
        <p>Taste, experimentation, and long-term vision.</p>
        <p style={{marginTop:20,opacity:0.85}}>This is not about building another chatbot.<br /><span className="accent">It is about defining how AI will be experienced.</span></p>
      </div>

      <p className="join-closing">If you believe intelligence should feel more human,<br />intentional, and alive — <em>we should talk.</em></p>

      <div className="join-cta-row">
        <a href="mailto:hello@mindform-ai.com?subject=Joining%20Mindform" className="btn btn-primary">Join Mindform →</a>
        <a href={window.SITE_URLS.careers} className="btn btn-outline">Open roles →</a>
        <a href="mailto:hello@mindform-ai.com" className="btn btn-clear">Contact us →</a>
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="final-section" id="final">
    <div className="container">
      <h2 className="final-statement display">AI is becoming universal infrastructure.<br />The <em>interface layer</em> will define the experience.</h2>
      <p className="final-support">Mindform is building the personality layer for the next generation of intelligent systems.</p>
      <div className="final-cta-row">
        <a href="#join" className="btn btn-primary">Build with us →</a>
        <a href="mailto:hello@mindform-ai.com?subject=Mindform%20waitlist" className="btn">Join the waitlist</a>
      </div>
    </div>
  </section>
);

const Footer=()=>{
  const urls=window.SITE_URLS;
  return(
    <footer className="footer" id="contact">
      <div className="container">
        <h2 className="footer-tagline display">Personality is not a feature.<br /><em>It is the product.</em></h2>
        <div className="footer-taglist">
          <div className="footer-tagitem">The interface layer for AI personality</div>
          <div className="footer-tagitem">AI that develops identity over time</div>
          <div className="footer-tagitem">Building AI people relate to</div>
          <div className="footer-tagitem">Where intelligence becomes presence</div>
        </div>
        <div className="footer-row">
          <div className="footer-col"><h5>System</h5><ul><li><a href="#bigpicture">The big picture</a></li><li><a href="#vision">Vision</a></li><li><a href="#solution">Solution</a></li><li><a href="#architecture">How it works</a></li></ul></div>
          <div className="footer-col"><h5>Markets</h5><ul><li><a href="#usecases">Where it goes</a></li><li><a href="#whynow">Why now</a></li><li><a href="#demo">Live demo</a></li><li><a href={urls.researchPaper}>Research paper</a></li></ul></div>
          <div className="footer-col"><h5>Company</h5><ul><li><a href="#join">Join us</a></li><li><a href={urls.careers}>Careers</a></li><li><a href="mailto:hello@mindform-ai.com">Contact</a></li><li><a href="https://github.com/hasan-mavlonov/stable_mind_v0.1" target="_blank" rel="noreferrer">Open source</a></li></ul></div>
          <div className="footer-col"><h5>Account</h5><ul>{window.IS_AUTHENTICATED?<><li><a href={urls.profile}>Profile</a></li><li><a href={urls.logout}>Log out</a></li></>:<li><a href={urls.login}>Log in / Register</a></li>}<li><a href="mailto:hello@mindform-ai.com">hello@mindform-ai.com</a></li></ul></div>
        </div>
        <div className="footer-meta"><span>© 2026 Mindform · mindform-ai.com</span><span>The interface layer for AI personality</span></div>
      </div>
    </footer>
  );
};

const App=()=>{
  const [theme, toggleTheme] = useTheme();
  return (
    <React.Fragment>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main id="main">
        <Hero/>
        <BigPicture/>
        <Problem/>
        <Vision/>
        <Solution/>
        <Diagram theme={theme} />
        <Demo/>
        <UseCases/>
        <WhyNow/>
        <Team/>
        <JoinUs/>
        <FinalCTA/>
      </main>
      <Footer/>
    </React.Fragment>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
