// Interacciones generales
const isMobile = window.matchMedia('(max-width:760px)').matches;
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(opened));
    burger.setAttribute('aria-label', opened ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); burger.setAttribute('aria-expanded','false');
  }));
}

//  cerrar el menú con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
    nav.classList.remove('open'); burger.setAttribute('aria-expanded','false');
  }
});

// barra de progreso de lectura 
const progressBar = document.createElement('div');
progressBar.id = 'reading-progress';
document.body.prepend(progressBar);
const styleBar = document.createElement('style');
styleBar.textContent = `
  #reading-progress{position:fixed;top:0;left:0;height:3px;width:0;background:var(--green);z-index:100;transition:width .1s linear}
`;
document.head.appendChild(styleBar);
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = (scrolled * 100) + '%';
}, {passive:true});

// Animación de aparición progresiva. Si el navegador no soporta IntersectionObserver, el contenido sigue visible.
const revealEls = document.querySelectorAll('.sec > .split, .mblock, .dish, .seasons div, .product-card');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
  }), {threshold:0.12});
  revealEls.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

//  animación de aparición con retraso escalonado para las filas de platos
document.querySelectorAll('.row .dish').forEach((dish, i) => {
  dish.style.transitionDelay = (i % 6) * 0.06 + 's';
});


// efecto de brillo que sigue el cursor en el hero (desktop)
const hero = document.querySelector('.hero');
if (hero && !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  });
  const glowStyle = document.createElement('style');
  glowStyle.textContent = `
    .hero::after{content:"";position:absolute;inset:0;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(184,196,145,.12),transparent 60%);pointer-events:none;z-index:0}
  `;
  document.head.appendChild(glowStyle);
}

// Destello sutil en el hero
if (hero && !isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const glow = document.createElement('div'); glow.className='ember'; hero.appendChild(glow);
  let bright = false;
  setInterval(() => { bright = !bright; glow.style.opacity = bright ? '.5' : '.2'; }, 1200);
}

// botones con micro-interacción 
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.2;
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .btn{position:relative;overflow:hidden}
  .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.35);transform:scale(0);animation:ripple .6s ease-out;pointer-events:none}
  @keyframes ripple{to{transform:scale(1);opacity:0}}
`;
document.head.appendChild(rippleStyle);

// volver arriba flotante
const backTop = document.createElement('button');
backTop.className = 'back-top';
backTop.setAttribute('aria-label', 'Volver arriba');
backTop.innerHTML = '↑';
document.body.appendChild(backTop);
const backTopStyle = document.createElement('style');
backTopStyle.textContent = `
  .back-top{position:fixed;right:18px;bottom:18px;width:46px;height:46px;border:1px solid var(--green);background:var(--dark);color:var(--green);font-size:20px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;z-index:60}
  .back-top.show{opacity:1;pointer-events:auto}
  .back-top:hover{transform:translateY(-3px)}
`;
document.head.appendChild(backTopStyle);
window.addEventListener('scroll', () => {
  backTop.classList.toggle('show', window.scrollY > 500);
}, {passive:true});
backTop.addEventListener('click', () => window.scrollTo({top:0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));

// Formulario de reservas: valida que la fecha sea domingo y abre un correo con los datos.
const rf = document.getElementById('rf');
if (rf) {
  const dateInput = document.getElementById('booking-date');
  const error = document.getElementById('booking-error');
  const today = new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  if (dateInput) dateInput.min = today.toISOString().slice(0,10);
  rf.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(rf);
    const date = new Date(`${data.get('fecha')}T12:00:00`);
    if (date.getDay() !== 0) { error.hidden=false; dateInput.focus(); return; }
    error.hidden=true;
    const subject = encodeURIComponent('Solicitud de reserva — Jardín del Fuego');
    const body = encodeURIComponent(`Hola, quisiera solicitar una reserva.\nFecha: ${data.get('fecha')}\nComensales: ${data.get('personas')}\nTeléfono: ${data.get('telefono')}\nEmail: ${data.get('email')}\nRestricciones: ${data.get('restricciones') || 'No indicadas'}\n\nEntiendo que la reserva queda pendiente de confirmación.`);
    document.getElementById('ok').hidden=false;
    window.location.href = `mailto:jardindelfuego@gmail.com?subject=${subject}&body=${body}`;
  });
}

// mensaje de validación en vivo en el formulario (fecha en domingo)
if (rf) {
  const dateInput = document.getElementById('booking-date');
  const error = document.getElementById('booking-error');
  if (dateInput && error) {
    dateInput.addEventListener('input', () => {
      if (dateInput.value) {
        const d = new Date(`${dateInput.value}T12:00:00`);
        error.hidden = d.getDay() === 0;
      }
    });
  }
}

// Tienda demo: filtros, buscador, carrito temporal y armado de pedido por WhatsApp.
const grid = document.getElementById('product-grid');
if (grid) {
  const cards = [...grid.querySelectorAll('.product-card')];
  const search = document.getElementById('product-search');
  const category = document.getElementById('category-filter');
  const tabs = [...document.querySelectorAll('.filter-tab')];
  const count = document.getElementById('cart-count');
  const panel = document.getElementById('cart-panel');
  const cartItems = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const cart = new Map();
  const money = n => '$ ' + n.toLocaleString('es-AR');
  let activeCategory = 'todos';
  function filterProducts() {
    const term = (search.value || '').trim().toLocaleLowerCase('es');
    let visible = 0;
    cards.forEach(card => {
      const okCategory = activeCategory === 'todos' || card.dataset.category === activeCategory;
      const okTerm = card.dataset.name.toLocaleLowerCase('es').includes(term);
      card.hidden = !(okCategory && okTerm); if (!card.hidden) visible++;
    });
    document.getElementById('no-results').hidden = visible !== 0;
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.filter === activeCategory));
    category.value = activeCategory;
  }
  tabs.forEach(tab => tab.addEventListener('click', () => { activeCategory=tab.dataset.filter; filterProducts(); }));
  category.addEventListener('change', () => { activeCategory=category.value; filterProducts(); });
  search.addEventListener('input', filterProducts);

  //  atajos de teclado para la tienda
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  });

  //  cerrar el carrito con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && !panel.hidden) {
      panel.hidden = true; document.getElementById('cart-toggle').setAttribute('aria-expanded','false');
    }
  });

  function renderCart() {
    let total=0, units=0; cartItems.innerHTML='';
    cart.forEach((item,id) => {
      total += item.price*item.qty; units += item.qty;
      const row=document.createElement('div'); row.className='cart-item';
      const name=document.createElement('div'); name.innerHTML=`<strong>${item.name}</strong><br>${money(item.price)} c/u`;
      const controls=document.createElement('div'); controls.className='cart-item-controls';
      const minus=document.createElement('button'); minus.textContent='−'; minus.setAttribute('aria-label',`Quitar una unidad de ${item.name}`);
      const qty=document.createElement('span'); qty.textContent=item.qty;
      const plus=document.createElement('button'); plus.textContent='+'; plus.setAttribute('aria-label',`Agregar una unidad de ${item.name}`);
      const remove=()=>{if(item.qty<=1)cart.delete(id);else item.qty--;renderCart();};
      minus.addEventListener('click',remove); plus.addEventListener('click',()=>{item.qty++;renderCart();});
      controls.append(minus,qty,plus); row.append(name,controls); cartItems.append(row);
    });
    count.textContent=units; totalEl.textContent=money(total);
    if (!cart.size) cartItems.innerHTML='<p>Tu bolsa está vacía. Agregá algún producto para empezar.</p>';
  }
  cards.forEach(card => card.querySelector('.add-to-cart').addEventListener('click', () => {
    const id=card.dataset.name;
    if(cart.has(id)) cart.get(id).qty++;
    else cart.set(id,{name:card.querySelector('h3').textContent,price:Number(card.dataset.price),qty:1});
    renderCart();
    panel.hidden=false; document.getElementById('cart-toggle').setAttribute('aria-expanded','true');
  }));
  document.getElementById('cart-toggle').addEventListener('click', e => {
    panel.hidden=!panel.hidden; e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));
  });
  document.getElementById('cart-close').addEventListener('click',()=>{panel.hidden=true;document.getElementById('cart-toggle').setAttribute('aria-expanded','false');});
  document.getElementById('checkout').addEventListener('click',()=>{
    if(!cart.size){alert('Tu bolsa está vacía.');return;}
    const lines=[...cart.values()].map(item=>`• ${item.qty} x ${item.name} — ${money(item.price*item.qty)}`);
    const total=[...cart.values()].reduce((sum,item)=>sum+item.price*item.qty,0);
    const message=encodeURIComponent(`Hola, Jardín del Fuego. Quiero consultar por este pedido:\n\n${lines.join('\n')}\n\nTotal estimado: ${money(total)}\n¿Podemos coordinar disponibilidad y retiro?`);
    // Reemplazar por el número real de WhatsApp del emprendimiento antes de publicar.
    window.open(`https://wa.me/?text=${message}`,'_blank','noopener');
  });

  //  guardar el carrito en localStorage para que sobreviva al recargar
  const saved = localStorage.getItem('jdf-cart');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.forEach(({id, name, price, qty}) => cart.set(id, {name, price, qty}));
      renderCart();
    } catch (_) {}
  }
  const saveCart = () => localStorage.setItem('jdf-cart', JSON.stringify([...cart.entries()].map(([id, v]) => ({id, ...v}))));
  const origRender = renderCart;
  renderCart = function() { origRender(); saveCart(); };

  renderCart();
}
