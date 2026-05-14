(function () {
  // Nav scroll shadow
  var nav = document.getElementById('site-nav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 40) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mark active nav link based on current path
  var links = document.querySelectorAll('.nav-links a');
  var path = window.location.pathname;
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path || (path !== '/' && href !== '/' && path.indexOf(href) === 0)) {
      link.classList.add('is-active');
    }
  });

  // Theme toggle
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var setTheme = function (theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (toggle) {
      toggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  };
  if (toggle) {
    setTheme(root.getAttribute('data-theme') || 'light');
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Follow system theme if user hasn't explicitly chosen
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var sysChange = function (e) {
      try {
        if (localStorage.getItem('theme')) return;
      } catch (err) {}
      setTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', sysChange);
    else if (mq.addListener) mq.addListener(sysChange);
  }

  // Mobile menu
  var menuBtn = document.getElementById('nav-menu-btn');
  var menu = document.querySelector('.site-nav .nav-links');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a link is clicked
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
