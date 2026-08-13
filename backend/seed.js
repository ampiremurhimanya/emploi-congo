const pool = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Seeding EmploiCongo with DRC demo data...');

    // Admin account
    const adminExists = await pool.query(`SELECT id FROM users WHERE email = 'admin@emploicongo.cd'`);
    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash('Admin@2024', 12);
      await pool.query(`
        INSERT INTO users (full_name, email, password, role)
        VALUES ('EmploiCongo Admin', 'admin@emploicongo.cd', $1, 'ADMIN')
      `, [hash]);
      console.log('✅ Admin account created');
      console.log('   email: admin@emploicongo.cd');
      console.log('   password: Admin@2024');
    }

    // Demo company — Vodacom Congo
    let vodacom = await pool.query(`SELECT id FROM users WHERE email = 'rh@vodacom.cd'`);
    if (vodacom.rows.length === 0) {
      const hash = await bcrypt.hash('Company@123', 12);
      const r = await pool.query(`
        INSERT INTO users (full_name, email, password, role, company_name, company_website, verified_company)
        VALUES ('Vodacom Congo RH', 'rh@vodacom.cd', $1, 'COMPANY', 'Vodacom Congo', 'https://vodacom.cd', true)
        RETURNING id
      `, [hash]);
      vodacom = r;
      console.log('✅ Vodacom Congo company account created');
    }

    // Demo student
    const studentExists = await pool.query(`SELECT id FROM users WHERE email = 'etudiant@unikin.ac.cd'`);
    if (studentExists.rows.length === 0) {
      const hash = await bcrypt.hash('Student@123', 12);
      await pool.query(`
        INSERT INTO users (full_name, email, password, role, degree_program, field_of_study)
        VALUES ('Jean-Paul Mbeki', 'etudiant@unikin.ac.cd', $1, 'STUDENT', 'Licence en Informatique', 'Informatique & Développement')
        RETURNING id
      `, [hash]);
      console.log('✅ Demo student account created');
    }

    // Opportunities
    const oppCount = await pool.query(`SELECT COUNT(*) FROM opportunities`);
    if (parseInt(oppCount.rows[0].count) === 0) {
      const companyId = vodacom.rows[0].id;

      const opportunities = [
        ['Stagiaire Développeur Mobile', 'Vodacom Congo', companyId, 'Informatique & Développement',
         'Rejoignez notre équipe tech pour développer des applications mobile money pour des millions de Congolais.',
         'Kinshasa, DRC', 'Stage', 'USD 300-500/mois', 30, true, true],

        ['Analyste Financier Junior', 'Rawbank', null, 'Finance & Comptabilité',
         'Nous recherchons un analyste financier pour rejoindre notre équipe à Kinshasa.',
         'Kinshasa, DRC', 'CDI', 'USD 800-1200/mois', 25, true, true],

        ['Coordinateur de Programmes', 'UNICEF RDC', null, 'Humanitaire & ONG',
         'Coordonner les programmes de protection de l\'enfance dans les zones affectées par le conflit.',
         'Goma, DRC', 'CDD', 'Selon grille UNICEF', 20, true, true],

        ['Ingénieur Réseau', 'Airtel Congo', null, 'Informatique & Développement',
         'Gérer et optimiser notre infrastructure réseau télécoms à travers la RDC.',
         'Lubumbashi, DRC', 'CDI', 'Compétitif', 35, true, true],

        ['Logisticien', 'MSF (Médecins Sans Frontières)', null, 'Humanitaire & ONG',
         'Assurer la logistique des opérations médicales dans les zones de conflit en RDC.',
         'Bunia, DRC', 'CDD', 'Selon grille MSF', 15, true, true],

        ['Chargé de Communication', 'BCG Presse Congo', null, 'Marketing & Communication',
         'Développer la stratégie de communication digitale de notre groupe médiatique.',
         'Kinshasa, DRC', 'CDI', 'USD 600-900/mois', 28, false, false],

        ['Stagiaire RH', 'Groupe Forrest International', null, 'Ressources Humaines',
         'Stage en gestion des ressources humaines au sein d\'un grand groupe industriel congolais.',
         'Lubumbashi, DRC', 'Stage', 'USD 200-300/mois', 20, true, false],

        ['Data Analyst', 'Orange Money RDC', null, 'Informatique & Développement',
         'Analyser les données transactionnelles pour améliorer nos services mobile money.',
         'Kinshasa, DRC', 'CDI', 'USD 700-1000/mois', 40, true, true],
      ];

      for (const o of opportunities) {
        await pool.query(`
          INSERT INTO opportunities
            (title, company_name, company_id, field, description, location,
             employment_type, salary_range, application_deadline,
             status, verified_company)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
            NOW() + INTERVAL '${o[8]} days',
            $9, $10)
        `, [o[0],o[1],o[2],o[3],o[4],o[5],o[6],o[7], o[9] ? 'APPROVED' : 'PENDING', o[10]]);
      }
      console.log('✅ 8 DRC opportunities seeded');
    }

    console.log('');
    console.log('🎉 Seeding complete!');
    console.log('');
    console.log('Demo accounts:');
    console.log('  Admin:   admin@emploicongo.cd  /  Admin@2024');
    console.log('  Student: etudiant@unikin.ac.cd /  Student@123');
    console.log('  Company: rh@vodacom.cd         /  Company@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
