export const DEFAULT_TEMPLATES = {
  no_website: {
    emailSubject: 'Digital Storefront Suggestion for {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>I was searching for local services and came across <strong>{{COMPANY_NAME}}</strong>. I noticed that you don't currently have an active website online.</p>
<p>Over 80% of local customers check a business's website before visiting. By not having a digital storefront, you might be losing valuable customers to competitors who do.</p>
<p>We specialize in building fast, secure, and mobile-friendly websites specifically tailored for businesses like yours. Would you be open to a quick 10-minute call next week to see how we can build a custom site for you to boost your local bookings and sales?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! I noticed {{COMPANY_NAME}} doesn't have a website yet. We specialize in building fast, mobile-friendly sites for local businesses. Would you be open to a quick chat about setting one up?`
  },
  weak_seo: {
    emailSubject: 'Improving Google ranking for {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>We ran a quick SEO and performance audit on your website ({{WEBSITE_URL}}) and identified a few critical elements that are lowering your search engine ranking and page load speeds.</p>
<p>Specifically, we noticed issues related to: <em>{{PAIN_POINTS}}</em>.</p>
<p>Fixing these issues can significantly increase your website's visibility on Google and drive more organic traffic. We have put together a detailed SEO roadmap for {{COMPANY_NAME}}. Let me know if you would like me to share it with you, or if we can jump on a brief call to discuss it!</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We ran an SEO scan on {{WEBSITE_URL}} and found some issues limiting your ranking on Google. Would you like us to send over the free optimization report?`
  },
  agentic_ai: {
    emailSubject: 'Automating manual workflows at {{COMPANY_NAME}} with AI Agents',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>In reviewing {{COMPANY_NAME}}'s operations, we identified key areas where manual repetitive processes (such as <em>{{PAIN_POINTS}}</em>) could be automated using intelligent AI agents.</p>
<p>By implementing tailored AI assistants and workflow automation, businesses typically reduce operational costs by 30% and free up team hours for high-value tasks. Our suggested AI use case for you is: <strong>{{PITCH_ANGLE}}</strong>.</p>
<p>Would you be open to a short demo of how an AI Agent can run in your business to handle customer queries or automate your workflows?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We specialize in building AI Agents to automate repetitive tasks. We saw some great opportunities to streamline operations at {{COMPANY_NAME}}. Let me know if you'd like to see a brief demo!`
  },
  maintenance: {
    emailSubject: 'Website optimization & maintenance for {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>We visited {{WEBSITE_URL}} and noticed that it might need some technical updates. A regular maintenance routine ensures your site remains secure, fast, and fully functional for visitors.</p>
<p>We detected issues like: <em>{{PAIN_POINTS}}</em>.</p>
<p>Our website care and maintenance plans handle backups, security updates, broken link fixes, and performance tuning so you can focus on running {{COMPANY_NAME}}. Can we hop on a brief call to discuss keeping your site in peak condition?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We noticed some broken links/SSL issues on {{WEBSITE_URL}} that could affect customer trust. We help businesses manage and secure their websites. Would love to help you fix these!`
  },
  erp: {
    emailSubject: 'Custom Management System for {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>Managing multi-branch operations, inventory, and billing on separate spreadsheets can be chaotic. We noticed {{COMPANY_NAME}} could benefit from a unified, custom ERP system to consolidate your operations.</p>
<p>A central management system will connect your billing, inventory, and branch tracking in real time, saving you hours of reconciliation work. We suggest: <strong>{{PITCH_ANGLE}}</strong>.</p>
<p>Could we book a quick demonstration of our custom modular ERP solutions to show how it can streamline your inventory and reports?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We help expanding businesses build custom ERP systems to link their billing, stock, and staff together. Let me know if you'd be open to seeing a 5-minute dashboard demo!`
  },
  ecommerce: {
    emailSubject: 'Boosting sales and conversions on {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>We took a look at your e-commerce storefront ({{WEBSITE_URL}}) and think it's fantastic. However, we noticed a few conversion optimizations that could help reduce cart abandonment and increase sales.</p>
<p>By implementing features such as: <em>{{PAIN_POINTS}}</em>, you can offer a smoother checkout experience and capture missed revenue.</p>
<p>We build high-performance e-commerce solutions that drive conversions. Would you be open to a short call next week to discuss strategies to boost sales for {{COMPANY_NAME}}?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We analyzed the checkout process on {{WEBSITE_URL}} and found some simple additions to improve your sales conversion rate. Let us know if you'd be open to a quick call.`
  },
  legacy_tech: {
    emailSubject: 'Tech Stack Modernization for {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>Having an outdated tech stack can expose your website to security vulnerabilities, slow page loads, and poor mobile usability. We analyzed {{WEBSITE_URL}} and noticed some legacy tech components.</p>
<p>Modernizing your codebase will lead to faster page loads, better search rankings, and a significantly safer platform for your visitors. We propose: <strong>{{PITCH_ANGLE}}</strong>.</p>
<p>Are you open to a brief discussion about modernizing your platform to improve performance and user security?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We noticed some outdated libraries/performance issues on {{WEBSITE_URL}}. We specialize in upgrading legacy tech to modern, secure, and lightning-fast frameworks. Can we chat?`
  },
  rfp_watch: {
    emailSubject: 'Inquiry regarding RFP Opportunity - {{COMPANY_NAME}}',
    emailBody: `<p>Hi {{CONTACT_NAME}},</p>
<p>We recently saw your active request for proposal (RFP) related to technology/software requirements. We believe Lin's Infotech is uniquely positioned to assist you with this project.</p>
<p>Our team has extensive experience delivering premium web, mobile, and custom software systems matching your budget and timeline criteria.</p>
<p>Could you let us know the best way to submit our credentials, or if we can jump on a brief call to align on your project scope?</p>
<p>Best regards,<br/>Outreach Team<br/>Lin's Infotech</p>`,
    whatsappMessage: `Hi {{CONTACT_NAME}}! We saw {{COMPANY_NAME}}'s active RFP for software development and would love to submit our proposal. Let us know who the best person to speak with is.`
  }
};

/**
 * Generates email and WhatsApp templates for a specific lead, replacing placeholders.
 * @param {Object} lead - The lead object with contact_name, company_name, website_url, pain_points, pitch_angle, tab_category.
 */
export function getOutreachTemplates(lead) {
  if (!lead) return null;
  
  const category = lead.tab_category || 'no_website';
  const defaultTemplate = DEFAULT_TEMPLATES[category] || DEFAULT_TEMPLATES.no_website;
  
  const contactName = lead.contact_name || 'Team';
  const companyName = lead.company_name || 'your company';
  const websiteUrl = lead.website_url || 'your website';
  const pitchAngle = lead.pitch_angle || 'custom solution';
  
  // Format pain points nicely as a list
  let painPointsText = 'general improvements';
  if (lead.pain_points) {
    let ppts = [];
    try {
      ppts = typeof lead.pain_points === 'string' ? JSON.parse(lead.pain_points) : lead.pain_points;
    } catch {
      ppts = Array.isArray(lead.pain_points) ? lead.pain_points : [];
    }
    if (ppts.length > 0) {
      painPointsText = ppts.join(', ');
    }
  }

  const replacePlaceholders = (text) => {
    if (!text) return '';
    return text
      .replace(/{{CONTACT_NAME}}/g, contactName)
      .replace(/{{COMPANY_NAME}}/g, companyName)
      .replace(/{{WEBSITE_URL}}/g, websiteUrl)
      .replace(/{{PITCH_ANGLE}}/g, pitchAngle)
      .replace(/{{PAIN_POINTS}}/g, painPointsText);
  };

  return {
    subject: replacePlaceholders(defaultTemplate.emailSubject),
    emailBody: replacePlaceholders(defaultTemplate.emailBody),
    whatsappMessage: replacePlaceholders(defaultTemplate.whatsappMessage),
  };
}
