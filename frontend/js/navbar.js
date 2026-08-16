(function () {
  const area = document.getElementById('navAuthArea');
  if (!area) return;

  const user = Api.currentUser();
  const dashMap = {
    STUDENT: 'student-dashboard.html',
    COMPANY: 'company-dashboard.html',
    ADMIN:   'admin-dashboard.html'
  };

  if (!user) {
    area.innerHTML = `
      <a href="login.html" class="btn btn-outline-light btn-sm">Se connecter</a>
      <a href="register.html" class="btn btn-gold btn-sm">Publier une offre</a>
    `;
  } else {
    area.innerHTML = `
      <span style="color:rgba(255,255,255,0.85);font-size:0.9rem;font-weight:600;">
        ${escapeHtml(user.fullName.split(' ')[0])}
      </span>
      <a href="${dashMap[user.role] || 'index.html'}" class="btn btn-outline-light btn-sm">
        Tableau de bord
      </a>
      <button class="btn btn-gold btn-sm" onclick="Api.logout()">
        Se déconnecter
      </button>
    `;
  }
})();