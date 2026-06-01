import { createClient } from '@supabase/supabase-js';
import { corridors } from './src/data/routeData.js';
import fs from 'fs';

// Baca file .env manual karena dotenv mungkin belum terinstall/bermasalah
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
  console.log(`Preparing to upload ${corridors.length} corridors...`);
  
  for (const c of corridors) {
    const payload = {
      id: c.id,
      name: c.name,
      route: c.route,
      color: c.color,
      operating_hours: c.operatingHours,
      total_stop_points: c.totalStopPoints,
      path: c.path, // jsonb
      stops: c.stops // jsonb
    };
    
    console.log(`Uploading ${c.name} with ${c.path.length} path coordinates and ${c.stops.length} stops...`);
    const { data, error } = await supabase.from('corridors').insert([payload]);
    
    if (error) {
      console.error(`Error uploading ${c.name}:`, error);
    } else {
      console.log(`Success ${c.name}`);
    }
  }
  console.log('Upload complete.');
}

upload();
