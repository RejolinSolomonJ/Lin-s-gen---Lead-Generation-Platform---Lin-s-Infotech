const axios = require('axios');
const cheerio = require('cheerio');
const prisma = require('../../config/database');
const config = require('../../config');

/**
 * Enrich a lead's contact information using publicly available data.
 * Sources: Google Business Profile, website contact page, pattern guessing.
 */
async function enrichLead(leadId) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');

  const enrichmentResults = {
    phone: null,
    email: null,
    contactName: null,
    source: null,
    confidence: 'guessed',
  };

  // 1. Try Google Places API (if API key configured)
  if (config.google.apiKey && lead.company_name) {
    try {
      const placeData = await searchGooglePlaces(lead.company_name, lead.city, lead.country);
      if (placeData) {
        if (placeData.phoneNumber && !lead.contact_phone) {
          enrichmentResults.phone = placeData.phoneNumber;
          enrichmentResults.source = 'google_business_profile';
          enrichmentResults.confidence = 'verified';
        }
        if (placeData.websiteUri && !lead.website_url) {
          await prisma.lead.update({
            where: { id: leadId },
            data: { website_url: placeData.websiteUri },
          });
        }
      }
    } catch (err) {
      console.error(`Google Places enrichment failed for ${lead.company_name}:`, err.message);
    }
  }

  // 2. Try website contact page (if URL exists)
  const websiteUrl = lead.website_url;
  if (websiteUrl && (!lead.contact_email || !lead.contact_phone)) {
    try {
      const contactInfo = await scrapeContactPage(websiteUrl);
      if (contactInfo.email && !lead.contact_email && !enrichmentResults.email) {
        enrichmentResults.email = contactInfo.email;
        enrichmentResults.source = enrichmentResults.source || 'site_contact_page';
        enrichmentResults.confidence = 'verified';
      }
      if (contactInfo.phone && !lead.contact_phone && !enrichmentResults.phone) {
        enrichmentResults.phone = contactInfo.phone;
        enrichmentResults.source = enrichmentResults.source || 'site_contact_page';
        enrichmentResults.confidence = 'verified';
      }
      if (contactInfo.name && !lead.contact_name) {
        enrichmentResults.contactName = contactInfo.name;
      }
    } catch (err) {
      console.error(`Website contact scrape failed for ${websiteUrl}:`, err.message);
    }
  }

  // 3. Pattern-guess email as fallback
  if (!lead.contact_email && !enrichmentResults.email && websiteUrl) {
    try {
      const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname;
      if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
        enrichmentResults.email = `info@${domain}`;
        enrichmentResults.source = enrichmentResults.source || 'pattern_guessed';
        enrichmentResults.confidence = 'guessed';
      }
    } catch {}
  }

  // Update lead with enrichment data
  const updateData = {};
  if (enrichmentResults.phone) updateData.contact_phone = enrichmentResults.phone;
  if (enrichmentResults.email) updateData.contact_email = enrichmentResults.email;
  if (enrichmentResults.contactName) updateData.contact_name = enrichmentResults.contactName;
  if (enrichmentResults.source) updateData.contact_source = enrichmentResults.source;
  if (enrichmentResults.confidence) updateData.contact_confidence = enrichmentResults.confidence;

  if (Object.keys(updateData).length > 0) {
    await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    });

    await prisma.activity.create({
      data: {
        lead_id: leadId,
        type: 'contact_enriched',
        description: `Contact enriched via ${enrichmentResults.source}. Confidence: ${enrichmentResults.confidence}`,
      },
    });
  }

  return enrichmentResults;
}

async function searchGooglePlaces(companyName, city, country) {
  try {
    const query = [companyName, city, country].filter(Boolean).join(', ');
    const { data } = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: query, maxResultCount: 1 },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': config.google.apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri',
        },
        timeout: 10000,
      }
    );

    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      return {
        name: place.displayName?.text,
        address: place.formattedAddress,
        phoneNumber: place.nationalPhoneNumber || place.internationalPhoneNumber,
        websiteUri: place.websiteUri,
        mapsUrl: place.googleMapsUri,
      };
    }
  } catch (err) {
    console.error('Google Places search error:', err.message);
  }

  return null;
}

async function scrapeContactPage(baseUrl) {
  const result = { email: null, phone: null, name: null };

  try {
    const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    // Try common contact page paths
    const contactPaths = ['', '/contact', '/contact-us', '/about', '/about-us'];

    for (const path of contactPaths) {
      try {
        const { data: html } = await axios.get(`${url}${path}`, {
          timeout: 10000,
          headers: { 'User-Agent': 'LinInfotechLeadGen/1.0' },
        });

        // Extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = html.match(emailRegex) || [];
        const validEmails = emails.filter(e =>
          !e.includes('example.com') && !e.includes('sentry') &&
          !e.includes('wixpress') && !e.includes('.png') && !e.includes('.jpg')
        );
        if (validEmails.length > 0 && !result.email) {
          result.email = validEmails[0];
        }

        // Extract phone numbers (Indian format + international)
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
        const phones = html.match(phoneRegex) || [];
        const validPhones = phones.filter(p => p.replace(/\D/g, '').length >= 10);
        if (validPhones.length > 0 && !result.phone) {
          result.phone = validPhones[0].trim();
        }

        if (result.email || result.phone) break;
      } catch {}
    }
  } catch (err) {
    console.error('Contact page scrape error:', err.message);
  }

  return result;
}

module.exports = { enrichLead, searchGooglePlaces };
