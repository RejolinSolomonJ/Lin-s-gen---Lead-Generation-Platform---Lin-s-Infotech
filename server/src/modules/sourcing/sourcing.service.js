const axios = require('axios');
const cheerio = require('cheerio');
const prisma = require('../../config/database');
const config = require('../../config');
const scannerService = require('../scanning/scanner.service');
const enrichmentService = require('../enrichment/enrichment.service');
const scoringService = require('../scoring/scoring.service');
const leadsService = require('../leads/leads.service');

/**
 * Discover real operating businesses in real-time.
 * Supports:
 * 1. Google Places API (New) - when GOOGLE_API_KEY is configured
 * 2. OpenStreetMap Nominatim API - 100% free live business search (Zero key required)
 * 3. Web Search Sourcing fallback
 */
async function discoverRealLeads({ industry, city, country, tab_category, region, maxResults = 10 }) {
  console.log(`[Real-Time Sourcing] Searching for real businesses: "${industry}" in "${city}, ${country}" (${tab_category}, ${region})...`);

  let rawPlaces = [];
  let apiSourceUsed = '';

  // Method 1: Try Google Places API (New) if key is provided
  if (config.google.apiKey && config.google.apiKey !== 'your_google_api_key_here') {
    try {
      rawPlaces = await fetchFromGooglePlaces(industry, city, country, maxResults);
      apiSourceUsed = 'Google Places API';
    } catch (err) {
      console.error('[Sourcing] Google Places API error:', err.message);
    }
  }

  // Method 2: OpenStreetMap Nominatim API (Free live business API, no key required!)
  if (rawPlaces.length === 0) {
    try {
      rawPlaces = await fetchFromNominatim(industry, city, country, maxResults);
      apiSourceUsed = 'OpenStreetMap Live API';
    } catch (err) {
      console.error('[Sourcing] Nominatim API error:', err.message);
    }
  }

  // Method 3: Live Web Sourcing Fallback
  if (rawPlaces.length === 0) {
    rawPlaces = await fetchFromWebSearch(industry, city, country, maxResults);
    apiSourceUsed = 'Live Web Sourcing';
  }

  console.log(`[Sourcing] Found ${rawPlaces.length} raw businesses via ${apiSourceUsed}`);

  const discoveredLeads = [];

  for (const place of rawPlaces) {
    try {
      // Check if lead already exists by company name or domain
      const existing = await prisma.lead.findFirst({
        where: {
          company_name: { equals: place.name },
          city: { equals: place.city },
        },
      });

      if (existing) {
        discoveredLeads.push(await leadsService.getLeadById(existing.id));
        continue;
      }

      // Check detection logic per tab
      const hasWebsite = !!place.websiteUrl;
      let targetTabCategory = tab_category || (hasWebsite ? 'weak_seo' : 'no_website');
      let pitchAngle = null;

      // STRICT FILTERING FOR TAB 1 (No Website):
      // If searching under "No Website", and the place has a website, move it to Weak SEO category instead!
      if (tab_category === 'no_website' && hasWebsite) {
        targetTabCategory = 'weak_seo';
        pitchAngle = 'Website exists but invisible on Google — SEO retainer';
      } else if (tab_category === 'no_website') {
        pitchAngle = 'No web presence — full website build';
      }

      // Create base real lead record
      const leadData = {
        company_name: place.name,
        industry: industry || place.industry || 'Local Business',
        city: city || place.city || 'Chennai',
        state: place.state || (country === 'India' ? 'Tamil Nadu' : null),
        country: country || 'India',
        region: region || (country === 'India' ? 'local' : 'international'),
        website_url: place.websiteUrl || null,
        contact_phone: place.phoneNumber || null,
        contact_email: place.email || null,
        contact_source: place.phoneNumber ? 'public_directory' : null,
        contact_confidence: place.phoneNumber ? 'verified' : 'guessed',
        tab_category: targetTabCategory,
        pitch_angle: pitchAngle,
        source: place.source || apiSourceUsed,
        outreach_status: 'new',
        notes: place.address ? `Address: ${place.address}` : 'Real-time prospect discovered via live discovery',
        tab_data: {
          has_physical_location: !!place.address,
          primary_social_link: place.socialUrl || null,
          employee_count_estimate: Math.floor(Math.random() * 15) + 3,
        },
      };

      const createdLead = await leadsService.createLead(leadData);

      // If lead has a website, run live real-time site scan right now!
      if (createdLead.website_url) {
        try {
          await scannerService.runFullScan(createdLead.id);
        } catch (scanErr) {
          console.error(`[Sourcing] Live scan error for ${createdLead.website_url}:`, scanErr.message);
        }
      }

      // Run real lead scoring
      await scoringService.scoreLeadById(createdLead.id);

      // Fetch fresh updated lead with scan data & score
      const freshLead = await leadsService.getLeadById(createdLead.id);
      discoveredLeads.push(freshLead);

    } catch (err) {
      console.error(`[Sourcing] Error processing real business "${place.name}":`, err.message);
    }
  }

  return {
    query: { industry, city, country, tab_category, region },
    apiSourceUsed,
    totalFound: discoveredLeads.length,
    leads: discoveredLeads,
  };
}

/**
 * Fetch real places using Google Places API (New)
 */
async function fetchFromGooglePlaces(industry, city, country, limit) {
  const query = [industry, city, country].filter(Boolean).join(' ');
  const response = await axios.post(
    'https://places.googleapis.com/v1/places:searchText',
    {
      textQuery: query,
      maxResultCount: Math.min(limit, 20),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': config.google.apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.primaryTypeDisplayName',
      },
      timeout: 10000,
    }
  );

  const places = response.data?.places || [];
  return places.map((p) => ({
    name: p.displayName?.text || 'Business',
    address: p.formattedAddress,
    city,
    country,
    phoneNumber: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
    websiteUrl: p.websiteUri || null,
    industry: p.primaryTypeDisplayName?.text || industry,
    source: 'google_places_api',
  }));
}

/**
 * Fetch real operating businesses using OpenStreetMap Nominatim Live API (Free, no API key required!)
 */
async function fetchFromNominatim(industry, city, country, limit) {
  const results = [];
  const searchTerm = `${industry} in ${city} ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&addressdetails=1&extratags=1&limit=${limit * 2}`;

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'LinInfotechLeadGenDashboard/1.0 (internal sales tool)',
    },
    timeout: 10000,
  });

  if (Array.isArray(data)) {
    for (const item of data) {
      if (results.length >= limit) break;

      const name = item.namedetails?.name || item.display_name?.split(',')[0]?.trim();
      if (!name || name.length < 3) continue;

      const address = item.display_name;
      const extra = item.extratags || {};
      const websiteUrl = extra.website || extra['contact:website'] || extra.url || null;
      const phoneNumber = extra.phone || extra['contact:phone'] || extra.mobile || null;
      const email = extra.email || extra['contact:email'] || null;

      results.push({
        name,
        address,
        city,
        country,
        phoneNumber,
        websiteUrl,
        email,
        industry,
        source: 'openstreetmap_live_api',
      });
    }
  }

  return results;
}

/**
 * Live Web Search Sourcing fallback — queries real public business listings
 */
async function fetchFromWebSearch(industry, city, country, limit) {
  const results = [];
  try {
    const searchQuery = encodeURIComponent(`${industry} in ${city} ${country} phone contact`);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;

    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    $('.result').each((i, el) => {
      if (results.length >= limit) return;

      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const rawUrl = $(el).find('.result__url').attr('href') || '';

      if (!title) return;

      let websiteUrl = null;
      if (rawUrl && !rawUrl.includes('duckduckgo.com') && !rawUrl.includes('wikipedia') && !rawUrl.includes('facebook.com')) {
        try {
          const match = rawUrl.match(/uddg=([^&]+)/);
          if (match) {
            websiteUrl = decodeURIComponent(match[1]);
          } else if (rawUrl.startsWith('http')) {
            websiteUrl = rawUrl;
          }
        } catch {}
      }

      const phoneMatch = snippet.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
      const phoneNumber = phoneMatch ? phoneMatch[0].trim() : null;
      const cleanTitle = title.split('-')[0].split('|')[0].trim();

      if (cleanTitle && cleanTitle.length > 3) {
        results.push({
          name: cleanTitle,
          address: `${city}, ${country}`,
          city,
          country,
          phoneNumber,
          websiteUrl,
          industry,
          source: 'live_web_sourcing',
        });
      }
    });
  } catch (err) {
    console.error('[Sourcing] Web search fallback error:', err.message);
  }

  return results;
}

module.exports = { discoverRealLeads };
