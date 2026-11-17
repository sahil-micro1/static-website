
// V6: the hero video is static. It fills the hero ([data-bruce="hero"]) and scrolls away with it;
// nothing travels on scroll. Bruce's message ([data-bruce="cue"]) rests on the video and, with a mouse,
// follows the pointer over the hero and eases after it; over the hero's copy it fades out. Every element is found by its data-bruce
// attribute (never by class).
(function () {
  var find = function (name, scope) { return (scope || document).querySelector('[data-bruce="' + name + '"]'); };

  var hero = find('hero');
  var box = find('footage', hero || document);
  var cue = find('cue');
  var sticker = find('sticker', cue || document);
  if (!hero || !box || !cue || !sticker) return;

  var content = find('content', hero);
  var slot = find('cue-slot');
  var heroLightbox = find('lightbox');
  var header = find('header');
  var toggle = find('toggle', box);
  var video = box.querySelector('video');

  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var phone = matchMedia('(max-width: 767px)');

  var frame = 0, pointer = null, cuePos = null, overToggle = false;
  // Where the message rests, as a share of the hero: with a mouse, left of the title (94, 554 in the
  // 1440 by 900 frame); on touch, in the room kept above the title (cue-slot).
  var rest = { x: 94 / 1440, y: 554 / 900 };

  function measureRest() {
    if (slot) slot.style.display = fine.matches ? 'none' : 'block';
    if (fine.matches || !slot) { rest = { x: 94 / 1440, y: 554 / 900 }; return; }
    var s = slot.getBoundingClientRect(), h = hero.getBoundingClientRect();
    rest = { x: (s.left - h.left) / h.width, y: (s.top - h.top) / h.height };
  }

  // Is the pointer over the hero's copy ([data-bruce="content"])? Measured by its box, so the gaps
  // between the title, text and button count too.
  function overContent() {
    if (!pointer || !content) return false;
    var r = content.getBoundingClientRect();
    return pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
  }

  function place() {
    frame = 0;
    // Over the copy the message fades out where it is (state "hidden") and the normal cursor is back;
    // moving off the copy fades it in again and it picks up the pointer.
    if (overContent()) {
      cue.setAttribute('data-bruce-state', 'hidden');
      hero.removeAttribute('data-bruce-state');
      return;
    }
    if (cue.getAttribute('data-bruce-state') === 'hidden') cue.removeAttribute('data-bruce-state');
    var h = hero.getBoundingClientRect();
    var w = h.width, ht = h.height, want;
    if (pointer) {
      // The sticker's centre on the pointer (pointer kept in screen terms, so it holds while scrolling).
      want = {
        x: pointer.x - h.left - (sticker.offsetLeft + sticker.offsetWidth / 2),
        y: pointer.y - h.top - (sticker.offsetTop + sticker.offsetHeight / 2)
      };
    } else {
      want = { x: rest.x * w, y: rest.y * ht };
    }
    // Always inside the hero, clear of its edges.
    var edge = 8;
    want.x = Math.min(Math.max(want.x, edge), w - cue.offsetWidth - edge);
    want.y = Math.min(Math.max(want.y, edge), ht - cue.offsetHeight - edge);
    // Only the pointer chase is eased, so it reads as carried rather than stuck to the pointer.
    var ease = (reduce.matches || !cuePos) ? 1 : 0.35;
    if (!cuePos) cuePos = { x: want.x, y: want.y };
    cuePos.x += (want.x - cuePos.x) * ease;
    cuePos.y += (want.y - cuePos.y) * ease;
    cue.style.translate = cuePos.x.toFixed(2) + 'px ' + cuePos.y.toFixed(2) + 'px';

    var following = Boolean(pointer);
    if (following) hero.setAttribute('data-bruce-state', 'following');
    else hero.removeAttribute('data-bruce-state');
    cue.style.pointerEvents = following ? 'none' : '';
    // On phones the pause button sits top right, below the header.
    if (toggle) toggle.style.top = phone.matches ? (12 + (header ? header.offsetHeight : 0)) + 'px' : '';

    if (Math.abs(want.x - cuePos.x) + Math.abs(want.y - cuePos.y) > 0.5) request();
  }

  function request() { if (!frame) frame = requestAnimationFrame(place); }

  // Reduced motion: the video holds on its first frame instead of looping.
  function useMode() {
    cuePos = null;
    if (video) {
      if (reduce.matches) video.pause();
      else if (video.paused && video.autoplay) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    }
    measureRest();
    request();
  }

  function remeasure() { measureRest(); request(); }

  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
  addEventListener('scroll', function () { if (pointer) request(); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  if (reduce.addEventListener) { reduce.addEventListener('change', useMode); fine.addEventListener('change', useMode); }
  useMode();

  // With a mouse anywhere over the hero (the video, the title, the copy) the message follows the
  // pointer; it only goes back to its resting spot once the pointer leaves the hero, so passing over
  // the title doesn't send it back. Hovering the pause button hides it.
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || overToggle) return;
    var inside = hero.contains(e.target) && !(header && header.contains(e.target));
    if (inside) { pointer = { x: e.clientX, y: e.clientY }; request(); }
    else if (pointer) { pointer = null; request(); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { if (pointer) { pointer = null; request(); } });
  if (toggle) {
    toggle.addEventListener('pointerenter', function () { overToggle = true; pointer = null; cue.style.opacity = '0'; request(); });
    toggle.addEventListener('pointerleave', function () { overToggle = false; cue.style.opacity = ''; });
  }

  // Clicking the video (not its pause button) opens Bruce's full message in the Webflow lightbox.
  box.addEventListener('click', function (e) {
    if (toggle && toggle.contains(e.target)) return;
    if (heroLightbox) heroLightbox.click();
  });
})();
