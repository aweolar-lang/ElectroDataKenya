import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// 1. Setup Database
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("❌ No database URL found in .env");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- DATA: Hardcoded Presidents ---
const presidents = [
  { name: 'William Ruto', party: 'UDA' },
  { name: 'Raila Odinga', party: 'ODM' },
  { name: 'Kalonzo Musyoka', party: 'Wiper' },
  { name: 'George Wajackoyah', party: 'Roots' },
];

// --- DATA: Full 47 Counties (Reference for Code/Name) ---
const counties = [
  { code: 1, name: 'Mombasa' },
  { code: 2, name: 'Kwale' },
  { code: 3, name: 'Kilifi' },
  { code: 4, name: 'Tana River' },
  { code: 5, name: 'Lamu' },
  { code: 6, name: 'Taita Taveta' },
  { code: 7, name: 'Garissa' },
  { code: 8, name: 'Wajir' },
  { code: 9, name: 'Mandera' },
  { code: 10, name: 'Marsabit' },
  { code: 11, name: 'Isiolo' },
  { code: 12, name: 'Meru' },
  { code: 13, name: 'Tharaka-Nithi' },
  { code: 14, name: 'Embu' },
  { code: 15, name: 'Kitui' },
  { code: 16, name: 'Machakos' },
  { code: 17, name: 'Makueni' },
  { code: 18, name: 'Nyandarua' },
  { code: 19, name: 'Nyeri' },
  { code: 20, name: 'Kirinyaga' },
  { code: 21, name: 'Murang\'a' },
  { code: 22, name: 'Kiambu' },
  { code: 23, name: 'Turkana' },
  { code: 24, name: 'West Pokot' },
  { code: 25, name: 'Samburu' },
  { code: 26, name: 'Trans Nzoia' },
  { code: 27, name: 'Uasin Gishu' },
  { code: 28, name: 'Elgeyo Marakwet' },
  { code: 29, name: 'Nandi' },
  { code: 30, name: 'Baringo' },
  { code: 31, name: 'Laikipia' },
  { code: 32, name: 'Nakuru' },
  { code: 33, name: 'Narok' },
  { code: 34, name: 'Kajiado' },
  { code: 35, name: 'Kericho' },
  { code: 36, name: 'Bomet' },
  { code: 37, name: 'Kakamega' },
  { code: 38, name: 'Vihiga' },
  { code: 39, name: 'Bungoma' },
  { code: 40, name: 'Busia' },
  { code: 41, name: 'Siaya' },
  { code: 42, name: 'Kisumu' },
  { code: 43, name: 'Homa Bay' },
  { code: 44, name: 'Migori' },
  { code: 45, name: 'Kisii' },
  { code: 46, name: 'Nyamira' },
  { code: 47, name: 'Nairobi' },
];

// Types based on your mp_data.json structure
interface ConstituencyData {
  name: string;
  mp: string;
  party: string;
  aspirants_2027?: string[];
}

interface CountyMpData {
  county: string;
  code: number;
  constituencies: ConstituencyData[];
}

interface MpFileRoot {
  mps?: CountyMpData[]; 
  parliamentary_data_2026?: CountyMpData[]; 
}

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Seed All 47 Counties (Base Data)
  console.log('... Seeding 47 Counties');
  for (const c of counties) {
    await prisma.county.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: { code: c.code, name: c.name },
    });
  }

  // 2. Seed Presidents
  console.log('... Seeding Presidents');
  for (const p of presidents) {
    const id = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await prisma.candidate.upsert({
      where: { id },
      update: { office: 'president' },
      create: {
        id,
        name: p.name,
        party: p.party,
        office: 'president',
        bio: 'Running for President of Kenya',
      },
    });
  }

  // 3. Seed MPs and Constituencies from mp_data.json
  const mpFilePath = path.join(__dirname, 'mp_data.json'); // Ensure this matches your file location relative to seed.ts
  
  if (fs.existsSync(mpFilePath)) {
    try {
      console.log(`... Reading MPs from ${mpFilePath}`);
      const rawData = fs.readFileSync(mpFilePath, 'utf-8');
      const mpData: MpFileRoot = JSON.parse(rawData);

      // Handle both "mps" and "parliamentary_data_2026" root keys
      const countyGroups = mpData.mps || mpData.parliamentary_data_2026 || [];
      
      // Loop through the counties in the JSON
      for (const countyGroup of countyGroups) {
        
        // Find the County ID in our DB using the Code from JSON
        const dbCounty = await prisma.county.findUnique({
          where: { code: countyGroup.code }
        });

        if (!dbCounty) {
          console.warn(`⚠️ Skipping MPs for ${countyGroup.county}: County code ${countyGroup.code} not found in DB.`);
          continue;
        }

        // Loop through Constituencies in this County
        for (const consti of countyGroup.constituencies) {
          // A. Create Constituency
          const constiId = `${dbCounty.code}-${consti.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          
          const dbConsti = await prisma.constituency.upsert({
            where: { id: constiId }, 
            update: {},
            create: {
              id: constiId,
              name: consti.name,
              countyId: dbCounty.id
            }
          });

          // B. Create Current MP (Incumbent)
          const incumbentId = consti.mp.toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          await prisma.candidate.upsert({
            where: { id: incumbentId },
            update: {
              office: 'mp',
              party: consti.party,
              homeCountyId: dbCounty.id,
              constituencyId: dbConsti.id, 
            },
            create: {
              id: incumbentId,
              name: consti.mp,
              party: consti.party,
              office: 'mp',
              homeCountyId: dbCounty.id,
              constituencyId: dbConsti.id,
              bio: `Incumbent MP for ${consti.name}`
            }
          });

          // C. Create Aspirants (The "Other" candidates)
          if (consti.aspirants_2027 && consti.aspirants_2027.length > 0) {
            for (const aspirantStr of consti.aspirants_2027) {
              
              // Logic to parse "Nasir Dolal (ODM)" -> Name: Nasir Dolal, Party: ODM
              let aspName = aspirantStr;
              let aspParty = 'Independent';

              if (aspirantStr.includes('(')) {
                const parts = aspirantStr.split('(');
                aspName = parts[0].trim();
                aspParty = parts[1].replace(')', '').trim();
              }

              // Create clean ID for aspirant
              const aspId = aspName.toLowerCase().replace(/[^a-z0-9]/g, '-');

              await prisma.candidate.upsert({
                where: { id: aspId },
                update: {
                  office: 'mp',
                  party: aspParty,
                  homeCountyId: dbCounty.id,
                  constituencyId: dbConsti.id,
                },
                create: {
                  id: aspId,
                  name: aspName,
                  party: aspParty,
                  office: 'mp',
                  homeCountyId: dbCounty.id,
                  constituencyId: dbConsti.id,
                  bio: `Aspirant for ${consti.name} 2027`
                }
              });
            }
          }
        }
      }
      console.log(`✅ MPs and Aspirants seeded successfully.`);

    } catch (err) {
      console.error("❌ Error parsing mp_data.json:", err);
    }
  } else {
    console.warn("⚠️ mp_data.json not found! Skipping MP seeding.");
  }

  // 4. (Optional) Seed Governors
  const candidatesPath = path.join(__dirname, 'candidates.json');
  if (fs.existsSync(candidatesPath)) {
      try {
          const raw = fs.readFileSync(candidatesPath, 'utf-8');
          const data = JSON.parse(raw);
          if (data.governors) {
             console.log(`... Seeding Governors from candidates.json`);
             for (const gov of data.governors) {
                const govCounty = await prisma.county.findUnique({ where: { code: gov.countyCode }});
                if(govCounty) {
                    const id = gov.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    await prisma.candidate.upsert({
                        where: { id },
                        create: { id, name: gov.name, party: gov.party, office: 'governor', bio: `Governor of ${govCounty.name}`, homeCountyId: govCounty.id},
                        update: { party: gov.party, office: 'governor', homeCountyId: govCounty.id }
                    });
                }
             }
          }
      } catch (e) { console.log("Note: candidates.json found but could not be processed.")}
  }

  console.log(`✅ Seed complete.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });