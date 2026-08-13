(function () {
  const area = document.getElementById('navAuthArea');
  if (!area) return;

  const user = Api.currentUser();
  const dashMap = {
    STUDENT: 'student-dashboard.html',
    COMPANY: 'company-dashboard.html',
    ADMIN: 'admin-dashboard.html'
  };

  if (!user) {
    area.innerHTML = `
      <button id="langToggleBtn" class="btn btn-outline-light btn-sm">🇬🇧 EN</button>
      <a href="login.html" class="btn btn-outline-light btn-sm" data-i18n="signIn">Se connecter</a>
      <a href="register.html" class="btn btn-gold btn-sm" data-i18n="postJob">Publier une offre</a>
    `;
  } else {
    area.innerHTML = `
      <button id="langToggleBtn" class="btn btn-outline-light btn-sm">🇬🇧 EN</button>
      <span class="text-white small d-none d-md-inline">
        ${escapeHtml(user.fullName.split(' ')[0])}
      </span>
      <a href="${dashMap[user.role]}" class="btn btn-outline-light btn-sm" data-i18n="dashboard">Tableau de bord</a>
      <button class="btn btn-gold btn-sm" onclick="Api.logout()" data-i18n="signOut">Se déconnecter</button>
    `;
  }
})();