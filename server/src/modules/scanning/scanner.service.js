const axios = require('axios');
const cheerio = require('cheerio');
const prisma = require('../../config/database');
const config = require('../../config');

/**
 * SEO Scanner — checks meta tags, sitemap, robots.txt, schema markup, viewport
 */
async function scanSEO(url) {
  const results = {
    hasTitle: false,
    hasMeta: false,
    hasViewport: false,
    hasSitemap: false,
    hasRobots: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    hasH1: false,
    h1Count: 0,
    titleContent: '',
    metaDescription: '',
    issues: [],
    score: 0,
  };

  try {
    // Fetch main page
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'LinInfotechLeadGen/1.0 (SEO Audit)' },
    });
    const $ = cheerio.load(html);

    // Title tag
    const title = $('title').text().trim();
    results.hasTitle = !!title;
    results.titleContent = title;
    if (!title) results.issues.push('Missing <title> tag');
    if (title && title.length < 10) results.issues.push('Title tag is too short');
    if (title && title.length > 70) results.issues.push('Title tag is too long');

    // Meta description
    const metaDesc = $('meta[name="description"]').attr('content')?.trim();
    results.hasMeta = !!metaDesc;
    results.metaDescription = metaDesc || '';
    if (!metaDesc) results.issues.push('Missing meta description');

    // Viewport
    results.hasViewport = !!$('meta[name="viewport"]').length;
    if (!results.hasViewport) results.issues.push('Missing viewport meta tag (not mobile-responsive)');

    // H1 tags
    results.h1Count = $('h1').length;
    results.hasH1 = results.h1Count > 0;
    if (results.h1Count === 0) results.issues.push('No H1 tag found');
    if (results.h1Count > 1) results.issues.push(`Multiple H1 tags found (${results.h1Count})`);

    // Canonical
    results.hasCanonical = !!$('link[rel="canonical"]').length;
    if (!results.hasCanonical) results.issues.push('Missing canonical link');

    // Schema markup
    const schemaScripts = $('script[type="application/ld+json"]').length;
    results.hasSchemaMarkup = schemaScripts > 0;
    if (!results.hasSchemaMarkup) results.issues.push('No structured data (schema markup) found');

    // Check sitemap.xml
    try {
      const baseUrl = new URL(url);
      await axios.get(`${baseUrl.origin}/sitemap.xml`, { timeout: 5000 });
      results.hasSitemap = true;
    } catch {
      results.issues.push('No sitemap.xml found');
    }

    // Check robots.txt
    try {
      const baseUrl = new URL(url);
      await axios.get(`${baseUrl.origin}/robots.txt`, { timeout: 5000 });
      results.hasRobots = true;
    } catch {
      results.issues.push('No robots.txt found');
    }

    // Calculate score (out of 100)
    let score = 0;
    if (results.hasTitle) score += 15;
    if (results.hasMeta) score += 15;
    if (results.hasViewport) score += 15;
    if (results.hasSitemap) score += 10;
    if (results.hasRobots) score += 10;
    if (results.hasSchemaMarkup) score += 15;
    if (results.hasCanonical) score += 10;
    if (results.hasH1 && results.h1Count === 1) score += 10;
    results.score = score;

  } catch (err) {
    results.issues.push(`Failed to fetch page: ${err.message}`);
    results.score = 0;
  }

  return results;
}

/**
 * PageSpeed Scanner — uses Google PageSpeed Insights API
 */
async function scanPageSpeed(url) {
  const results = {
    performanceScore: 0,
    seoScore: 0,
    accessibilityScore: 0,
    bestPracticesScore: 0,
    lcp: null,
    cls: null,
    fcp: null,
    issues: [],
  };

  if (!config.google.apiKey) {
    results.issues.push('Google API key not configured');
    return results;
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeedtest`;
    const { data } = await axios.get(apiUrl, {
      params: {
        url,
        key: config.google.apiKey,
        category: ['performance', 'seo', 'accessibility', 'best-practices'],
        strategy: 'mobile',
      },
      timeout: 60000,
    });

    const categories = data.lighthouseResult?.categories || {};
    results.performanceScore = Math.round((categories.performance?.score || 0) * 100);
    results.seoScore = Math.round((categories.seo?.score || 0) * 100);
    results.accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
    results.bestPracticesScore = Math.round((categories['best-practices']?.score || 0) * 100);

    // Core Web Vitals
    const audits = data.lighthouseResult?.audits || {};
    results.lcp = audits['largest-contentful-paint']?.numericValue;
    results.cls = audits['cumulative-layout-shift']?.numericValue;
    results.fcp = audits['first-contentful-paint']?.numericValue;

    if (results.performanceScore < 50) results.issues.push('Poor performance score');
    if (results.seoScore < 50) results.issues.push('Poor SEO score');
    if (results.lcp && results.lcp > 4000) results.issues.push('Slow Largest Contentful Paint');

  } catch (err) {
    results.issues.push(`PageSpeed API error: ${err.message}`);
  }

  return results;
}

/**
 * SSL Scanner — checks certificate validity
 */
async function scanSSL(url) {
  const results = {
    valid: false,
    issuer: '',
    daysRemaining: 0,
    expiresAt: null,
    issues: [],
  };

  try {
    const hostname = new URL(url).hostname;
    const https = require('https');

    await new Promise((resolve, reject) => {
      const req = https.get(`https://${hostname}`, { timeout: 10000 }, (res) => {
        const cert = res.socket.getPeerCertificate();
        if (cert && cert.valid_to) {
          results.valid = true;
          results.expiresAt = cert.valid_to;
          results.issuer = cert.issuer?.O || '';
          const expiryDate = new Date(cert.valid_to);
          results.daysRemaining = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

          if (results.daysRemaining < 0) {
            results.valid = false;
            results.issues.push('SSL certificate has expired');
          } else if (results.daysRemaining < 30) {
            results.issues.push(`SSL certificate expires in ${results.daysRemaining} days`);
          }
        } else {
          results.issues.push('Could not read SSL certificate');
        }
        resolve();
      });
      req.on('error', (err) => {
        results.issues.push(`SSL check failed: ${err.message}`);
        resolve();
      });
      req.end();
    });
  } catch (err) {
    results.issues.push(`SSL check error: ${err.message}`);
  }

  return results;
}

/**
 * CMS Detector — fingerprints common platforms from HTML source
 */
async function detectCMS(url) {
  const results = {
    cms: 'unknown',
    version: null,
    issues: [],
  };

  try {
    const { data: html, headers } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'LinInfotechLeadGen/1.0' },
    });
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();

    // WordPress
    if (htmlLower.includes('wp-content') || htmlLower.includes('wp-includes')) {
      results.cms = 'WordPress';
      const generatorMeta = $('meta[name="generator"]').attr('content');
      if (generatorMeta && generatorMeta.toLowerCase().includes('wordpress')) {
        results.version = generatorMeta.replace(/WordPress\s*/i, '').trim();
      }
    }
    // Shopify
    else if (htmlLower.includes('shopify') || htmlLower.includes('cdn.shopify.com')) {
      results.cms = 'Shopify';
    }
    // Wix
    else if (htmlLower.includes('wix.com') || htmlLower.includes('_wixsite')) {
      results.cms = 'Wix';
    }
    // Squarespace
    else if (htmlLower.includes('squarespace')) {
      results.cms = 'Squarespace';
    }
    // Joomla
    else if (htmlLower.includes('/media/jui/') || htmlLower.includes('joomla')) {
      results.cms = 'Joomla';
    }
    // Drupal
    else if (htmlLower.includes('drupal') || htmlLower.includes('/sites/default/')) {
      results.cms = 'Drupal';
    }
    // Webflow
    else if (htmlLower.includes('webflow')) {
      results.cms = 'Webflow';
    }
    // GoDaddy Website Builder
    else if (htmlLower.includes('godaddy')) {
      results.cms = 'GoDaddy Website Builder';
    }

    // Check for outdated CMS via generator meta
    const generator = $('meta[name="generator"]').attr('content') || '';
    if (generator) {
      results.generatorTag = generator;
    }

    // Check copyright year
    const footerText = $('footer').text();
    const yearMatch = footerText.match(/©?\s*(?:copyright\s*)?(\d{4})/i);
    if (yearMatch) {
      const copyrightYear = parseInt(yearMatch[1], 10);
      const currentYear = new Date().getFullYear();
      if (currentYear - copyrightYear >= 2) {
        results.issues.push(`Copyright year is ${copyrightYear} (${currentYear - copyrightYear} years stale)`);
      }
      results.copyrightYear = copyrightYear;
    }

  } catch (err) {
    results.issues.push(`CMS detection error: ${err.message}`);
  }

  return results;
}

/**
 * Tech Stack Detector — checks for known libraries and tools in page source
 */
async function detectTechStack(url) {
  const results = {
    technologies: [],
    hasAnalytics: false,
    hasCRM: false,
    hasChatbot: false,
    hasAutomation: false,
    legacyTech: [],
    issues: [],
  };

  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'LinInfotechLeadGen/1.0' },
    });
    const htmlLower = html.toLowerCase();

    // Analytics
    if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag') || htmlLower.includes('ga.js')) {
      results.technologies.push('Google Analytics');
      results.hasAnalytics = true;
    }
    if (htmlLower.includes('facebook.com/tr') || htmlLower.includes('fbq(')) {
      results.technologies.push('Facebook Pixel');
      results.hasAnalytics = true;
    }

    // CRM / Automation
    if (htmlLower.includes('hubspot')) { results.technologies.push('HubSpot'); results.hasCRM = true; }
    if (htmlLower.includes('salesforce')) { results.technologies.push('Salesforce'); results.hasCRM = true; }
    if (htmlLower.includes('zoho')) { results.technologies.push('Zoho'); results.hasCRM = true; }
    if (htmlLower.includes('intercom')) { results.technologies.push('Intercom'); results.hasCRM = true; }
    if (htmlLower.includes('zapier')) { results.technologies.push('Zapier'); results.hasAutomation = true; }
    if (htmlLower.includes('mailchimp')) { results.technologies.push('Mailchimp'); results.hasAutomation = true; }

    // Chatbot
    if (htmlLower.includes('tidio') || htmlLower.includes('tawk.to') || htmlLower.includes('crisp') ||
        htmlLower.includes('drift') || htmlLower.includes('livechat') || htmlLower.includes('zendesk')) {
      results.hasChatbot = true;
      results.technologies.push('Live Chat / Chatbot detected');
    }

    // Legacy tech
    if (htmlLower.includes('jquery')) {
      results.technologies.push('jQuery');
      // Check if it's the ONLY JS framework (legacy signal)
      if (!htmlLower.includes('react') && !htmlLower.includes('vue') && !htmlLower.includes('angular') && !htmlLower.includes('next')) {
        results.legacyTech.push('jQuery-only (no modern framework)');
      }
    }
    if (htmlLower.includes('flash') || htmlLower.includes('swfobject')) {
      results.legacyTech.push('Flash content detected');
    }
    if (htmlLower.includes('bootstrap/3') || htmlLower.includes('bootstrap/2')) {
      results.legacyTech.push('Outdated Bootstrap version');
    }

    // Frameworks
    if (htmlLower.includes('react') || htmlLower.includes('__next')) results.technologies.push('React/Next.js');
    if (htmlLower.includes('vue')) results.technologies.push('Vue.js');
    if (htmlLower.includes('angular')) results.technologies.push('Angular');

    // HTTPS check
    if (url.startsWith('http://')) {
      results.issues.push('Site not using HTTPS');
    }

    if (!results.hasCRM && !results.hasAutomation) {
      results.issues.push('No CRM or automation tools detected');
    }
    if (!results.hasChatbot) {
      results.issues.push('No chatbot or live chat detected');
    }

  } catch (err) {
    results.issues.push(`Tech stack detection error: ${err.message}`);
  }

  return results;
}

/**
 * Broken Link Checker — checks first N links on a page for 404s
 */
async function checkBrokenLinks(url, maxLinks = 20) {
  const results = {
    totalLinks: 0,
    brokenLinks: [],
    brokenCount: 0,
    issues: [],
  };

  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'LinInfotechLeadGen/1.0' },
    });
    const $ = cheerio.load(html);
    const baseUrl = new URL(url);

    const links = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        try {
          const fullUrl = new URL(href, baseUrl.origin);
          if (fullUrl.hostname === baseUrl.hostname) {
            links.push(fullUrl.href);
          }
        } catch {}
      }
    });

    results.totalLinks = links.length;
    const uniqueLinks = [...new Set(links)].slice(0, maxLinks);

    for (const link of uniqueLinks) {
      try {
        const response = await axios.head(link, { timeout: 5000, maxRedirects: 3 });
        if (response.status >= 400) {
          results.brokenLinks.push({ url: link, status: response.status });
        }
      } catch (err) {
        if (err.response && err.response.status >= 400) {
          results.brokenLinks.push({ url: link, status: err.response.status });
        }
      }
    }

    results.brokenCount = results.brokenLinks.length;
    if (results.brokenCount > 0) {
      results.issues.push(`${results.brokenCount} broken link(s) found`);
    }

  } catch (err) {
    results.issues.push(`Link check error: ${err.message}`);
  }

  return results;
}

/**
 * Full Scan Orchestrator — runs all relevant scans for a lead
 */
async function runFullScan(leadId) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');
  if (!lead.website_url) throw new Error('Lead has no website URL to scan');

  const url = lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`;
  const scanResults = [];

  // Run all scans in parallel
  const [seoResult, pageSpeedResult, sslResult, cmsResult, techResult, linksResult] = await Promise.allSettled([
    scanSEO(url),
    scanPageSpeed(url),
    scanSSL(url),
    detectCMS(url),
    detectTechStack(url),
    checkBrokenLinks(url),
  ]);

  // Store each scan result
  const scans = [
    { type: 'seo', result: seoResult },
    { type: 'pagespeed', result: pageSpeedResult },
    { type: 'ssl', result: sslResult },
    { type: 'cms', result: cmsResult },
    { type: 'tech_stack', result: techResult },
    { type: 'links', result: linksResult },
  ];

  for (const scan of scans) {
    const data = scan.result.status === 'fulfilled' ? scan.result.value : { error: scan.result.reason?.message };
    const score = data.score || data.performanceScore || null;

    const record = await prisma.scanResult.create({
      data: {
        lead_id: leadId,
        scan_type: scan.type,
        result_data: JSON.stringify(data),
        score,
      },
    });
    scanResults.push(record);
  }

  // Collect all issues
  const allIssues = [];
  for (const scan of scans) {
    if (scan.result.status === 'fulfilled' && scan.result.value.issues) {
      allIssues.push(...scan.result.value.issues);
    }
  }

  // Update lead with scan findings
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      pain_points: JSON.stringify(allIssues.slice(0, 20)),
      last_checked: new Date(),
      tab_data: JSON.stringify(buildTabData(lead.tab_category, scans)),
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      lead_id: leadId,
      type: 'scan_completed',
      description: `Full scan completed. Found ${allIssues.length} issue(s).`,
    },
  });

  return { scanResults, issues: allIssues };
}

function buildTabData(tabCategory, scans) {
  const getData = (type) => {
    const s = scans.find(s => s.type === type);
    return s?.result?.status === 'fulfilled' ? s.result.value : {};
  };

  switch (tabCategory) {
    case 'weak_seo': {
      const seo = getData('seo');
      const ps = getData('pagespeed');
      return {
        pagespeed_score: ps.performanceScore || 0,
        seo_score: seo.score || 0,
        indexed_pages_count: null,
        top_missing_seo_items: seo.issues?.slice(0, 5) || [],
      };
    }
    case 'maintenance': {
      const cms = getData('cms');
      const ssl = getData('ssl');
      const links = getData('links');
      return {
        cms_detected: cms.cms || 'unknown',
        last_content_update_estimate: cms.copyrightYear ? `${cms.copyrightYear}` : null,
        broken_link_count: links.brokenCount || 0,
        ssl_status: ssl.valid ? 'valid' : 'invalid',
        ssl_expiry: ssl.expiresAt || null,
      };
    }
    case 'agentic_ai': {
      const tech = getData('tech_stack');
      return {
        detected_manual_workflows: tech.issues || [],
        suggested_use_case: !tech.hasChatbot ? 'Customer support chatbot / AI agent' : null,
        automation_roi_note: !tech.hasAutomation ? 'No automation tools detected — high ROI potential' : null,
      };
    }
    case 'legacy_tech': {
      const tech = getData('tech_stack');
      const ssl = getData('ssl');
      return {
        detected_legacy_stack: tech.legacyTech || [],
        has_https: !tech.issues?.includes('Site not using HTTPS'),
        last_major_update: null,
      };
    }
    case 'ecommerce': {
      const tech = getData('tech_stack');
      return {
        current_platform: tech.technologies?.find(t => ['Shopify', 'WooCommerce', 'Magento'].includes(t)) || 'unknown',
        missing_features: [],
        has_mobile_checkout: null,
      };
    }
    default:
      return {};
  }
}

module.exports = {
  scanSEO, scanPageSpeed, scanSSL, detectCMS, detectTechStack,
  checkBrokenLinks, runFullScan,
};
