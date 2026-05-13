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
    if (link.getAttribute('href') === path) {
      link.classList.add('is-active');
    }
  });
})();
