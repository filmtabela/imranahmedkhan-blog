const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ============================================================
// CONFIGURATION
// ============================================================
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const SITE_DIR = process.cwd();
const SITE_NAME = "Imran Ahmed Khan";
const SITE_TAGLINE = "Power. Wealth. Strategy.";
const SITE_URL = "https://imranahmedkhan.com";
const AMAZON_TAG = "bollywooded0f-21"; // Amazon.in associate tag
// ============================================================

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ============================================================
// 200 TOPICS ACROSS 17 CATEGORIES
// ============================================================
const TOPICS = [
  // AI TOOLS
  { title: "Best AI Tools For Small Businesses in 2025", category: "AI Tools", type: "buyer-intent", tags: ["AI", "Small Business", "Productivity"], affiliates: ["semrush", "canva", "hostinger"], pexelsQuery: "artificial intelligence technology laptop" },
  { title: "Claude vs ChatGPT: Which AI Is Better For Entrepreneurs", category: "AI Tools", type: "comparison", tags: ["Claude", "ChatGPT", "AI Comparison"], affiliates: ["canva"], pexelsQuery: "technology comparison laptop workspace" },
  { title: "Best AI Writing Tools For Content Creators", category: "AI Tools", type: "buyer-intent", tags: ["AI Writing", "Content", "Automation"], affiliates: ["semrush", "canva"], pexelsQuery: "content creator writing laptop" },
  { title: "How Entrepreneurs Are Using AI To Build Wealth Faster", category: "AI Tools", type: "wealth", tags: ["AI", "Entrepreneurship", "Automation"], affiliates: ["semrush"], pexelsQuery: "entrepreneur laptop modern office" },
  { title: "Best AI Tools For Market Research and Competitor Analysis", category: "AI Tools", type: "buyer-intent", tags: ["AI", "Market Research", "SEO"], affiliates: ["semrush"], pexelsQuery: "market research data analytics" },
  { title: "AI Automation: How To Run a Business With Zero Staff", category: "AI Tools", type: "wealth", tags: ["AI", "Automation", "Solo Business"], affiliates: ["canva", "hostinger"], pexelsQuery: "automation business technology" },
  { title: "Best AI Tools For Social Media Marketing in 2025", category: "AI Tools", type: "buyer-intent", tags: ["AI", "Social Media", "Marketing"], affiliates: ["canva", "semrush"], pexelsQuery: "social media marketing phone" },
  { title: "The Rise of AI Millionaires: How Ordinary People Are Getting Rich With AI", category: "AI Tools", type: "wealth", tags: ["AI", "Millionaires", "Wealth"], affiliates: ["semrush"], pexelsQuery: "success wealth technology modern" },

  // BUSINESS SOFTWARE
  { title: "Best CRM Software For Consultants and Coaches", category: "Business Software", type: "buyer-intent", tags: ["CRM", "Consultants", "Software"], affiliates: ["semrush", "hostinger"], pexelsQuery: "business software crm laptop" },
  { title: "Best Website Builders For Entrepreneurs in 2025", category: "Business Software", type: "buyer-intent", tags: ["Website", "Hostinger", "Builders"], affiliates: ["hostinger"], pexelsQuery: "website design laptop modern" },
  { title: "Hostinger vs Bluehost: Which Hosting Is Best For Business", category: "Business Software", type: "comparison", tags: ["Hostinger", "Hosting", "Comparison"], affiliates: ["hostinger"], pexelsQuery: "web hosting server technology" },
  { title: "Best VPNs For Entrepreneurs and Remote Workers", category: "Business Software", type: "buyer-intent", tags: ["VPN", "Remote Work", "Security"], affiliates: ["vpn"], pexelsQuery: "vpn security remote work laptop" },
  { title: "Best Project Management Tools For Growing Teams", category: "Business Software", type: "buyer-intent", tags: ["Project Management", "Teams", "Software"], affiliates: ["semrush"], pexelsQuery: "project management team collaboration" },
  { title: "Canva vs Adobe Express: Which Design Tool Wins For Business", category: "Business Software", type: "comparison", tags: ["Canva", "Design", "Comparison"], affiliates: ["canva"], pexelsQuery: "graphic design creative tools" },
  { title: "Best Email Marketing Platforms For High Ticket Businesses", category: "Business Software", type: "buyer-intent", tags: ["Email Marketing", "Business", "Software"], affiliates: ["semrush"], pexelsQuery: "email marketing business laptop" },
  { title: "Best SEO Tools For Ranking Your Business Website", category: "Business Software", type: "buyer-intent", tags: ["SEO", "Semrush", "Business"], affiliates: ["semrush"], pexelsQuery: "seo analytics laptop business" },

  // WEALTH CREATION
  { title: "How New Millionaires Invest Their First Million", category: "Wealth Creation", type: "wealth", tags: ["Millionaires", "Investing", "Wealth"], affiliates: ["amazon"], pexelsQuery: "investment wealth finance luxury" },
  { title: "10 Wealth Habits of Self-Made Millionaires Under 40", category: "Wealth Creation", type: "wealth", tags: ["Millionaires", "Habits", "Success"], affiliates: ["amazon"], pexelsQuery: "successful businessman wealth luxury" },
  { title: "How To Build Multiple Income Streams From Zero", category: "Wealth Creation", type: "wealth", tags: ["Income Streams", "Passive Income", "Wealth"], affiliates: ["hostinger", "semrush"], pexelsQuery: "multiple income streams passive wealth" },
  { title: "Wealth Migration Trends: Where The Rich Are Moving in 2025", category: "Wealth Creation", type: "wealth", tags: ["Wealth Migration", "UHNWI", "Global"], affiliates: ["amazon"], pexelsQuery: "luxury city skyline wealth migration" },
  { title: "How To Go From Middle Class To Millionaire in 10 Years", category: "Wealth Creation", type: "wealth", tags: ["Millionaire", "Financial Freedom", "Strategy"], affiliates: ["amazon"], pexelsQuery: "financial growth success wealth" },
  { title: "The Psychology of Wealth: Why Some People Get Rich and Others Don't", category: "Wealth Creation", type: "wealth", tags: ["Psychology", "Wealth", "Mindset"], affiliates: ["amazon"], pexelsQuery: "mindset success businessman thinking" },
  { title: "Best Online Courses For Building Wealth in 2025", category: "Wealth Creation", type: "buyer-intent", tags: ["Online Courses", "Education", "Wealth"], affiliates: ["amazon", "semrush"], pexelsQuery: "online learning education laptop" },
  { title: "How Entrepreneurs Turn Knowledge Into Cash: The Expert Economy", category: "Wealth Creation", type: "wealth", tags: ["Expert Economy", "Knowledge", "Income"], affiliates: ["hostinger", "canva"], pexelsQuery: "expert knowledge business success" },

  // LUXURY LIFESTYLE
  { title: "Why Successful Men Wear Watches: The Psychology of Luxury", category: "Luxury Lifestyle", type: "luxury", tags: ["Watches", "Luxury", "Psychology"], affiliates: ["amazon"], pexelsQuery: "luxury watch successful man" },
  { title: "The Psychology of Luxury: Why We Buy What We Cannot Afford", category: "Luxury Lifestyle", type: "luxury", tags: ["Psychology", "Luxury", "Consumer Behaviour"], affiliates: ["amazon"], pexelsQuery: "luxury lifestyle psychology wealth" },
  { title: "Luxury Brands Growing Fastest in Emerging Markets", category: "Luxury Lifestyle", type: "luxury", tags: ["Luxury Brands", "Emerging Markets", "Growth"], affiliates: ["amazon"], pexelsQuery: "luxury brand store fashion" },
  { title: "Affordable Luxury: How To Live a Premium Life on a Budget", category: "Luxury Lifestyle", type: "luxury", tags: ["Affordable Luxury", "Lifestyle", "Smart Spending"], affiliates: ["amazon"], pexelsQuery: "affordable luxury lifestyle elegant" },
  { title: "The New Rules of Luxury: What Ultra Rich Buy Today", category: "Luxury Lifestyle", type: "luxury", tags: ["Ultra Rich", "UHNWI", "Luxury"], affiliates: ["amazon"], pexelsQuery: "ultra luxury modern wealth" },
  { title: "Luxury Travel Accessories Every Business Executive Needs", category: "Luxury Lifestyle", type: "buyer-intent", tags: ["Travel", "Luxury", "Business"], affiliates: ["amazon"], pexelsQuery: "business executive travel luxury accessories" },
  { title: "How The Ultra Wealthy Spend Their Time: Daily Routines of Billionaires", category: "Luxury Lifestyle", type: "luxury", tags: ["Billionaires", "Daily Routine", "Luxury"], affiliates: ["amazon"], pexelsQuery: "billionaire lifestyle luxury morning routine" },
  { title: "Private Members Clubs: The Hidden World of Elite Networking", category: "Luxury Lifestyle", type: "luxury", tags: ["Networking", "Elite", "Members Club"], affiliates: ["amazon"], pexelsQuery: "exclusive club luxury networking elite" },

  // PREMIUM MEN'S STYLE
  { title: "The Ultimate Guide To Men's Style For Entrepreneurs", category: "Premium Men's Style", type: "luxury", tags: ["Men's Style", "Entrepreneur", "Fashion"], affiliates: ["amazon"], pexelsQuery: "entrepreneur men style suit modern" },
  { title: "Best Suits For Men Under Rs 50000: Premium Picks", category: "Premium Men's Style", type: "buyer-intent", tags: ["Suits", "Men's Fashion", "Premium"], affiliates: ["amazon"], pexelsQuery: "men suit premium fashion business" },
  { title: "How To Dress For Power: The Executive Wardrobe Guide", category: "Premium Men's Style", type: "luxury", tags: ["Power Dressing", "Executive", "Men"], affiliates: ["amazon"], pexelsQuery: "power dressing executive men suit" },
  { title: "Best Leather Shoes For Men: From Boardroom to Black Tie", category: "Premium Men's Style", type: "buyer-intent", tags: ["Leather Shoes", "Men", "Premium"], affiliates: ["amazon"], pexelsQuery: "men leather shoes premium style" },
  { title: "Men's Grooming Essentials: The Billionaire's Grooming Routine", category: "Premium Men's Style", type: "buyer-intent", tags: ["Grooming", "Men", "Premium"], affiliates: ["amazon"], pexelsQuery: "men grooming premium skincare" },
  { title: "The Art of First Impressions: How Your Look Shapes Your Net Worth", category: "Premium Men's Style", type: "luxury", tags: ["First Impressions", "Style", "Success"], affiliates: ["amazon"], pexelsQuery: "first impression businessman confident style" },
  { title: "Best Fragrances For Men in Business: What Successful Men Wear", category: "Premium Men's Style", type: "buyer-intent", tags: ["Fragrance", "Men", "Business"], affiliates: ["amazon"], pexelsQuery: "men fragrance luxury perfume business" },
  { title: "Capsule Wardrobe For The Modern Male Entrepreneur", category: "Premium Men's Style", type: "luxury", tags: ["Capsule Wardrobe", "Entrepreneur", "Men"], affiliates: ["amazon"], pexelsQuery: "capsule wardrobe men minimal style" },

  // WATCHES
  { title: "Best Luxury Watches Under $1000 For Entrepreneurs", category: "Watches", type: "buyer-intent", tags: ["Watches", "Luxury", "Under $1000"], affiliates: ["amazon"], pexelsQuery: "luxury watch under 1000 elegant" },
  { title: "Rolex vs Omega: Which Watch Signals More Success", category: "Watches", type: "comparison", tags: ["Rolex", "Omega", "Luxury Watches"], affiliates: ["amazon"], pexelsQuery: "rolex omega luxury watch comparison" },
  { title: "The 10 Watches Every Successful Man Should Know", category: "Watches", type: "luxury", tags: ["Watches", "Success", "Men"], affiliates: ["amazon"], pexelsQuery: "collection luxury watches men wrist" },
  { title: "Why Billionaires Wear Cheap Watches: The Power Move Explained", category: "Watches", type: "luxury", tags: ["Billionaires", "Watches", "Strategy"], affiliates: ["amazon"], pexelsQuery: "simple watch billionaire minimal" },
  { title: "Best Indian Watch Brands That Rival Swiss Luxury", category: "Watches", type: "buyer-intent", tags: ["Indian Watches", "Luxury", "Premium"], affiliates: ["amazon"], pexelsQuery: "indian luxury watch premium brand" },
  { title: "Watches as Investments: Which Timepieces Appreciate in Value", category: "Watches", type: "wealth", tags: ["Watches", "Investment", "Luxury Assets"], affiliates: ["amazon"], pexelsQuery: "watch investment luxury asset value" },
  { title: "Smart Watch vs Luxury Watch: What Your Wrist Says About You", category: "Watches", type: "comparison", tags: ["Smartwatch", "Luxury Watch", "Comparison"], affiliates: ["amazon"], pexelsQuery: "smartwatch vs luxury watch comparison" },
  { title: "Best Dress Watches For Business Executives in 2025", category: "Watches", type: "buyer-intent", tags: ["Dress Watches", "Business", "Executive"], affiliates: ["amazon"], pexelsQuery: "dress watch business executive elegant" },

  // TRAVEL
  { title: "Best Business Class Experiences in 2025: Full Review", category: "Travel", type: "buyer-intent", tags: ["Business Class", "Travel", "Luxury"], affiliates: ["amazon", "travel"], pexelsQuery: "business class airplane luxury travel" },
  { title: "Dubai vs Singapore For Entrepreneurs: Where Should You Base Yourself", category: "Travel", type: "comparison", tags: ["Dubai", "Singapore", "Entrepreneurs"], affiliates: ["travel"], pexelsQuery: "dubai singapore skyline entrepreneurs" },
  { title: "Best Travel Accessories For Business Executives", category: "Travel", type: "buyer-intent", tags: ["Travel Accessories", "Business", "Executive"], affiliates: ["amazon"], pexelsQuery: "travel accessories business executive luxury" },
  { title: "How To Travel Like a Millionaire on a Middle Class Budget", category: "Travel", type: "luxury", tags: ["Travel", "Millionaire", "Budget"], affiliates: ["amazon", "travel"], pexelsQuery: "luxury hotel pool travel millionaire" },
  { title: "The World's Best Cities For Digital Nomad Entrepreneurs", category: "Travel", type: "wealth", tags: ["Digital Nomad", "Cities", "Entrepreneurs"], affiliates: ["vpn", "hostinger"], pexelsQuery: "digital nomad city laptop cafe" },
  { title: "Golden Visa Programs: How The Rich Buy Residency", category: "Travel", type: "wealth", tags: ["Golden Visa", "Residency", "UHNWI"], affiliates: ["travel"], pexelsQuery: "golden visa passport luxury residence" },
  { title: "Best Luxury Hotels in India For Business Travellers", category: "Travel", type: "buyer-intent", tags: ["Luxury Hotels", "India", "Business Travel"], affiliates: ["amazon", "travel"], pexelsQuery: "luxury hotel india business travel" },
  { title: "How To Get Airport Lounge Access For Free: The Complete Guide", category: "Travel", type: "buyer-intent", tags: ["Airport Lounge", "Travel Hack", "Business"], affiliates: ["travel"], pexelsQuery: "airport lounge luxury business travel" },

  // STUDY ABROAD
  { title: "Best Countries To Study Abroad For Indian Students in 2025", category: "Study Abroad", type: "buyer-intent", tags: ["Study Abroad", "India", "Education"], affiliates: ["education"], pexelsQuery: "international student study abroad university" },
  { title: "UK vs Australia vs Canada: Best Study Destination For Indians", category: "Study Abroad", type: "comparison", tags: ["Study Abroad", "UK", "Australia", "Canada"], affiliates: ["education"], pexelsQuery: "university campus international students" },
  { title: "How To Fund Your Study Abroad: Scholarships and Loans Guide", category: "Study Abroad", type: "buyer-intent", tags: ["Scholarships", "Study Abroad", "Funding"], affiliates: ["education"], pexelsQuery: "scholarship student education funding" },
  { title: "Best MBA Programs Abroad For Indian Professionals", category: "Study Abroad", type: "buyer-intent", tags: ["MBA", "Study Abroad", "India"], affiliates: ["education"], pexelsQuery: "mba business school international" },
  { title: "Study in Dubai: Why UAE is Becoming a Top Education Hub", category: "Study Abroad", type: "wealth", tags: ["Dubai", "Study Abroad", "UAE"], affiliates: ["education"], pexelsQuery: "dubai university education modern" },
  { title: "How Studying Abroad Increases Your Lifetime Earnings", category: "Study Abroad", type: "wealth", tags: ["Study Abroad", "ROI", "Career"], affiliates: ["education"], pexelsQuery: "career success international education earnings" },
  { title: "Best Online Platforms For Preparing For Study Abroad", category: "Study Abroad", type: "buyer-intent", tags: ["Study Abroad", "Online Platforms", "Preparation"], affiliates: ["education", "semrush"], pexelsQuery: "online learning platform laptop study" },
  { title: "Singapore vs Malaysia: Best Study Destination in Southeast Asia", category: "Study Abroad", type: "comparison", tags: ["Singapore", "Malaysia", "Study Abroad"], affiliates: ["education"], pexelsQuery: "singapore malaysia university campus" },

  // ENTREPRENEURSHIP
  { title: "How To Start a Business With Zero Investment in 2025", category: "Entrepreneurship", type: "wealth", tags: ["Startup", "Zero Investment", "Entrepreneurship"], affiliates: ["hostinger", "canva"], pexelsQuery: "startup entrepreneur zero investment launch" },
  { title: "Best Online Courses For Entrepreneurs: Top Picks For 2025", category: "Entrepreneurship", type: "buyer-intent", tags: ["Online Courses", "Entrepreneurs", "Education"], affiliates: ["amazon", "education"], pexelsQuery: "entrepreneur online course learning" },
  { title: "How To Build a Personal Brand That Generates Millions", category: "Entrepreneurship", type: "wealth", tags: ["Personal Brand", "Millions", "Entrepreneur"], affiliates: ["hostinger", "canva"], pexelsQuery: "personal brand entrepreneur success" },
  { title: "The Lean Startup Method: How To Test Ideas Before Investing", category: "Entrepreneurship", type: "wealth", tags: ["Lean Startup", "Testing", "Business"], affiliates: ["semrush"], pexelsQuery: "startup method test idea business" },
  { title: "How Indian Entrepreneurs Are Going Global in 2025", category: "Entrepreneurship", type: "wealth", tags: ["Indian Entrepreneurs", "Global", "Success"], affiliates: ["hostinger"], pexelsQuery: "indian entrepreneur global success business" },
  { title: "Bootstrap vs Funded: Which Path Builds More Wealth", category: "Entrepreneurship", type: "comparison", tags: ["Bootstrap", "Funding", "Startup"], affiliates: ["semrush"], pexelsQuery: "bootstrap startup funding comparison" },
  { title: "How To Find Your First 100 Customers Without Paid Ads", category: "Entrepreneurship", type: "wealth", tags: ["Customers", "Growth", "Marketing"], affiliates: ["semrush", "canva"], pexelsQuery: "customers growth marketing business" },
  { title: "The Solopreneur Playbook: Build a $1M Business Alone", category: "Entrepreneurship", type: "wealth", tags: ["Solopreneur", "Million Dollar", "Solo Business"], affiliates: ["hostinger", "semrush"], pexelsQuery: "solopreneur solo business laptop success" },

  // PERSONAL BRANDING
  { title: "How To Build a Personal Brand From Scratch in 2025", category: "Personal Branding", type: "wealth", tags: ["Personal Brand", "From Scratch", "2025"], affiliates: ["hostinger", "canva"], pexelsQuery: "personal branding professional photo" },
  { title: "LinkedIn Personal Branding: How To Get 10000 Followers Fast", category: "Personal Branding", type: "buyer-intent", tags: ["LinkedIn", "Personal Brand", "Growth"], affiliates: ["canva", "semrush"], pexelsQuery: "linkedin personal branding professional" },
  { title: "Why Your Personal Brand Is Worth More Than Your Business", category: "Personal Branding", type: "wealth", tags: ["Personal Brand", "Value", "Authority"], affiliates: ["hostinger"], pexelsQuery: "personal brand authority value" },
  { title: "Best Tools For Building Your Personal Brand Online", category: "Personal Branding", type: "buyer-intent", tags: ["Personal Brand", "Tools", "Online"], affiliates: ["canva", "hostinger", "semrush"], pexelsQuery: "personal brand tools online digital" },
  { title: "How To Become a Thought Leader in Your Industry", category: "Personal Branding", type: "wealth", tags: ["Thought Leader", "Industry", "Authority"], affiliates: ["semrush"], pexelsQuery: "thought leader speaking audience stage" },
  { title: "The Power of Public Speaking: How It Builds Wealth and Influence", category: "Personal Branding", type: "wealth", tags: ["Public Speaking", "Wealth", "Influence"], affiliates: ["amazon"], pexelsQuery: "public speaking stage audience influence" },
  { title: "How To Write a Book That Builds Your Authority and Income", category: "Personal Branding", type: "wealth", tags: ["Book", "Authority", "Income"], affiliates: ["amazon"], pexelsQuery: "author book writing authority" },
  { title: "Personal Brand vs Company Brand: Which Should You Invest In First", category: "Personal Branding", type: "comparison", tags: ["Personal Brand", "Company Brand", "Strategy"], affiliates: ["hostinger", "canva"], pexelsQuery: "personal vs company brand strategy" },

  // POWER, MONEY AND STRATEGY
  { title: "How The World's Most Powerful Men Think Differently", category: "Power Money Strategy", type: "wealth", tags: ["Power", "Mindset", "Strategy"], affiliates: ["amazon"], pexelsQuery: "powerful businessman thinking strategy" },
  { title: "The Art of Negotiation: How Billionaires Close Deals", category: "Power Money Strategy", type: "wealth", tags: ["Negotiation", "Billionaires", "Deals"], affiliates: ["amazon"], pexelsQuery: "negotiation business deal handshake" },
  { title: "How To Build Political Capital in Business", category: "Power Money Strategy", type: "wealth", tags: ["Political Capital", "Business", "Power"], affiliates: ["amazon"], pexelsQuery: "political capital business power strategy" },
  { title: "The 48 Laws of Power Applied to Modern Business", category: "Power Money Strategy", type: "wealth", tags: ["48 Laws", "Power", "Business"], affiliates: ["amazon"], pexelsQuery: "power laws strategy chess business" },
  { title: "How Strategic Alliances Create Billionaires", category: "Power Money Strategy", type: "wealth", tags: ["Strategic Alliances", "Billionaires", "Partnerships"], affiliates: ["amazon"], pexelsQuery: "strategic alliance partnership business" },
  { title: "Information Asymmetry: How The Rich Know What You Don't", category: "Power Money Strategy", type: "wealth", tags: ["Information", "Asymmetry", "Wealth"], affiliates: ["amazon", "semrush"], pexelsQuery: "information strategy intelligence business" },
  { title: "The Leverage Mindset: How To Get More With Less", category: "Power Money Strategy", type: "wealth", tags: ["Leverage", "Mindset", "Strategy"], affiliates: ["amazon"], pexelsQuery: "leverage mindset strategy success" },
  { title: "How To Build a Network That Opens Every Door", category: "Power Money Strategy", type: "wealth", tags: ["Network", "Power", "Success"], affiliates: ["amazon"], pexelsQuery: "networking power business connections" },

  // EMERGING BILLIONAIRES AND MILLIONAIRES
  { title: "Rising Billionaires Under 40: The New Generation of Wealth", category: "Emerging Billionaires", type: "profile", tags: ["Billionaires", "Under 40", "New Wealth"], affiliates: ["amazon"], pexelsQuery: "young billionaire success wealth modern" },
  { title: "Self-Made Millionaires From India: Their Untold Stories", category: "Emerging Billionaires", type: "profile", tags: ["India", "Millionaires", "Self-Made"], affiliates: ["amazon"], pexelsQuery: "indian entrepreneur success story millionaire" },
  { title: "How First Generation Entrepreneurs Build Generational Wealth", category: "Emerging Billionaires", type: "wealth", tags: ["First Generation", "Wealth", "Entrepreneur"], affiliates: ["amazon"], pexelsQuery: "first generation wealth entrepreneur legacy" },
  { title: "The Youngest Billionaires in the World 2025: How They Did It", category: "Emerging Billionaires", type: "profile", tags: ["Young Billionaires", "2025", "Success"], affiliates: ["amazon"], pexelsQuery: "young billionaire tech success 2025" },
  { title: "From Zero to IPO: Startup Stories That Inspire", category: "Emerging Billionaires", type: "profile", tags: ["IPO", "Startup", "Success"], affiliates: ["amazon"], pexelsQuery: "startup ipo success story entrepreneur" },
  { title: "Hyderabad's New Millionaires: The Tech and Business Boom", category: "Emerging Billionaires", type: "profile", tags: ["Hyderabad", "Millionaires", "Tech"], affiliates: ["amazon"], pexelsQuery: "hyderabad tech business wealth modern" },
  { title: "How Middle Eastern Entrepreneurs Are Reshaping Global Wealth", category: "Emerging Billionaires", type: "profile", tags: ["Middle East", "Entrepreneurs", "Wealth"], affiliates: ["amazon"], pexelsQuery: "middle east entrepreneur wealth dubai" },
  { title: "Women Billionaires Rising: The New Face of Wealth", category: "Emerging Billionaires", type: "profile", tags: ["Women", "Billionaires", "New Wealth"], affiliates: ["amazon"], pexelsQuery: "women entrepreneur success wealth power" },

  // FAMILY OFFICES
  { title: "What Is a Family Office: The Complete Guide For Aspiring HNIs", category: "Family Offices", type: "wealth", tags: ["Family Office", "HNI", "Wealth Management"], affiliates: ["amazon"], pexelsQuery: "family office wealth management private" },
  { title: "How Family Offices Invest: Asset Allocation Strategies", category: "Family Offices", type: "wealth", tags: ["Family Office", "Investment", "Asset Allocation"], affiliates: ["amazon"], pexelsQuery: "investment portfolio family office wealth" },
  { title: "Single Family Office vs Multi Family Office: Which Is Right For You", category: "Family Offices", type: "comparison", tags: ["Family Office", "Single", "Multi"], affiliates: ["amazon"], pexelsQuery: "family office private wealth management" },
  { title: "How The Ambani Family Office Manages Billions", category: "Family Offices", type: "profile", tags: ["Ambani", "Family Office", "India"], affiliates: ["amazon"], pexelsQuery: "wealth management family office india" },
  { title: "Family Office Trends 2025: What The Ultra Wealthy Are Doing", category: "Family Offices", type: "wealth", tags: ["Family Office", "Trends", "2025"], affiliates: ["amazon"], pexelsQuery: "wealth trends 2025 family office" },
  { title: "How To Set Up Your Own Mini Family Office", category: "Family Offices", type: "wealth", tags: ["Family Office", "Setup", "Wealth"], affiliates: ["amazon"], pexelsQuery: "private wealth office setup planning" },
  { title: "Family Office Technology: The Tools Billionaires Use To Manage Wealth", category: "Family Offices", type: "buyer-intent", tags: ["Family Office", "Technology", "Tools"], affiliates: ["semrush", "amazon"], pexelsQuery: "wealth technology tools management modern" },
  { title: "The Rise of Indian Family Offices: New Wealth, New Strategies", category: "Family Offices", type: "wealth", tags: ["India", "Family Office", "New Wealth"], affiliates: ["amazon"], pexelsQuery: "indian family wealth office management" },

  // ULTRA HIGH NET WORTH INDIVIDUALS
  { title: "How UHNWI Think About Money Differently Than Everyone Else", category: "UHNWI", type: "wealth", tags: ["UHNWI", "Money", "Mindset"], affiliates: ["amazon"], pexelsQuery: "ultra wealthy mindset money luxury" },
  { title: "The Lifestyle of Ultra High Net Worth Individuals", category: "UHNWI", type: "luxury", tags: ["UHNWI", "Lifestyle", "Luxury"], affiliates: ["amazon"], pexelsQuery: "ultra high net worth lifestyle luxury" },
  { title: "How UHNWI Protect Their Wealth: Asset Protection Strategies", category: "UHNWI", type: "wealth", tags: ["UHNWI", "Asset Protection", "Strategy"], affiliates: ["amazon"], pexelsQuery: "asset protection wealth security" },
  { title: "Private Banking for The Ultra Wealthy: What You Don't Know", category: "UHNWI", type: "wealth", tags: ["Private Banking", "UHNWI", "Wealth"], affiliates: ["amazon"], pexelsQuery: "private banking ultra wealthy exclusive" },
  { title: "How Billionaires Use Debt to Build Wealth: The Leverage Strategy", category: "UHNWI", type: "wealth", tags: ["Billionaires", "Debt", "Leverage"], affiliates: ["amazon"], pexelsQuery: "debt leverage billionaire wealth strategy" },
  { title: "The Hidden Assets of The Ultra Wealthy: What They Really Own", category: "UHNWI", type: "wealth", tags: ["UHNWI", "Assets", "Hidden Wealth"], affiliates: ["amazon"], pexelsQuery: "hidden assets ultra wealthy private" },
  { title: "UHNWI and Philanthropy: How The Rich Give Back Strategically", category: "UHNWI", type: "profile", tags: ["Philanthropy", "UHNWI", "Giving"], affiliates: ["amazon"], pexelsQuery: "philanthropy wealthy giving charity strategy" },
  { title: "How To Enter The World of Ultra High Net Worth: A Roadmap", category: "UHNWI", type: "wealth", tags: ["UHNWI", "Roadmap", "Wealth Building"], affiliates: ["amazon"], pexelsQuery: "wealth roadmap success ultra high net worth" },

  // NEW WEALTH TRENDS
  { title: "New Wealth Trends 2025: Where The Next Millionaires Are Coming From", category: "New Wealth Trends", type: "wealth", tags: ["New Wealth", "Trends", "2025"], affiliates: ["amazon"], pexelsQuery: "new wealth trends 2025 modern" },
  { title: "How The Creator Economy Is Producing Millionaires", category: "New Wealth Trends", type: "wealth", tags: ["Creator Economy", "Millionaires", "New Wealth"], affiliates: ["canva", "hostinger"], pexelsQuery: "creator economy youtube content millionaire" },
  { title: "Crypto and New Wealth: Who Made Billions and How", category: "New Wealth Trends", type: "wealth", tags: ["Crypto", "Billions", "New Wealth"], affiliates: ["amazon"], pexelsQuery: "cryptocurrency bitcoin wealth new money" },
  { title: "The Rise of India's New Wealthy: Gen Y and Gen Z Millionaires", category: "New Wealth Trends", type: "wealth", tags: ["India", "Gen Y", "Millionaires"], affiliates: ["amazon"], pexelsQuery: "india young wealthy millionaire generation" },
  { title: "How Remote Work Created a New Class of Wealthy Professionals", category: "New Wealth Trends", type: "wealth", tags: ["Remote Work", "New Wealth", "Professionals"], affiliates: ["vpn", "hostinger"], pexelsQuery: "remote work wealthy professional laptop" },
  { title: "The Quiet Luxury Trend: Why The New Rich Dress Down", category: "New Wealth Trends", type: "luxury", tags: ["Quiet Luxury", "New Rich", "Trend"], affiliates: ["amazon"], pexelsQuery: "quiet luxury minimal fashion wealthy" },
  { title: "How Solar and Clean Energy Is Creating New Billionaires", category: "New Wealth Trends", type: "wealth", tags: ["Solar", "Clean Energy", "Billionaires"], affiliates: ["amazon"], pexelsQuery: "solar energy billionaire clean wealth" },
  { title: "The Wellness Billionaires: Health Is The New Luxury", category: "New Wealth Trends", type: "luxury", tags: ["Wellness", "Billionaires", "Health Luxury"], affiliates: ["amazon"], pexelsQuery: "wellness luxury health billionaire trend" },

  // LUXURY ASSETS
  { title: "Luxury Assets That Appreciate: Watches, Art, Wine and Beyond", category: "Luxury Assets", type: "luxury", tags: ["Luxury Assets", "Investment", "Appreciation"], affiliates: ["amazon"], pexelsQuery: "luxury assets watches art wine investment" },
  { title: "How To Invest in Luxury Real Estate With Limited Capital", category: "Luxury Assets", type: "wealth", tags: ["Luxury Real Estate", "Investment", "Capital"], affiliates: ["amazon"], pexelsQuery: "luxury real estate investment property" },
  { title: "Rare Whisky as an Investment: The Complete Guide", category: "Luxury Assets", type: "buyer-intent", tags: ["Whisky", "Investment", "Luxury"], affiliates: ["amazon"], pexelsQuery: "rare whisky investment luxury bottle" },
  { title: "Art as an Asset Class: How The Wealthy Invest in Paintings", category: "Luxury Assets", type: "wealth", tags: ["Art", "Investment", "Wealthy"], affiliates: ["amazon"], pexelsQuery: "art investment painting luxury asset" },
  { title: "Classic Cars as Investments: The Complete Guide", category: "Luxury Assets", type: "buyer-intent", tags: ["Classic Cars", "Investment", "Luxury"], affiliates: ["amazon"], pexelsQuery: "classic car investment luxury vintage" },
  { title: "Private Jets: When Does It Make Financial Sense to Own One", category: "Luxury Assets", type: "luxury", tags: ["Private Jet", "Luxury", "Finance"], affiliates: ["amazon"], pexelsQuery: "private jet luxury wealth finance" },
  { title: "Superyachts and The Super Wealthy: The Economics Explained", category: "Luxury Assets", type: "luxury", tags: ["Superyacht", "Wealth", "Economics"], affiliates: ["amazon"], pexelsQuery: "superyacht luxury wealth ocean" },
  { title: "How To Build a Luxury Asset Portfolio From Rs 10 Lakhs", category: "Luxury Assets", type: "wealth", tags: ["Luxury Assets", "Portfolio", "India"], affiliates: ["amazon"], pexelsQuery: "luxury asset portfolio investment planning" },

  // GEOPOLITICS AND WEALTH
  { title: "How Geopolitics Shapes Where Billionaires Move Their Money", category: "Geopolitics and Wealth", type: "wealth", tags: ["Geopolitics", "Billionaires", "Wealth"], affiliates: ["amazon"], pexelsQuery: "geopolitics wealth map world strategy" },
  { title: "India's Rise: Why Smart Money Is Betting on India", category: "Geopolitics and Wealth", type: "wealth", tags: ["India", "Smart Money", "Rise"], affiliates: ["amazon"], pexelsQuery: "india rise economy wealth opportunity" },
  { title: "The Middle East Power Shift: What It Means For Global Wealth", category: "Geopolitics and Wealth", type: "wealth", tags: ["Middle East", "Power Shift", "Wealth"], affiliates: ["amazon"], pexelsQuery: "middle east power wealth global" },
  { title: "How US-China Tensions Are Reshaping Global Business", category: "Geopolitics and Wealth", type: "wealth", tags: ["US China", "Tensions", "Business"], affiliates: ["amazon"], pexelsQuery: "us china geopolitics business global" },
  { title: "Africa's Wealth Boom: The Continent The Smart Money Is Watching", category: "Geopolitics and Wealth", type: "wealth", tags: ["Africa", "Wealth Boom", "Emerging Markets"], affiliates: ["amazon"], pexelsQuery: "africa wealth growth emerging market" },
  { title: "How Sanctions and Trade Wars Create Opportunities For Entrepreneurs", category: "Geopolitics and Wealth", type: "wealth", tags: ["Sanctions", "Trade Wars", "Opportunities"], affiliates: ["amazon"], pexelsQuery: "trade war sanctions opportunity entrepreneur" },
  { title: "The New Silk Road: How China's Belt and Road Creates Wealth", category: "Geopolitics and Wealth", type: "wealth", tags: ["Belt and Road", "China", "Wealth"], affiliates: ["amazon"], pexelsQuery: "belt road china infrastructure wealth" },
  { title: "Geopolitical Risk and Your Business: How To Protect and Profit", category: "Geopolitics and Wealth", type: "wealth", tags: ["Geopolitical Risk", "Business", "Protection"], affiliates: ["amazon", "vpn"], pexelsQuery: "geopolitical risk business protection strategy" },
];

// ============================================================
// AFFILIATE LINK BUILDER
// ============================================================
const AFFILIATE_LINKS = {
  amazon: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`,
  hostinger: "https://www.hostinger.com/in?REFERRALCODE=QF0MAILMAXCP",
  canva: "https://www.canva.com/join/imranahmedkhan", // replace with real ref link
  semrush: "https://www.semrush.com/analytics/overview/", // replace with real ref link
  vpn: "https://www.amazon.in/s?k=best+vpn+subscription&tag=" + AMAZON_TAG,
  education: "https://imakinc.com",
  travel: "https://www.amazon.in/s?k=travel+accessories+executive&tag=" + AMAZON_TAG,
};
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getExistingSlugs(articlesDir) {
  if (!fs.existsSync(articlesDir)) return [];
  return fs.readdirSync(articlesDir)
    .filter(f => f.endsWith(".html"))
    .map(f => ({
      slug: f.replace(".html", ""),
      mtime: fs.statSync(path.join(articlesDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(f => f.slug);
}

function getNextTopic(existingSlugs) {
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    if (!existingSlugs.includes(slugify(topic.title))) return topic;
  }
  // All done — cycle from oldest
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TOPICS[dayOfYear % TOPICS.length];
}

function getArticleMetadata(articlesDir, slugs) {
  return slugs.map(slug => {
    const filePath = path.join(articlesDir, `${slug}.html`);
    const content = fs.readFileSync(filePath, "utf8");
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const rawTitle = titleMatch ? titleMatch[1] : slug;
    const title = rawTitle.replace(/\s*[\|\-–]\s*Imran Ahmed Khan.*$/, "").trim();
    const catMatch = content.match(/<meta name="article-category" content="([^"]+)">/);
    const category = catMatch ? catMatch[1] : "Wealth";
    const thumbMatch = content.match(/<meta name="pexels-thumb" content="([^"]+)">/);
    const thumb = thumbMatch ? thumbMatch[1] : null;
    const typeMatch = content.match(/<meta name="article-type" content="([^"]+)">/);
    const type = typeMatch ? typeMatch[1] : "wealth";
    return { slug, title, category, thumb, type };
  });
}

// ============================================================
// PEXELS IMAGE FETCH
// ============================================================
async function fetchPexelsImage(query) {
  try {
    if (!PEXELS_API_KEY) return null;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.photos || data.photos.length === 0) return null;
    const photo = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 5))];
    return {
      url: photo.src.large2x || photo.src.large,
      thumb: photo.src.medium,
      photographer: photo.photographer,
      pexelsUrl: photo.url
    };
  } catch (e) {
    console.log("Pexels failed:", e.message);
    return null;
  }
}

// ============================================================
// ARTICLE GENERATION
// ============================================================
async function generateArticle(topic) {
  console.log(`\n📝 Generating: ${topic.title}`);

  const affiliateInstructions = topic.affiliates.map(a => {
    if (a === "amazon") return "- Amazon product recommendations with clear value proposition";
    if (a === "hostinger") return "- Hostinger website hosting recommendation for entrepreneurs";
    if (a === "canva") return "- Canva design tool recommendation for branding";
    if (a === "semrush") return "- SEMrush SEO tool recommendation";
    if (a === "vpn") return "- VPN service recommendation for business security";
    if (a === "education") return "- Study abroad/education platform recommendation";
    if (a === "travel") return "- Travel service or accessory recommendation";
    return "";
  }).join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are a world-class authority content writer for a premium platform targeting entrepreneurs, HNIs, and wealth-focused professionals.

Write a comprehensive, authoritative article on: "${topic.title}"

Category: ${topic.category}
Article Type: ${topic.type}
Target Audience: Entrepreneurs, HNIs, UHNWIs, business professionals, wealth-focused Indians with global outlook

STRUCTURE REQUIRED:
## Introduction (hook — open with a striking insight, stat, or power statement)
## [3-5 substantive H2 sections with real depth]
## Key Takeaways
## FAQ (5 questions and answers)

REQUIREMENTS:
- 1800-2500 words
- Authoritative, sophisticated, intelligent tone — not generic blog content
- Reference real trends, data points, and global context
- Every section must deliver genuine insight, not filler
- Include natural opportunities for these affiliate recommendations:
${affiliateInstructions}
- MANDATORY: You MUST include at least 3 affiliate insertion points. Each one goes on its own line, in exactly this format: [AFFILIATE: product/service description]
- Place them naturally after relevant sections. An article without at least 3 [AFFILIATE: ...] markers is invalid and will be rejected.
- Include 2-3 internal link suggestions marked as: [INTERNAL LINK: suggested article title]
- Include 1 lead magnet suggestion marked as: [LEAD MAGNET: description]
- End with a powerful call to action

TONE: The voice of Imran Ahmed Khan — analytical, global, sophisticated. Think: power, money, strategy. Not motivational-speaker fluff. Real intelligence for real decision-makers.

Format: Plain text with ## for H2 headings and ### for H3. No HTML.

Return ONLY the article. No preamble.`
    }]
  });

  return message.content[0].text;
}

// ============================================================
// HTML BUILDER
// ============================================================
function buildArticleHTML(topic, articleText, pexelsImage = null) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const slug = slugify(topic.title);

  // Process article text into HTML
  let bodyHTML = "";
  const lines = articleText.split("\n");
  let inFAQ = false;
  let affIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      const heading = trimmed.replace("## ", "");
      if (heading.toLowerCase().includes("faq")) inFAQ = true;
      bodyHTML += `<h2>${heading}</h2>\n`;
    } else if (trimmed.startsWith("### ")) {
      bodyHTML += `<h3>${trimmed.replace("### ", "")}</h3>\n`;
    } else if (trimmed.startsWith("[AFFILIATE:")) {
      // Replace affiliate markers with styled CTA boxes
      const affList = (topic.affiliates && topic.affiliates.length) ? topic.affiliates : ["amazon"];
        const affType = affList[affIndex % affList.length];
        affIndex++;
      const affType = topic.affiliates[0] || "amazon";
      const affLink = typeof AFFILIATE_LINKS[affType] === "function"
        ? AFFILIATE_LINKS[affType](topic.title)
        : AFFILIATE_LINKS[affType] || "#";
      bodyHTML += `<div class="affiliate-box">
        <div class="aff-label">RECOMMENDED</div>
        <p>${desc}</p>
        <a href="${affLink}" class="aff-btn" target="_blank" rel="nofollow noopener">Explore Now →</a>
      </div>\n`;
    } else if (trimmed.startsWith("[INTERNAL LINK:")) {
      const linkTitle = trimmed.replace("[INTERNAL LINK:", "").replace("]", "").trim();
      const linkSlug = slugify(linkTitle);
      bodyHTML += `<div class="internal-link-box">📖 Also read: <a href="/articles/${linkSlug}.html">${linkTitle}</a></div>\n`;
    } else if (trimmed.startsWith("[LEAD MAGNET:")) {
      const desc = trimmed.replace("[LEAD MAGNET:", "").replace("]", "").trim();
      bodyHTML += `<div class="lead-magnet-box">
        <h4>🎯 Free Resource</h4>
        <p>${desc}</p>
        <a href="/#newsletter" class="lead-magnet-btn">Get Free Access →</a>
      </div>\n`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      bodyHTML += `<li>${trimmed.substring(2)}</li>\n`;
    } else if (/^\d+\./.test(trimmed)) {
      bodyHTML += `<li>${trimmed.replace(/^\d+\.\s*/, "")}</li>\n`;
    } else {
      bodyHTML += `<p>${trimmed}</p>\n`;
    }
  }
  // Fallback: if the model emitted no affiliate markers, inject one
  if (!articleText.includes("[AFFILIATE:")) {
    const affType = topic.affiliates[0] || "amazon";
    const affLink = typeof AFFILIATE_LINKS[affType] === "function"
      ? AFFILIATE_LINKS[affType](topic.title)
      : AFFILIATE_LINKS[affType] || "#";
    bodyHTML += `<div class="affiliate-box">
      <div class="aff-label">RECOMMENDED</div>
      <p>Explore top-rated picks related to ${topic.title}.</p>
      <a href="${affLink}" class="aff-btn" target="_blank" rel="nofollow noopener">Explore Now →</a>
    </div>\n`;
  }

  const heroImageHTML = pexelsImage
    ? `<div class="hero-photo" style="background-image:url('${pexelsImage.url}')">
        <div class="hero-photo-overlay"></div>
        <div class="hero-content">
          <div class="article-category-tag">${topic.category}</div>
          <h1>${topic.title}</h1>
          <div class="article-meta">By Imran Ahmed Khan &nbsp;·&nbsp; ${today} &nbsp;·&nbsp; ${topic.type}</div>
          <div class="article-tags">${topic.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
        </div>
       </div>
       <div class="photo-credit">Photo: <a href="${pexelsImage.pexelsUrl}" target="_blank" rel="nofollow">${pexelsImage.photographer}</a> via Pexels</div>`
    : `<div class="hero-no-photo">
        <div class="hero-content">
          <div class="article-category-tag">${topic.category}</div>
          <h1>${topic.title}</h1>
          <div class="article-meta">By Imran Ahmed Khan &nbsp;·&nbsp; ${today}</div>
          <div class="article-tags">${topic.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
        </div>
       </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${topic.title} | Imran Ahmed Khan</title>
<meta name="description" content="${topic.title} — authoritative insights on ${topic.category} from Imran Ahmed Khan.">
<meta name="article-category" content="${topic.category}">
<meta name="article-type" content="${topic.type}">
${pexelsImage ? `<meta property="og:image" content="${pexelsImage.url}">
<meta name="pexels-thumb" content="${pexelsImage.thumb}">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --gold:#C9A84C;
  --gold-light:#E8C97A;
  --dark:#0A0A0F;
  --dark2:#12121A;
  --dark3:#1A1A26;
  --white:#FFFFFF;
  --grey:#8A8A9A;
  --light:#F4F4F8;
  --accent:#C9A84C;
}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--white);overflow-x:hidden;}
/* HEADER */
header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,15,0.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(201,168,76,0.2);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:'Playfair Display',serif;font-size:20px;color:var(--white);text-decoration:none;}
.logo span{color:var(--gold);}
.nav-links{display:flex;gap:24px;align-items:center;}
.nav-links a{color:var(--grey);font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.5px;}
.nav-links a:hover{color:var(--gold);}
.nav-cta{background:var(--gold);color:var(--dark)!important;padding:6px 16px;border-radius:4px;font-weight:600!important;}
/* HERO */
.hero-photo{position:relative;height:520px;background-size:cover;background-position:center;margin-top:60px;}
.hero-photo-overlay{position:absolute;inset:0;background:linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.85) 100%);}
.hero-no-photo{background:linear-gradient(135deg,var(--dark2),var(--dark3));margin-top:60px;padding:80px 24px;}
.hero-content{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:60px 24px 40px;}
.article-category-tag{display:inline-block;background:var(--gold);color:var(--dark);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:2px;margin-bottom:16px;}
.hero-content h1{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,48px);font-weight:700;line-height:1.15;color:var(--white);margin-bottom:16px;}
.article-meta{font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;}
.article-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.tag{background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);color:var(--gold-light);font-size:11px;padding:3px 10px;border-radius:2px;}
.photo-credit{text-align:right;font-size:10px;color:var(--grey);padding:4px 16px;background:var(--dark2);}
.photo-credit a{color:var(--grey);text-decoration:none;}
/* ARTICLE BODY */
.article-wrapper{max-width:800px;margin:0 auto;padding:48px 24px 80px;}
.article-wrapper p{font-size:17px;line-height:1.85;color:#D0D0DC;margin-bottom:24px;font-weight:300;}
.article-wrapper h2{font-family:'Playfair Display',serif;font-size:28px;color:var(--white);margin:48px 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(201,168,76,0.2);}
.article-wrapper h3{font-size:20px;font-weight:600;color:var(--gold-light);margin:32px 0 14px;}
.article-wrapper li{font-size:16px;line-height:1.75;color:#D0D0DC;margin-bottom:10px;padding-left:20px;position:relative;}
.article-wrapper li::before{content:"›";position:absolute;left:0;color:var(--gold);}
.article-wrapper ul,.article-wrapper ol{margin:0 0 24px 0;padding:0;}
/* AFFILIATE BOX */
.affiliate-box{background:linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03));border:1px solid rgba(201,168,76,0.25);border-radius:8px;padding:24px;margin:32px 0;}
.aff-label{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:8px;}
.affiliate-box p{font-size:15px;color:#C0C0CC;margin-bottom:16px!important;}
.aff-btn{display:inline-block;background:var(--gold);color:var(--dark);font-weight:700;font-size:13px;padding:10px 24px;border-radius:4px;text-decoration:none;letter-spacing:0.5px;}
/* INTERNAL LINK BOX */
.internal-link-box{background:var(--dark3);border-left:3px solid var(--gold);padding:14px 20px;margin:24px 0;font-size:14px;color:var(--grey);}
.internal-link-box a{color:var(--gold-light);text-decoration:none;}
/* LEAD MAGNET */
.lead-magnet-box{background:linear-gradient(135deg,var(--dark2),var(--dark3));border:1px solid rgba(201,168,76,0.3);border-radius:8px;padding:28px;margin:40px 0;text-align:center;}
.lead-magnet-box h4{font-family:'Playfair Display',serif;font-size:20px;color:var(--white);margin-bottom:10px;}
.lead-magnet-box p{font-size:15px;color:var(--grey);margin-bottom:20px!important;}
.lead-magnet-btn{display:inline-block;background:transparent;border:2px solid var(--gold);color:var(--gold);font-weight:700;font-size:13px;padding:10px 28px;border-radius:4px;text-decoration:none;}
/* NEWSLETTER */
.newsletter-section{background:linear-gradient(135deg,var(--dark2),var(--dark3));border-top:1px solid rgba(201,168,76,0.15);padding:60px 24px;text-align:center;}
.newsletter-section h3{font-family:'Playfair Display',serif;font-size:28px;color:var(--white);margin-bottom:10px;}
.newsletter-section p{font-size:15px;color:var(--grey);max-width:480px;margin:0 auto 24px;}
.newsletter-form{display:flex;gap:12px;max-width:420px;margin:0 auto;flex-wrap:wrap;justify-content:center;}
.newsletter-form input{flex:1;min-width:240px;background:var(--dark3);border:1px solid rgba(201,168,76,0.3);color:var(--white);padding:12px 16px;border-radius:4px;font-size:14px;}
.newsletter-form button{background:var(--gold);color:var(--dark);font-weight:700;padding:12px 24px;border:none;border-radius:4px;font-size:14px;cursor:pointer;}
/* FOOTER */
footer{background:var(--dark);border-top:1px solid rgba(255,255,255,0.05);padding:40px 24px;text-align:center;}
footer p{font-size:13px;color:var(--grey);line-height:2;}
footer a{color:var(--gold-light);text-decoration:none;}
.footer-logo{font-family:'Playfair Display',serif;font-size:22px;color:var(--white);margin-bottom:12px;}
.footer-logo span{color:var(--gold);}
@media(max-width:600px){
  .nav-links{display:none;}
  .hero-content h1{font-size:26px;}
  .article-wrapper{padding:32px 16px 60px;}
}
</style>
</head>
<body>
<header>
  <a href="https://imranahmedkhan.com" class="logo">Imran <span>Ahmed</span> Khan</a>
  <nav class="nav-links">
    <a href="/articles.html">Insights</a>
    <a href="/#categories">Topics</a>
    <a href="/#about">About</a>
    <a href="/#newsletter" class="nav-cta">Subscribe</a>
  </nav>
</header>

${heroImageHTML}

<div class="article-wrapper">
  <div class="article-disclosure" style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:10px 16px;font-size:12px;color:var(--grey);margin-bottom:40px;">
    This article may contain affiliate links. As an Amazon Associate and partner of select services, I earn from qualifying purchases at no extra cost to you.
  </div>
  ${bodyHTML}
</div>

<div id="newsletter" class="newsletter-section">
  <h3>The Power Brief</h3>
  <p>Weekly intelligence on wealth, power, strategy and opportunity — for serious decision-makers.</p>
  <div class="newsletter-form">
    <input type="email" placeholder="Your email address">
    <button>Subscribe Free</button>
  </div>
</div>

<footer>
  <div class="footer-logo">Imran <span>Ahmed</span> Khan</div>
  <p>Power. Money. Strategy.</p>
<p style="margin-top:12px;"><a href="/">Home</a> &nbsp;·&nbsp; <a href="/articles.html">Insights</a> &nbsp;·&nbsp; <a href="https://imakinc.com">IMAK Overseas</a></p>  <p style="margin-top:16px;font-size:12px;">This site contains affiliate links. © ${new Date().getFullYear()} Imran Ahmed Khan. All rights reserved.</p>
</footer>
</body>
</html>`;
}

// ============================================================
// ARTICLES INDEX PAGE
// ============================================================
function buildArticlesIndexHTML(articles) {
  const categories = [...new Set(articles.map(a => a.category))];

  const cards = articles.map(a => {
    const imgHTML = a.thumb
      ? `<img src="${a.thumb}" alt="${a.title}" class="card-img" loading="lazy">`
      : `<div class="card-img card-img-placeholder"></div>`;
    return `<a href="/articles/${a.slug}.html" class="article-card">
      ${imgHTML}
      <div class="card-body">
        <div class="card-cat">${a.category}</div>
        <h3 class="card-title">${a.title}</h3>
        <span class="card-link">Read More →</span>
      </div>
    </a>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Insights & Intelligence | Imran Ahmed Khan</title>
<meta name="description" content="Expert insights on wealth, power, AI, luxury lifestyle and global strategy from Imran Ahmed Khan.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{--gold:#C9A84C;--gold-light:#E8C97A;--dark:#0A0A0F;--dark2:#12121A;--dark3:#1A1A26;--white:#FFFFFF;--grey:#8A8A9A;}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--white);}
header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,15,0.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(201,168,76,0.2);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:'Playfair Display',serif;font-size:20px;color:var(--white);text-decoration:none;}
.logo span{color:var(--gold);}
.nav-links{display:flex;gap:24px;}
.nav-links a{color:var(--grey);font-size:13px;font-weight:500;text-decoration:none;}
.nav-links a:hover{color:var(--gold);}
.nav-cta{background:var(--gold);color:var(--dark)!important;padding:6px 16px;border-radius:4px;font-weight:600!important;}
.page-hero{background:linear-gradient(135deg,var(--dark),var(--dark3));padding:100px 24px 60px;text-align:center;}
.page-hero h1{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,52px);color:var(--white);margin-bottom:12px;}
.page-hero p{font-size:16px;color:var(--grey);max-width:520px;margin:0 auto;}
.gold-line{width:60px;height:2px;background:var(--gold);margin:20px auto;}
.filter-bar{display:flex;flex-wrap:wrap;gap:8px;max-width:1200px;margin:0 auto;padding:24px 24px 0;}
.filter-btn{background:transparent;border:1px solid rgba(201,168,76,0.3);color:var(--grey);font-size:12px;padding:6px 14px;border-radius:2px;cursor:pointer;font-family:'Inter',sans-serif;}
.filter-btn:hover,.filter-btn.active{background:var(--gold);border-color:var(--gold);color:var(--dark);}
.articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;max-width:1200px;margin:0 auto;padding:32px 24px 80px;}
.article-card{background:var(--dark2);border:1px solid rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:border-color .2s,transform .2s;}
.article-card:hover{border-color:rgba(201,168,76,0.3);transform:translateY(-4px);}
.card-img{width:100%;height:180px;object-fit:cover;display:block;}
.card-img-placeholder{height:180px;background:linear-gradient(135deg,var(--dark2),var(--dark3));}
.card-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.card-cat{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.card-title{font-family:'Playfair Display',serif;font-size:17px;color:var(--white);line-height:1.4;margin-bottom:12px;flex:1;}
.card-link{font-size:12px;font-weight:600;color:var(--grey);letter-spacing:0.5px;}
.article-card:hover .card-link{color:var(--gold);}
footer{background:var(--dark);border-top:1px solid rgba(255,255,255,0.05);padding:40px 24px;text-align:center;}
footer p{font-size:13px;color:var(--grey);line-height:2;}
footer a{color:var(--gold-light);text-decoration:none;}
.footer-logo{font-family:'Playfair Display',serif;font-size:22px;color:var(--white);margin-bottom:12px;}
.footer-logo span{color:var(--gold);}
@media(max-width:600px){.nav-links{display:none;}.articles-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<header>
  <a href="https://imranahmedkhan.com" class="logo">Imran <span>Ahmed</span> Khan</a>
  <nav class="nav-links">
    <a href="/articles.html">Insights</a>
    <a href="/#categories">Topics</a>
    <a href="/#about">About</a>
    <a href="/#newsletter" class="nav-cta">Subscribe</a>
  </nav>
</header>
<div class="page-hero">
  <h1>Insights & Intelligence</h1>
  <div class="gold-line"></div>
  <p>Authoritative analysis on wealth, power, AI, luxury and global strategy — ${articles.length} articles and growing.</p>
</div>
<div class="filter-bar">
  <button class="filter-btn active" onclick="filterCards('all')">All</button>
  ${categories.map(c => `<button class="filter-btn" onclick="filterCards('${c}')">${c}</button>`).join("\n  ")}
</div>
<div class="articles-grid" id="articlesGrid">
  ${cards}
</div>
<footer>
  <div class="footer-logo">Imran <span>Ahmed</span> Khan</div>
  <p>Power. Wealth. Strategy.</p>
  <p style="margin-top:12px;"><a href="/">Home</a> &nbsp;·&nbsp; <a href="/articles.html">Insights</a> &nbsp;·&nbsp; <a href="https://imakinc.com">IMAK Overseas</a></p>
  <p style="margin-top:16px;font-size:12px;">© ${new Date().getFullYear()} Imran Ahmed Khan</p>
</footer>
<script>
function filterCards(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.article-card').forEach(card => {
    const cardCat = card.querySelector('.card-cat').textContent;
    card.style.display = (cat === 'all' || cardCat === cat) ? '' : 'none';
  });
}
</script>
</body>
</html>`;
}

// ============================================================
// GIT PUSH
// ============================================================
function gitPush(slug) {
  console.log("\n📤 Pushing to GitHub...");
  try {
    execSync(`git config user.email "filmtabela@gmail.com"`, { stdio: "inherit" });
    execSync(`git config user.name "IAK Publisher Bot"`, { stdio: "inherit" });
    execSync(`git add .`, { stdio: "inherit" });
    execSync(`git commit -m "Auto-publish: ${slug}"`, { stdio: "inherit" });
    execSync(`git push origin main`, { stdio: "inherit" });
    console.log("✅ Pushed to GitHub — deploying to Hostinger...");
  } catch (err) {
    console.error("❌ Git push failed:", err.message);
    throw err;
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("⚡ IAK Publisher Starting...\n");

  const articlesDir = path.join(SITE_DIR, "articles");
  if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir, { recursive: true });

  const existingSlugs = getExistingSlugs(articlesDir);
  const topic = getNextTopic(existingSlugs);
  console.log(`📌 Topic: ${topic.title}`);
  console.log(`📂 Category: ${topic.category}`);

  try {
    const articleText = await generateArticle(topic);
    const slug = slugify(topic.title);

    console.log("🖼️  Fetching Pexels image...");
    const pexelsImage = await fetchPexelsImage(topic.pexelsQuery);
    if (pexelsImage) {
      console.log(`✅ Photo by ${pexelsImage.photographer}`);
    } else {
      console.log("⚠️  No photo — using text hero");
    }

    const html = buildArticleHTML(topic, articleText, pexelsImage);
    const filePath = path.join(articlesDir, `${slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ Article saved: ${filePath}`);

    // Rebuild index
    const allSlugs = getExistingSlugs(articlesDir);
    const allArticles = getArticleMetadata(articlesDir, allSlugs);
    const indexHTML = buildArticlesIndexHTML(allArticles);
    fs.writeFileSync(path.join(SITE_DIR, "articles.html"), indexHTML);
    console.log(`✅ Index rebuilt: ${allArticles.length} articles`);

    gitPush(slug);

    console.log(`\n✅ DONE`);
    console.log(`📌 ${topic.title}`);
    console.log(`🔗 ${SITE_URL}/articles/${slug}.html`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
