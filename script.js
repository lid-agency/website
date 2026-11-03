(function(){
  var ids=['01','04','06','08','09','10','12','13','14','15','16','17','18','19'];
  var wall=document.getElementById('wall');
  if(wall) ids.forEach(function(n){
    var d=document.createElement('div');d.className='clip';
    d.innerHTML='<video data-src="media/v'+n+'.mp4" poster="media/v'+n+'.jpg" muted loop playsinline preload="none" aria-label="Съёмка команды LID"></video>';
    wall.appendChild(d);
  });

  // the site's motion (clips, case charts, reveals, the menu row) runs on every phone, also with reduce motion on:
  // the owner wants it always on, and it is gentle (fades, slow loop, short counters)
  var reduce=false;
  var vids=[].slice.call(document.querySelectorAll('video[data-src]'));
  function play(v){ if(!v.src) v.src=v.getAttribute('data-src'); var p=v.play(); if(p&&p.catch) p.catch(function(){}); }

  vids.forEach(function(v){
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Включить или остановить видео');
    b.addEventListener('click',function(){ if(v.paused){ v.dataset.user='1'; play(v);} else { v.dataset.user='0'; v.pause(); } });
    v.parentNode.appendChild(b);
  });

  // clips start as soon as they scroll into view; until then the poster (the clip's first frame) shows.
  // Some phones and in-app browsers allow video only after a touch: the first touch anywhere starts what is on screen
  var onScreen=[];
  if('IntersectionObserver' in window) (function(){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v=e.target, i=onScreen.indexOf(v);
        if(e.isIntersecting){ if(i<0) onScreen.push(v); if(v.dataset.user!=='0') play(v); }
        else { if(i>=0) onScreen.splice(i,1); if(!v.paused) v.pause(); }
      });
    },{threshold:.35});
    vids.forEach(function(v){ io.observe(v); });
    var wake=function(){ onScreen.forEach(function(v){ if(v.paused&&v.dataset.user!=='0') play(v); }); };
    document.addEventListener('touchend',wake,{passive:true}); document.addEventListener('click',wake);
  })();

  // reveal once on scroll; whatever is on screen at load stays as is
  var rv=[].slice.call(document.querySelectorAll('main > section:not(.hero):not(.phero) .h2, .dirs .dir, .ladder a, .tariffs .tf, .steps li, .vals .val, .zones li, .ev-grid > *, .rent li, .bridge, .case-photos img, .once-card, .duo .sc, .proof, .split-r, .pc, .idx li'));
  if('IntersectionObserver' in window){
    var vh=window.innerHeight;
    rv=rv.filter(function(el){ return el.getBoundingClientRect().top>vh; });
    rv.forEach(function(el){ el.classList.add('rv'); });
    function show(el,delay){
      el.style.transitionDelay=delay+'ms';
      el.classList.add('in');
      setTimeout(function(){ el.classList.remove('rv','in'); el.style.transitionDelay=''; },delay+1000);
    }
    var ro=new IntersectionObserver(function(es){
      var k=0;
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        ro.unobserve(e.target);
        show(e.target,Math.min(k++,4)*80);
      });
    },{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){ ro.observe(el); });
    // safety net: after a fast jump the observer can miss a block that is already on screen, so check positions directly
    var rvSweep=setInterval(function(){
      var left=0, bottom=window.innerHeight*.95;
      rv.forEach(function(el){ if(!el.classList.contains('rv')||el.classList.contains('in')) return; left++; if(el.getBoundingClientRect().top<bottom){ ro.unobserve(el); show(el,0); } });
      if(!left) clearInterval(rvSweep);
    },400);

    // the expensive card catches the light once
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ so.unobserve(e.target); e.target.classList.add('shine'); } });
    },{threshold:.35});
    [].forEach.call(document.querySelectorAll('.tf.dk'),function(el){ so.observe(el); });

    // 200 m2 counts up
    if(!reduce) [].forEach.call(document.querySelectorAll('[data-count]'),function(el){
      var to=+el.getAttribute('data-count'),unit=el.textContent.replace(/^\d+/,'');
      var co=new IntersectionObserver(function(es){
        if(!es[0].isIntersecting) return;
        co.disconnect();
        var t0=performance.now();
        (function step(t){
          var p=Math.min((t-t0)/1100,1),e=1-Math.pow(1-p,3);
          el.textContent=Math.round(to*e)+unit;
          if(p<1) requestAnimationFrame(step);
        })(t0);
      },{threshold:.6});
      co.observe(el);
    });
  }

  // cases: numbers count up, charts grow, the step path lights up - once, when in view
  if('IntersectionObserver' in window && !reduce){
    document.documentElement.classList.add('anim');
    var fmt=function(v,dec){ return v.toLocaleString('ru-RU',{minimumFractionDigits:dec,maximumFractionDigits:dec}); };
    var nums=[].slice.call(document.querySelectorAll('.num[data-to]'));
    nums.forEach(function(el){ el.textContent=fmt(+(el.getAttribute('data-from')||0),+(el.getAttribute('data-dec')||0)); });
    var count=function(el){
        if(el.getAttribute('data-run')) return; el.setAttribute('data-run','1'); no.unobserve(el);
        var from=+(el.getAttribute('data-from')||0),to=+el.getAttribute('data-to'),dec=+(el.getAttribute('data-dec')||0);
        setTimeout(function(){
          var t0=performance.now();
          (function step(t){
            var p=Math.min((t-t0)/1300,1),k=1-Math.pow(1-p,3);
            el.textContent=fmt(from+(to-from)*k,dec);
            if(p<1) requestAnimationFrame(step);
          })(t0);
        },+(el.getAttribute('data-delay')||0));
    };
    var no=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) count(e.target); });
    },{threshold:.6});
    nums.forEach(function(el){ no.observe(el); });
    var go=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ go.unobserve(e.target); e.target.classList.add('go'); } });
    },{threshold:.35});
    var charts=[].slice.call(document.querySelectorAll('.vs, .ab, .done, .why'));
    charts.forEach(function(el){ go.observe(el); });
    // the same safety net for the case charts and counters
    var chartSweep=setInterval(function(){
      var h=window.innerHeight, left=0;
      charts.forEach(function(el){ if(el.classList.contains('go')) return; left++; var r=el.getBoundingClientRect(); if(r.top<h*.8&&r.bottom>0){ go.unobserve(el); el.classList.add('go'); } });
      nums.forEach(function(el){ if(el.getAttribute('data-run')) return; left++; var r=el.getBoundingClientRect(); if(r.top<h*.85&&r.bottom>0) count(el); });
      if(!left) clearInterval(chartSweep);
    },400);
  }

  // price ladder: after the jump, outline the card the visitor landed on
  [].forEach.call(document.querySelectorAll('.ladder a'),function(a){
    a.addEventListener('click',function(){
      var t=document.querySelector(a.getAttribute('href'));
      if(!t) return;
      if(t.classList.contains('rv')) show(t,0);
      t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit');
    });
  });

  // video review: plays muted while on screen, the button restarts it from the start with sound and controls
  [].forEach.call(document.querySelectorAll('.rev-video'),function(box){
    var v=box.querySelector('video'),b=box.querySelector('.rev-play');
    if(!v||!b) return;
    function go(){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
    b.addEventListener('click',function(){
      box.classList.add('sound');
      v.loop=false; v.muted=false; v.controls=true; v.currentTime=0; go();
    });
    if('IntersectionObserver' in window) (function(){
      var shown=false;
      new IntersectionObserver(function(es){
        es.forEach(function(e){
          shown=e.isIntersecting;
          if(e.isIntersecting){ if(!box.classList.contains('sound')) go(); }
          else if(!v.paused) v.pause();
        });
      },{threshold:.35}).observe(v);
      var wake=function(){ if(shown&&v.paused&&!box.classList.contains('sound')) go(); };
      document.addEventListener('touchend',wake,{passive:true}); document.addEventListener('click',wake);
    })();
  });

  // phone menu: the pills row runs slowly in a loop (the links are doubled so it wraps without a seam),
  // so it is clear there are more pages; a touch or swipe pauses it for a few seconds.
  // The round button opens the same links as a list (a tap on a link, outside or Esc closes it)
  var hdr=document.querySelector('.top'), mb=document.querySelector('.menu-btn'), nav=document.querySelector('.nav');
  if(nav){
    var links=[].slice.call(nav.querySelectorAll('a'));
    links.forEach(function(a){ var c=a.cloneNode(true); c.setAttribute('data-clone',''); c.setAttribute('aria-hidden','true'); c.tabIndex=-1; nav.appendChild(c); });
    var phone=window.matchMedia('(max-width:980px)'), speed=22, pos=0, last=null, until=0, paused=true;
    var loopW=function(){ var c=nav.querySelector('a[data-clone]'); return c ? c.offsetLeft-links[0].offsetLeft : 0; };
    var hold=function(){ until=Date.now()+3500; };
    nav.addEventListener('touchstart',hold,{passive:true}); nav.addEventListener('pointerdown',hold); nav.addEventListener('wheel',hold,{passive:true});
    nav.addEventListener('scroll',function(){ var w=loopW(); if(w>0&&nav.scrollLeft>=w) nav.scrollLeft-=w; },{passive:true});
    var tick=function(t){
      var dt=last===null?0:Math.min(64,t-last); last=t;
      var run=phone.matches&&Date.now()>until&&!(hdr&&hdr.classList.contains('open'));
      if(!run){ paused=true; }
      else{
        if(paused){ pos=nav.scrollLeft; paused=false; }
        var w=loopW(); pos+=speed*dt/1000; if(w>0&&pos>=w) pos-=w; nav.scrollLeft=pos;
      }
      requestAnimationFrame(tick);
    };
    if(!reduce){
      var startLoop=function(){ setTimeout(function(){ requestAnimationFrame(tick); },800); };
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(startLoop); else startLoop();
    }
  }
  if(hdr&&mb){
    var setMenu=function(open){ hdr.classList.toggle('open',open); mb.setAttribute('aria-expanded',open?'true':'false'); mb.setAttribute('aria-label',open?'Закрыть меню':'Меню'); };
    mb.addEventListener('click',function(){ setMenu(!hdr.classList.contains('open')); });
    [].forEach.call(hdr.querySelectorAll('.nav a'),function(a){ a.addEventListener('click',function(){ setMenu(false); }); });
    document.addEventListener('click',function(e){ if(hdr.classList.contains('open')&&!hdr.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&hdr.classList.contains('open')){ setMenu(false); mb.focus(); } });
  }

  var tg=document.getElementById('tg');
  if(tg) tg.addEventListener('click',function(){
    var off=document.body.classList.toggle('notes-off');
    tg.setAttribute('aria-pressed',off?'false':'true');
    tg.textContent='Пометки: '+(off?'выкл':'вкл');
  });
})();
