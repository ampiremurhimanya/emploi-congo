const TRANSLATIONS = {
  fr: {
    // Navbar
    findJobs: 'Trouver un emploi',
    myApplications: 'Mes candidatures',
    postJob: 'Publier une offre',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    dashboard: 'Tableau de bord',

    // Hero
    heroTitle: 'Votre carrière commence ici',
    heroTitleHighlight: 'commence ici',
    heroSubtitle: 'Connecter les talents congolais avec les meilleures opportunités locales et internationales.',
    searchPlaceholder: 'Titre du poste, mots-clés...',
    companyPlaceholder: 'Nom de la société',
    searchBtn: 'Rechercher',

    // Stats
    activeOpportunities: 'Offres actives',
    partnerCompanies: 'Sociétés partenaires',
    registeredStudents: 'Étudiants inscrits',

    // Latest opportunities
    latestOpportunities: 'Dernières opportunités',
    latestSubtitle: 'Offres vérifiées publiées par notre équipe.',
    applyNow: 'Postuler',
    viewAll: 'Voir tout →',
    deadline: 'Date limite',

    // Role cards
    tailoredTitle: 'Une plateforme pour tous',
    tailoredSubtitle: 'Étudiants, entreprises et ONG — une seule plateforme.',
    forStudents: 'Pour les étudiants',
    forStudentsDesc: [
      'Candidature en un clic avec votre profil',
      'Suivi de vos candidatures en temps réel',
      'Offres vérifiées de sociétés congolaises et internationales'
    ],
    forCompanies: 'Pour les entreprises & ONG',
    forCompaniesDesc: [
      'Accès aux meilleurs talents congolais',
      'Gestion simplifiée des candidatures',
      'Visibilité auprès de milliers d\'étudiants'
    ],
    forAdmin: 'Pour l\'administration',
    forAdminDesc: [
      'Validation des offres publiées',
      'Gestion complète des utilisateurs',
      'Rapports et statistiques détaillés'
    ],
    getStarted: 'Commencer',
    postOpening: 'Publier une offre',
    adminDashboard: 'Tableau de bord admin',

    // CTA
    ctaTitle: 'Prêt à faire le grand saut ?',
    ctaSubtitle: 'Rejoignez des milliers d\'étudiants et d\'entreprises qui façonnent l\'avenir du Congo.',
    createAccount: 'Créer un compte',
    contactUs: 'Nous contacter',

    // Auth
    welcomeBack: 'Bon retour !',
    loginSubtitle: 'Connectez-vous à votre compte EmploiCongo',
    email: 'Adresse email',
    password: 'Mot de passe',
    loginBtn: 'Se connecter',
    noAccount: 'Pas encore de compte ?',
    createOne: 'En créer un',
    createAccountTitle: 'Créer votre compte',
    registerSubtitle: 'Rejoignez la communauté EmploiCongo',
    fullName: 'Nom complet',
    iAmStudent: '🎓 Je suis étudiant(e)',
    iAmCompany: '🏢 Je suis une entreprise / ONG',
    degreeProgram: 'Programme d\'études',
    fieldOfStudy: 'Domaine d\'études',
    companyName: 'Nom de la société / ONG',
    companyWebsite: 'Site web (optionnel)',
    companyDesc: 'Description (optionnel)',
    companyNotice: 'Les comptes entreprise sont vérifiés avant publication.',
    registerBtn: 'Créer mon compte',
    alreadyAccount: 'Déjà un compte ?',
    signInHere: 'Se connecter',

    // Find jobs
    findJobsTitle: 'Trouver un emploi',
    allFields: 'Tous les domaines',
    noResults: 'Aucune opportunité trouvée. Essayez d\'autres mots-clés.',
    loading: 'Chargement...',

    // Opportunity actions
    save: '☆ Sauvegarder',
    saved: '★ Sauvegardé',
    applied: '✓ Candidature envoyée',
    applyBtn: 'Postuler',
    coverNote: 'Lettre de motivation (optionnel)',
    coverNotePlaceholder: 'Expliquez brièvement pourquoi vous êtes le candidat idéal...',
    submitApplication: 'Envoyer ma candidature',
    cancel: 'Annuler',

    // Student dashboard
    welcomeStudent: 'Bienvenue',
    applicationStatus: 'Statut des candidatures',
    recommended: 'Recommandé pour vous',
    profileCompletion: 'Complétion du profil',
    completeProfile: 'Compléter mon profil →',
    uploadCv: 'Télécharger mon CV',
    currentCv: 'CV actuel',
    noCv: 'Aucun CV téléchargé.',
    savedJobs: 'Offres sauvegardées',
    overview: 'Vue d\'ensemble',
    noApplications: 'Vous n\'avez pas encore postulé.',
    browseJobs: 'Voir les offres →',
    noSaved: 'Aucune offre sauvegardée.',
    appliedOn: 'Postulé le',
    stepOf: 'Étape',
    of: 'sur',

    // Company dashboard
    companyDashboard: 'Tableau de bord Entreprise',
    companyDashboardSub: 'Gérez vos recrutements et candidatures.',
    totalApplicants: 'Candidats totaux',
    pendingReviews: 'En attente',
    activeListings: 'Offres actives',
    postOpportunity: 'Publier une opportunité',
    jobTitle: 'Titre du poste',
    field: 'Domaine',
    description: 'Description',
    locationLabel: 'Lieu',
    employmentType: 'Type de contrat',
    salaryRange: 'Fourchette salariale',
    appDeadline: 'Date limite',
    publish: 'Publier',
    recentApplicants: 'Candidats récents',
    downloadCv: '⬇ CV',
    updateStatus: 'Mettre à jour',
    noApplicants: 'Aucun candidat pour le moment.',
    postings: 'Mes offres',
    applicants: 'Candidats',

    // Admin dashboard
    adminOverview: 'Vue d\'ensemble administrative',
    adminSub: 'Gérer les opportunités et assurer la qualité des offres.',
    pendingApprovals: 'Approbations en attente',
    pendingJobs: 'Offres en attente',
    internalPostTool: 'Outil de publication directe',
    internalPostSub: 'Publiez des offres reçues par email ou recommandées.',
    approve: 'Approuver',
    reject: 'Rejeter',
    rejectReason: 'Motif du rejet',
    confirmReject: 'Confirmer le rejet',
    userManagement: 'Gestion des utilisateurs',
    searchUsers: 'Rechercher des utilisateurs...',
    joined: 'Inscrit le',
    suspend: 'Suspendre',
    reactivate: 'Réactiver',
    verify: 'Vérifier',
    previous: 'Précédent',
    next: 'Suivant',
    actionNeeded: 'Action requise',
    noPending: '🎉 Aucune offre en attente !',
    publishOpportunity: '⬆ Publier l\'opportunité',

    // Statuses
    status_SUBMITTED: 'Soumise',
    status_UNDER_REVIEW: 'En révision',
    status_INTERVIEWING: 'Entretien',
    status_APPROVED: 'Approuvée',
    status_REJECTED: 'Rejetée',
    status_POSITION_FILLED: 'Poste pourvu',
    status_PENDING: 'En attente',
    status_CLOSED: 'Fermée',
    status_ACTIVE: 'Actif',
    status_SUSPENDED: 'Suspendu',

    // Fields
    fields: {
      it: 'Informatique & Développement',
      finance: 'Finance & Comptabilité',
      marketing: 'Marketing & Communication',
      hr: 'Ressources Humaines',
      ngo: 'Humanitaire & ONG',
      engineering: 'Ingénierie',
      health: 'Santé',
      education: 'Éducation',
      law: 'Droit & Juridique',
      other: 'Autre'
    }
  },

  en: {
    findJobs: 'Find Jobs',
    myApplications: 'My Applications',
    postJob: 'Post a Job',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    heroTitle: 'Your Career Starts Here',
    heroTitleHighlight: 'Starts Here',
    heroSubtitle: 'Connecting Congolese talent with the best local and international opportunities.',
    searchPlaceholder: 'Job title, keywords...',
    companyPlaceholder: 'Company name',
    searchBtn: 'Search',
    activeOpportunities: 'Active Opportunities',
    partnerCompanies: 'Partner Companies',
    registeredStudents: 'Registered Students',
    latestOpportunities: 'Latest Opportunities',
    latestSubtitle: 'Verified opportunities published by our team.',
    applyNow: 'Apply Now',
    viewAll: 'View All →',
    deadline: 'Deadline',
    tailoredTitle: 'One Platform For Everyone',
    tailoredSubtitle: 'Students, companies and NGOs — one platform.',
    forStudents: 'For Students',
    forStudentsDesc: [
      'One-click applications with your profile',
      'Real-time application tracking',
      'Verified opportunities from local and international companies'
    ],
    forCompanies: 'For Companies & NGOs',
    forCompaniesDesc: [
      'Access top Congolese talent',
      'Simplified application management',
      'Visibility to thousands of students'
    ],
    forAdmin: 'For Administration',
    forAdminDesc: [
      'Validate published opportunities',
      'Complete user management',
      'Detailed reports and statistics'
    ],
    getStarted: 'Get Started',
    postOpening: 'Post an Opening',
    adminDashboard: 'Admin Dashboard',
    ctaTitle: 'Ready to Take the Next Step?',
    ctaSubtitle: 'Join thousands of students and companies shaping the future of Congo.',
    createAccount: 'Create Account',
    contactUs: 'Contact Us',
    welcomeBack: 'Welcome Back!',
    loginSubtitle: 'Sign in to your EmploiCongo account',
    email: 'Email address',
    password: 'Password',
    loginBtn: 'Sign In',
    noAccount: 'Don\'t have an account?',
    createOne: 'Create one',
    createAccountTitle: 'Create Your Account',
    registerSubtitle: 'Join the EmploiCongo community',
    fullName: 'Full Name',
    iAmStudent: '🎓 I am a Student',
    iAmCompany: '🏢 I am a Company / NGO',
    degreeProgram: 'Degree Program',
    fieldOfStudy: 'Field of Study',
    companyName: 'Company / NGO Name',
    companyWebsite: 'Website (optional)',
    companyDesc: 'Description (optional)',
    companyNotice: 'Company accounts are verified before publishing.',
    registerBtn: 'Create My Account',
    alreadyAccount: 'Already have an account?',
    signInHere: 'Sign in',
    findJobsTitle: 'Find Jobs',
    allFields: 'All fields',
    noResults: 'No opportunities found. Try different keywords.',
    loading: 'Loading...',
    save: '☆ Save',
    saved: '★ Saved',
    applied: '✓ Applied',
    applyBtn: 'Apply',
    coverNote: 'Cover Note (optional)',
    coverNotePlaceholder: 'Briefly explain why you are the ideal candidate...',
    submitApplication: 'Submit Application',
    cancel: 'Cancel',
    welcomeStudent: 'Welcome back',
    applicationStatus: 'Application Status',
    recommended: 'Recommended For You',
    profileCompletion: 'Profile Completion',
    completeProfile: 'Complete my profile →',
    uploadCv: 'Upload My CV',
    currentCv: 'Current CV',
    noCv: 'No CV uploaded yet.',
    savedJobs: 'Saved Jobs',
    overview: 'Overview',
    noApplications: 'You haven\'t applied to anything yet.',
    browseJobs: 'Browse jobs →',
    noSaved: 'No saved jobs yet.',
    appliedOn: 'Applied on',
    stepOf: 'Step',
    of: 'of',
    companyDashboard: 'Company Dashboard',
    companyDashboardSub: 'Monitor your recruitment and manage applicants.',
    totalApplicants: 'Total Applicants',
    pendingReviews: 'Pending Reviews',
    activeListings: 'Active Listings',
    postOpportunity: 'Post an Opportunity',
    jobTitle: 'Job Title',
    field: 'Field',
    description: 'Description',
    locationLabel: 'Location',
    employmentType: 'Employment Type',
    salaryRange: 'Salary Range',
    appDeadline: 'Application Deadline',
    publish: 'Publish',
    recentApplicants: 'Recent Applicants',
    downloadCv: '⬇ CV',
    updateStatus: 'Update',
    noApplicants: 'No applicants yet.',
    postings: 'My Postings',
    applicants: 'Applicants',
    adminOverview: 'Administrative Overview',
    adminSub: 'Manage opportunities and ensure quality postings.',
    pendingApprovals: 'Pending Approvals',
    pendingJobs: 'Pending Jobs',
    internalPostTool: 'Internal Post Tool',
    internalPostSub: 'Publish opportunities received by email or recommended.',
    approve: 'Approve',
    reject: 'Reject',
    rejectReason: 'Rejection reason',
    confirmReject: 'Confirm Rejection',
    userManagement: 'User Management',
    searchUsers: 'Search users...',
    joined: 'Joined',
    suspend: 'Suspend',
    reactivate: 'Reactivate',
    verify: 'Verify',
    previous: 'Previous',
    next: 'Next',
    actionNeeded: 'Action Needed',
    noPending: '🎉 No pending postings!',
    publishOpportunity: '⬆ Publish Opportunity',
    status_SUBMITTED: 'Submitted',
    status_UNDER_REVIEW: 'Under Review',
    status_INTERVIEWING: 'Interviewing',
    status_APPROVED: 'Approved',
    status_REJECTED: 'Rejected',
    status_POSITION_FILLED: 'Position Filled',
    status_PENDING: 'Pending',
    status_CLOSED: 'Closed',
    status_ACTIVE: 'Active',
    status_SUSPENDED: 'Suspended',
    fields: {
      it: 'IT & Software Development',
      finance: 'Finance & Accounting',
      marketing: 'Marketing & Communication',
      hr: 'Human Resources',
      ngo: 'Humanitarian & NGO',
      engineering: 'Engineering',
      health: 'Health',
      education: 'Education',
      law: 'Law & Legal',
      other: 'Other'
    }
  }
};

const Lang = {
  current: localStorage.getItem('ec_lang') || 'fr',

  t(key) {
    const keys = key.split('.');
    let val = TRANSLATIONS[this.current];
    for (const k of keys) val = val?.[k];
    return val ?? key;
  },

  set(lang) {
    this.current = lang;
    localStorage.setItem('ec_lang', lang);
    this.apply();
  },

  toggle() {
    this.set(this.current === 'fr' ? 'en' : 'fr');
  },

  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = this.t(el.getAttribute('data-i18n'));
      if (val && typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = this.t(el.getAttribute('data-i18n-placeholder'));
      if (val) el.placeholder = val;
    });
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = this.current === 'fr' ? '🇬🇧 EN' : '🇨🇩 FR';
    document.documentElement.lang = this.current;
  },

  init() {
    this.apply();
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.addEventListener('click', () => this.toggle());
  }
};