/**
 * English UI dictionary. Its type is derived from the Arabic dictionary, so
 * TypeScript reports any key that is missing here or that exists only here.
 * Written natively for English readers; see docs/redesign/CONTENT-RULES.md.
 */
import type { Dictionary } from './types';

export const en: Dictionary = {
  meta: {
    titleSuffix: 'Recovik · Data Recovery Experts',
    home: {
      title: 'Recovik · Ransomware and data loss recovery',
      description:
        'We decrypt or rebuild data hit by ransomware, recover deleted and corrupted data, investigate what happened and close the gap.',
    },
    services: {
      title: 'Services',
      description:
        'Ransomware recovery, deleted data recovery, digital forensics, database and file recovery, cloud and SaaS recovery, post-incident hardening.',
    },
    sectors: {
      title: 'Who we work with',
      description:
        'Incident recovery for individuals, small businesses, companies, government, healthcare, finance, legal and education.',
    },
    process: {
      title: 'How we work',
      description:
        'Contain, investigate, recover, harden: the four stages of every Recovik incident response.',
    },
    about: {
      title: 'About',
      description:
        'Recovik is a software-based data recovery team that specialises in cybersecurity incidents.',
    },
    faq: {
      title: 'FAQ',
      description:
        'Answers on ransom payments, confidentiality, evidence, remote work, timing and cost during a data incident.',
    },
    startCase: {
      title: 'Start a case',
      description:
        'Report an incident in five short steps. An incident lead contacts you to scope the response.',
    },
    contact: {
      title: 'Contact',
      description: 'Incident line, email, office address and a form for general questions.',
    },
    privacy: {
      title: 'Privacy policy',
      description: 'How Recovik handles your personal data and your organisation’s data.',
    },
    terms: {
      title: 'Terms of service',
      description: 'The terms under which Recovik provides incident response and recovery.',
    },
    notFound: { title: 'Page not found', description: 'This page does not exist.' },
    caseSent: { title: 'Case received', description: 'Your incident report reached our team.' },
    contactSent: { title: 'Message received', description: 'Your message reached our team.' },
  },

  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    themeDark: 'Dark theme',
    languageSwitch: 'Change language',
    breadcrumb: 'Breadcrumb',
    newTab: '(opens in a new tab)',
    whatsapp: 'Message us on WhatsApp',
    servicesMenu: 'Show services',
  },

  nav: {
    home: 'Home',
    services: 'Services',
    sectors: 'Sectors',
    process: 'How we work',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    startCase: 'Start a case',
    allServices: 'All services',
  },

  cta: {
    startCase: 'Start a case',
    callEmergency: 'Call the incident line',
    incident: 'Incident? Call now',
    incidentShort: 'Incident?',
    whatsapp: 'WhatsApp',
    backHome: 'Back to the home page',
    openMap: 'Open in maps',
  },

  emergencyBanner: {
    text: 'Under attack right now? The incident line is open 24/7.',
    action: 'Call',
  },

  common: {
    illustration: 'Illustration',
    lastUpdated: 'Last updated',
    optional: 'optional',
    phone: 'Phone',
    emergency: 'Incident line',
    available247: 'Answered 24/7',
    email: 'Email',
    whatsapp: 'WhatsApp',
    address: 'Address',
    hours: 'Working hours',
    placeholderNote: 'Content in preparation',
  },

  home: {
    hero: {
      label: 'Ransomware and data recovery',
      title: 'Hit by ransomware or lost critical data? We get it back.',
      lead: 'We contain the attack, decrypt or rebuild your files and databases, and show you exactly how it happened.',
      trust: {
        nda: 'Confidential, NDA on request',
        report: 'Written investigation report',
      },
      console: {
        title: 'Incident console',
        phases: ['Contain', 'Investigate', 'Recover'],
        locked: 'Encrypted',
        restored: 'Restored',
      },
    },
    firstAid: {
      label: 'Incident first aid',
      title: 'First hour of an attack: do this',
      steps: [
        { title: 'Disconnect', body: 'Take affected devices off the network. Leave them switched on.' },
        { title: 'Don’t engage', body: 'Don’t pay, reply to or negotiate with the attackers yet.' },
        {
          title: 'Don’t wipe',
          body: 'Don’t delete, restore over or reinstall anything. The evidence is there.',
        },
        { title: 'Call us', body: 'We guide the next steps on the phone.' },
      ],
    },
    services: {
      label: 'Services',
      title: 'Six ways back from a data incident',
      lead: 'From the first hour of an attack to the fix that stops it happening again.',
      action: 'Explore services',
    },
    ransomware: {
      label: 'Ransomware',
      title: 'Decryption first. Reconstruction when there is no key.',
      stages: [
        { title: 'Decrypt', body: 'Known decryptors where they exist, and our own analysis of the strain.' },
        {
          title: 'Rebuild',
          body: 'Our own tools reconstruct files and databases from what remains, with integrity checks.',
        },
      ],
      action: 'How ransomware recovery works',
    },
    process: {
      label: 'Process',
      title: 'Contain. Investigate. Recover. Harden.',
      lead: 'Every case moves through the same four stages, in this order.',
      action: 'See each stage',
    },
    commitments: {
      label: 'Commitments',
      title: 'What you can count on',
      items: [
        {
          title: 'Confidential by default',
          body: 'Only the analysts on your case see your data. NDA on request.',
        },
        {
          title: 'Evidence preserved',
          body: 'We work on copies and log a chain of custody, so findings hold up.',
        },
        { title: 'A written report', body: 'A timeline of what happened, what we found and what we did.' },
        { title: 'Price agreed first', body: 'Scope and cost are settled before recovery work begins.' },
      ],
    },
    sectors: {
      label: 'Sectors',
      title: 'From one person’s laptop to a ministry’s file servers.',
      action: 'Who we work with',
    },
    stats: {
      label: 'In numbers',
      casesHandled: 'cases handled',
      yearsOfExperience: 'years in incident recovery',
      successRate: 'of ransomware cases fully or largely restored',
    },
  },

  process: {
    title: 'Four stages, from the first call to a closed gap.',
    lead: 'You always know which stage we are in and what comes next.',
    whatWeDo: 'What we do',
    outcome: 'You get',
    steps: [
      {
        title: 'Contain',
        summary: 'Stop the spread and protect what is still clean.',
        detail:
          'We help you isolate affected systems, secure untouched backups and accounts, and capture volatile evidence before it disappears.',
        outcome: 'An incident that has stopped growing, with evidence intact.',
      },
      {
        title: 'Investigate',
        summary: 'Find out how they got in and what they touched.',
        detail:
          'We analyse logs, systems and the malware itself to identify the entry point, the scope of damage and the exact ransomware strain.',
        outcome: 'A defined scope and an attack timeline.',
      },
      {
        title: 'Recover',
        summary: 'Decrypt, or rebuild from what remains.',
        detail:
          'Where a decryption path exists we take it. Where it doesn’t, our own tools reconstruct files and databases, verified at every step.',
        outcome: 'Verified data, handed back in a usable form.',
      },
      {
        title: 'Harden',
        summary: 'Close the gap and make backups survive the next attack.',
        detail:
          'We fix the weakness that was exploited, tighten access, and set up backups that attackers cannot reach or delete.',
        outcome: 'The final report and an environment that is harder to hit.',
      },
    ],
    priceTitle: 'When is the price agreed?',
    priceBody:
      'Once the investigation has scoped the damage, and before recovery starts. Advice on the first call costs nothing.',
  },

  services: {
    title: 'Recovery and response services',
    lead: 'Each service stands on its own or runs as one part of a full incident response.',
    sections: {
      whatIs: 'What it is',
      signs: 'Signs you need this',
      whatWeDo: 'What we do',
      deliverables: 'What you get',
      weNeed: 'What we need from you',
      faq: 'Questions',
    },
    otherServices: 'Other services',
    startForThis: 'Start a case',
  },

  sectors: {
    title: 'Who we work with',
    lead: 'Every sector fears something different after an attack. We start from that.',
    caresAbout: 'What matters most',
    howWeWork: 'How we work with you',
  },

  about: {
    label: 'About',
    title: 'Software-based recovery for cyber incidents.',
    lead: 'We bring data back after attacks and deletions, find out what happened, and close the gap. We work on systems, files and evidence — never on hardware repair.',
    storyTitle: 'Our story',
    approachTitle: 'How we think',
    approach: [
      { title: 'Evidence before action', body: 'We record what we find before we change anything.' },
      {
        title: 'Plain answers',
        body: 'What can be recovered, what cannot, and why — in words you can pass to your board.',
      },
      { title: 'Fix the cause', body: 'Restoring data without closing the gap invites the next attack.' },
      {
        title: 'One point of contact',
        body: 'A named incident lead stays with you from first call to final report.',
      },
    ],
    teamTitle: 'The team',
  },

  faq: {
    title: 'Questions people ask during an incident',
    lead: 'Not answered here? Call the incident line and an analyst will pick up.',
    categories: {
      ransom: 'Ransom and attackers',
      privacy: 'Confidentiality and evidence',
      working: 'Working with us',
      cost: 'Time and cost',
    },
  },

  caseForm: {
    label: 'New case',
    title: 'Report an incident',
    lead: 'Five short steps. Only our response team sees your answers.',
    progress: (current: number, total: number) => `Step ${current} of ${total}`,
    next: 'Next',
    back: 'Back',
    submit: 'Send report',
    sending: 'Sending…',
    edit: 'Edit',
    steps: {
      systems: 'Systems',
      incident: 'Incident',
      urgency: 'Urgency',
      contact: 'Your details',
      review: 'Review',
    },
    fields: {
      systemType: 'What is affected?',
      systemDetails: 'Systems and software, if you know',
      systemDetailsHint: 'For example: Windows file server, SQL Server, Microsoft 365.',
      incident: 'What happened?',
      details: 'Describe what you see',
      detailsHint: 'When did it start? Is there a ransom note? Has anything been changed since?',
      urgency: 'How urgent is it?',
      name: 'Name',
      phone: 'Phone number',
      phoneHint: 'International format if possible, e.g. +966…',
      email: 'Email',
      contactMethod: 'How should we contact you?',
      organization: 'Organisation',
      consent: 'I agree that Recovik may contact me about this report, as described in the privacy policy.',
    },
    systems: {
      files: 'Files and file servers',
      databases: 'Databases',
      email: 'Email and mailboxes',
      cloud: 'Cloud and SaaS (Microsoft 365, Google Workspace…)',
      virtual: 'Virtual machines',
      endpoints: 'Laptops and workstations',
      other: 'Not sure yet',
    },
    incidents: {
      ransomware: 'Files encrypted, ransom demanded',
      deleted: 'Data deleted, by mistake or on purpose',
      intrusion: 'Suspected intrusion or data theft',
      corrupted: 'Data corrupted or inaccessible',
      other: 'Something else',
    },
    urgencies: {
      standard: 'Standard',
      priority: 'Priority',
      emergency: 'Emergency — operations have stopped',
    },
    urgencyHints: {
      standard: 'We contact you during working hours.',
      priority: 'Your case moves to the front of the queue.',
      emergency: 'We call you straight away, day or night.',
    },
    contactMethods: {
      phone: 'Phone call',
      whatsapp: 'WhatsApp',
      email: 'Email',
    },
    reviewLead: 'Check your answers. Select “Edit” to change any of them.',
    reviewEmpty: 'Not given',
    noScriptNote: 'Check your answers above, then send the report.',
    privacyNote: 'Your report goes straight to our team. It is not stored by any third party.',
  },

  contactPage: {
    label: 'Contact',
    title: 'Talk to an analyst',
    lead: 'For an active incident, call. For anything else, write to us.',
    channelsTitle: 'Ways to reach us',
    formTitle: 'Send a message',
    formLead: 'General questions, partnerships and quotes for planned work.',
    fields: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone number',
      subject: 'Subject',
      message: 'Your message',
      consent: 'I agree that Recovik may contact me about my message, as described in the privacy policy.',
    },
    submit: 'Send message',
  },

  errors: {
    summaryTitle: 'Please check the following fields:',
    required: 'This field is required.',
    tooLong: 'This is longer than allowed.',
    email: 'Enter a valid email address, like name@example.com.',
    phone: 'Enter a valid phone number of 7 to 15 digits.',
    choice: 'Choose one of the options.',
    consent: 'We need your consent to contact you.',
    generic: 'We couldn’t send this just now. Please try again, or call us directly.',
    rateLimited: 'Too many attempts from your connection. Wait a few minutes and try again.',
    captcha: 'We couldn’t confirm you’re not an automated program. Refresh the page and try again.',
  },

  receipt: {
    caseTitle: 'We have your report.',
    caseBody: 'An incident lead will contact you shortly. Keep this case number for reference.',
    caseRef: 'Case number',
    caseMeanwhile: 'Until we call: keep affected devices off the network and don’t delete anything.',
    messageTitle: 'Your message reached us.',
    messageBody: 'We reply within one working day.',
    errorTitle: 'Your form was not sent.',
    backToForm: 'Back to the form',
  },

  footer: {
    ctaTitle: 'Something happening right now?',
    ctaLead: 'Call the incident line or open a case. We start with containment.',
    lead: 'Data recovery and response for cybersecurity incidents.',
    servicesTitle: 'Services',
    companyTitle: 'Company',
    resourcesTitle: 'Resources',
    contactTitle: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    security: 'Report a vulnerability',
    rights: 'All rights reserved.',
  },

  notFound: {
    label: 'Error 404',
    title: 'This page doesn’t exist.',
    body: 'The link may be old or mistyped. Try one of these:',
  },
};
