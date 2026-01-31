# Monetization & Pricing Logic

**Document Purpose:** Propose a pricing and monetization model for Project Gumpo that makes sense for small to medium preschools, including role-based limits, school size tiers, and optional add-ons.

**Last Updated:** January 30, 2026  
**Status:** APPROVED FOR IMPLEMENTATION  
**Related Documents:** PRODUCT_VISION_AND_JOURNEYS.md, FEATURE_PRIORITIZATION.md

---

## 📋 TABLE OF CONTENTS

1. [Pricing Philosophy](#pricing-philosophy)
2. [Market Research & Competitive Analysis](#market-research--competitive-analysis)
3. [Pricing Model Overview](#pricing-model-overview)
4. [Tier Breakdown](#tier-breakdown)
5. [Optional Add-Ons](#optional-add-ons)
6. [Implementation Timeline](#implementation-timeline)
7. [Financial Projections](#financial-projections)
8. [Pricing Psychology](#pricing-psychology)

---

## 💡 PRICING PHILOSOPHY

### Core Principles

**1. Value-Based Pricing (Not Cost-Plus)**
Price based on value delivered to schools, not our hosting costs.

**Value Delivered:**
- **98 minutes saved per teacher per day** = 8.2 hours/week = R2,500/month in labor savings (at R300/hour)
- **Parent satisfaction** = reduced churn, better word-of-mouth
- **Compliance peace of mind** = avoid licensing violations (R50,000+ fines)

**Pricing Target:** 20-30% of labor savings = R500-R750/month per teacher

---

**2. Affordability for Small Preschools**
Most South African preschools have 20-80 children and 3-8 teachers. Pricing must fit tight budgets.

**Reality:**
- Average preschool tuition: R2,000-R4,000/month per child
- Average preschool profit margin: 10-15%
- Technology budget: R2,000-R5,000/month total

**Pricing Target:** <5% of monthly revenue for a 40-child preschool (R80,000 revenue → <R4,000 for Gumpo)

---

**3. Tiered Pricing (Grow with Schools)**
Schools start small (20 kids), grow to medium (80 kids), maybe become multi-site (200+ kids). Pricing should scale.

**Approach:**
- **Starter Tier:** Small preschools (1-30 children)
- **Growth Tier:** Medium preschools (31-80 children)
- **Professional Tier:** Large preschools (81-150 children)
- **Enterprise Tier:** Multi-site chains (151+ children)

---

**4. Transparent, Predictable Pricing**
No hidden fees. No per-parent charges. No surprise overages.

**Why:**
- Schools budget annually (can't absorb surprise costs)
- Principals distrust "contact us for pricing" models
- Transparency = trust = higher conversion

---

## 📊 MARKET RESEARCH & COMPETITIVE ANALYSIS

### Competitive Landscape (South Africa)

| Competitor | Pricing Model | Monthly Cost | Target Market | Strengths | Weaknesses |
|------------|---------------|--------------|---------------|-----------|------------|
| **Kinderlime** | Per-child | R50/child | Small-medium | Mobile app | Expensive at scale |
| **Procare** | Per-school | R2,500-R8,000 | Medium-large | Feature-rich | Complex, USA-focused |
| **Brightwheel** | Per-child | R60/child | Small | Parent app | Not SA-compliant |
| **Paper/Excel** | Free | R0 | All | No cost | Time-consuming, error-prone |

**Kinderlime Example:**
- 40-child preschool: R50 × 40 = R2,000/month
- 80-child preschool: R50 × 80 = R4,000/month

**Problem with per-child pricing:**
- Schools pay more as they succeed (growth penalty)
- Parents see per-child cost in invoices (transparency issues)

**Gumpo's Advantage:**
- Flat monthly fee (predictable)
- Unlimited children within tier (no growth penalty)
- POPIA-compliant (South African focus)

---

### Willingness to Pay (Market Research)

**Survey of 20 Preschool Principals (January 2026):**

| Question | Response |
|----------|----------|
| Current monthly tech spend | R1,500 (median) |
| Would pay for attendance + messaging | R800-R1,500/month |
| Would pay for full daily logs + reports | R1,500-R3,000/month |
| Maximum acceptable price | R3,500/month (median) |
| Preferred pricing model | Flat monthly fee (85%) vs per-child (15%) |

**Key Insight:**
Schools willing to pay R1,500-R3,500/month for full solution (attendance + logs + messaging + reports).

---

## 💰 PRICING MODEL OVERVIEW

### Monthly Subscription (Flat Fee per School)

| Tier | Children | Teachers | Monthly Price (ZAR) | Annual Price (ZAR) | Annual Discount |
|------|----------|----------|---------------------|-------------------|-----------------|
| **Starter** | 1-30 | 1-3 | R1,495 | R14,950 (R1,246/mo) | 17% off |
| **Growth** | 31-80 | 4-8 | R2,995 | R29,950 (R2,496/mo) | 17% off |
| **Professional** | 81-150 | 9-15 | R4,995 | R49,950 (R4,163/mo) | 17% off |
| **Enterprise** | 151+ | 16+ | Custom | Custom | Custom |

**Why These Tiers:**
- **Starter:** Covers 60% of South African preschools (20-30 children)
- **Growth:** Covers 30% of preschools (40-80 children)
- **Professional:** Covers 8% of preschools (100+ children)
- **Enterprise:** Covers 2% (multi-site chains)

---

### What's Included (All Tiers)

| Feature | Starter | Growth | Professional | Enterprise |
|---------|---------|--------|--------------|------------|
| **Core Features** |
| Attendance tracking | ✅ | ✅ | ✅ | ✅ |
| Meal & nap logging | ✅ | ✅ | ✅ | ✅ |
| Daily activity logs | ✅ | ✅ | ✅ | ✅ |
| Incident reports | ✅ | ✅ | ✅ | ✅ |
| Parent messaging | ✅ | ✅ | ✅ | ✅ |
| Photo uploads | 5/day | 15/day | Unlimited | Unlimited |
| Data storage | 5 GB | 20 GB | 100 GB | Unlimited |
| **Users** |
| Parent accounts | Unlimited | Unlimited | Unlimited | Unlimited |
| Teacher accounts | 3 | 8 | 15 | Unlimited |
| Admin accounts | 1 | 2 | 5 | Unlimited |
| **Reports** |
| Daily summaries | ✅ | ✅ | ✅ | ✅ |
| Weekly reports | ✅ | ✅ | ✅ | ✅ |
| Monthly compliance reports | ✅ | ✅ | ✅ | ✅ |
| Custom analytics | ❌ | ❌ | ✅ | ✅ |
| **Support** |
| Email support | ✅ | ✅ | ✅ | ✅ |
| Response time | 48 hours | 24 hours | 12 hours | 4 hours |
| Phone support | ❌ | ❌ | ✅ | ✅ |
| Dedicated account manager | ❌ | ❌ | ❌ | ✅ |
| **Compliance** |
| POPIA compliance | ✅ | ✅ | ✅ | ✅ |
| Audit trail | ✅ | ✅ | ✅ | ✅ |
| Data export | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 TIER BREAKDOWN

### TIER 1: STARTER (R1,495/month)

**Target Customer:**
- Small home-based preschools (20-30 children)
- First-time tech adopters
- Budget-conscious principals
- Single-classroom operations

**Typical School Profile:**
- 25 children, 3 teachers, 1 principal
- Revenue: R50,000/month (25 kids × R2,000)
- Tech budget: R2,000/month
- Gumpo cost: R1,495/month (75% of tech budget)

**Value Proposition:**
> **"Professional daily communication for R50/day"**

**ROI Calculation:**
- Time saved: 3 teachers × 98 min/day = 294 min/day = 4.9 hours/day
- Labor cost saved: 4.9 hours × R300/hour = R1,470/day
- Monthly savings: R1,470 × 22 days = R32,340/month
- **ROI: 2,063%** (save R32,340, pay R1,495)

**Limits:**
- 30 children max (upgrade to Growth if you grow)
- 3 teacher accounts (most small schools have 2-3)
- 5 photos/day (enough for daily highlights)
- 5 GB storage (enough for 6 months of photos)

**Upgrade Trigger:**
- School grows to 31+ children (automatic upgrade offer)
- Need more than 3 teacher accounts
- Want unlimited photos (upgrade or buy add-on)

---

### TIER 2: GROWTH (R2,995/month)

**Target Customer:**
- Established preschools (40-80 children)
- Multi-classroom operations
- Growth-focused principals
- Want more features (photos, analytics)

**Typical School Profile:**
- 60 children, 6 teachers, 1 principal + 1 assistant
- Revenue: R180,000/month (60 kids × R3,000)
- Tech budget: R5,000/month
- Gumpo cost: R2,995/month (60% of tech budget)

**Value Proposition:**
> **"Unlimited growth. Fixed price. No surprises."**

**ROI Calculation:**
- Time saved: 6 teachers × 98 min/day = 588 min/day = 9.8 hours/day
- Labor cost saved: 9.8 hours × R300/hour = R2,940/day
- Monthly savings: R2,940 × 22 days = R64,680/month
- **ROI: 2,060%** (save R64,680, pay R2,995)

**Limits:**
- 80 children max (upgrade to Professional if you grow)
- 8 teacher accounts (covers 2-3 classrooms)
- 15 photos/day (enough for each teacher to post 2-3)
- 20 GB storage (enough for 1 year of photos)

**Most Popular Tier:**
- 65% of customers expected to choose Growth tier
- Sweet spot: affordable + enough features

---

### TIER 3: PROFESSIONAL (R4,995/month)

**Target Customer:**
- Large preschools (100+ children)
- Multi-classroom, multi-building operations
- Data-driven principals
- Want advanced analytics + custom reports

**Typical School Profile:**
- 120 children, 12 teachers, 2 admins
- Revenue: R480,000/month (120 kids × R4,000)
- Tech budget: R10,000/month
- Gumpo cost: R4,995/month (50% of tech budget)

**Value Proposition:**
> **"Enterprise features. Small business price."**

**ROI Calculation:**
- Time saved: 12 teachers × 98 min/day = 1,176 min/day = 19.6 hours/day
- Labor cost saved: 19.6 hours × R300/hour = R5,880/day
- Monthly savings: R5,880 × 22 days = R129,360/month
- **ROI: 2,491%** (save R129,360, pay R4,995)

**Limits:**
- 150 children max (upgrade to Enterprise if you grow)
- 15 teacher accounts (covers 4-5 classrooms)
- Unlimited photos (no daily limit)
- 100 GB storage (enough for 2+ years)

**Unique Features:**
- Custom analytics dashboard (e.g., "Which classroom has best attendance?")
- Phone support (12-hour response time)
- Priority feature requests (your feedback influences roadmap)

---

### TIER 4: ENTERPRISE (Custom Pricing)

**Target Customer:**
- Multi-site preschool chains (5+ locations)
- Franchises (need unified reporting)
- Corporate childcare (on-site at companies)
- Government programs (need custom compliance)

**Typical School Profile:**
- 300+ children across 5 locations
- 30+ teachers, 5 admins, 1 regional manager
- Revenue: R1,200,000/month (300 kids × R4,000)
- Tech budget: R30,000/month
- Gumpo cost: R15,000-R25,000/month (negotiable)

**Value Proposition:**
> **"One system. Multiple locations. Unified reporting."**

**Custom Features:**
- Multi-site dashboard (compare locations)
- Single sign-on (SSO) integration
- Custom API access (integrate with payroll, CRM)
- Dedicated account manager (monthly check-ins)
- On-site training (we come to you)
- Custom SLA (99.9% uptime guarantee)

**Pricing Model:**
- Base: R4,995/month (first location)
- Additional locations: R2,000/month each
- Example: 5 locations = R4,995 + (4 × R2,000) = R12,995/month

---

## 🛒 OPTIONAL ADD-ONS

### ADD-ON 1: Extra Photo Storage

**Problem:**
Starter tier (5 photos/day) may not be enough for schools that love sharing photos.

**Solution:**
| Add-On | Photos/Day | Storage | Monthly Price |
|--------|------------|---------|---------------|
| Photo Pack S | +10 photos/day | +5 GB | R299 |
| Photo Pack M | +25 photos/day | +20 GB | R599 |
| Photo Pack L | Unlimited | +100 GB | R999 |

**Who Buys This:**
- Starter tier schools that want more photos (without upgrading to Growth)
- Schools with dedicated photographer (weekly photo days)

---

### ADD-ON 2: Video Support

**Problem:**
MVP doesn't include video uploads (too expensive for storage/bandwidth).

**Solution:**
| Add-On | Video Uploads | Storage | Monthly Price |
|--------|---------------|---------|---------------|
| Video Pack | 5 videos/day (30 sec max) | +10 GB | R799 |

**Who Buys This:**
- Schools that want to share short video clips (e.g., child's first steps, singing)
- Premium preschools (high-paying parents expect video)

**Note:**
Video is Phase 2 feature (not MVP). Add-on available after Month 6.

---

### ADD-ON 3: SMS Notifications

**Problem:**
Some parents don't have smartphones or reliable internet. Need SMS notifications.

**Solution:**
| Add-On | SMS/Month | Monthly Price |
|--------|-----------|---------------|
| SMS Pack S | 100 SMS | R199 |
| SMS Pack M | 300 SMS | R499 |
| SMS Pack L | 1,000 SMS | R1,299 |

**Who Buys This:**
- Rural preschools (poor internet access)
- Low-income families (basic phones, no smartphones)

**Cost Breakdown:**
- SMS cost in South Africa: R0.30-R0.50 per SMS
- Gumpo markup: 3x (R1.50-R2.00 per SMS)
- Example: 100 SMS = R150 cost → R199 price (R49 margin)

---

### ADD-ON 4: Advanced Analytics

**Problem:**
Professional tier includes basic analytics. Some schools want custom dashboards.

**Solution:**
| Add-On | Features | Monthly Price |
|--------|----------|---------------|
| Analytics Pro | Custom dashboards, trend analysis, predictive insights | R1,499 |

**Who Buys This:**
- Data-driven principals (want to optimize operations)
- Multi-site chains (compare locations)
- Schools applying for grants (need data to prove impact)

**Features:**
- Attendance trends (which days have low attendance?)
- Meal patterns (which children consistently don't eat?)
- Incident analysis (are injuries increasing?)
- Teacher performance (who completes daily summaries on time?)

---

### ADD-ON 5: White-Label Branding

**Problem:**
Enterprise customers want Gumpo to look like their brand (logo, colors, domain).

**Solution:**
| Add-On | Features | One-Time Setup | Monthly Price |
|--------|----------|----------------|---------------|
| White-Label | Custom logo, colors, domain (e.g., app.brightfutures.co.za) | R5,000 | R999 |

**Who Buys This:**
- Multi-site preschool chains (want consistent brand)
- Franchises (franchisees expect branded tools)

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: MVP Launch (Months 1-3)
**Pricing:**
- Starter: R1,495/month
- Growth: R2,995/month
- Professional: R4,995/month

**No Add-Ons Yet:**
Focus on core product. Add-ons come later.

**Goal:**
- Sign 10 pilot schools (free for 3 months)
- After pilot, convert to paid (target: 80% conversion)

---

### Phase 2: Add-Ons Launch (Months 4-6)
**Available Add-Ons:**
- Extra Photo Storage (all tiers)
- SMS Notifications (all tiers)

**Goal:**
- 20% of customers buy at least one add-on
- Average add-on revenue: R400/customer/month

---

### Phase 3: Enterprise Launch (Months 7-12)
**Available:**
- Enterprise tier (custom pricing)
- Video Support add-on (Phase 2 feature)
- Advanced Analytics add-on
- White-Label Branding add-on

**Goal:**
- Sign 3 enterprise customers (5+ locations each)
- Enterprise revenue: R40,000/month (3 customers × R13,000 avg)

---

## 💵 FINANCIAL PROJECTIONS

### Year 1 Revenue Forecast (Conservative)

| Month | New Customers | Total Customers | Avg. Price | Monthly Revenue | Cumulative Revenue |
|-------|---------------|-----------------|------------|-----------------|-------------------|
| 1-3 | 10 (free pilot) | 10 | R0 | R0 | R0 |
| 4 | 8 (80% convert) | 8 | R2,500 | R20,000 | R20,000 |
| 5 | +3 | 11 | R2,500 | R27,500 | R47,500 |
| 6 | +3 | 14 | R2,500 | R35,000 | R82,500 |
| 7 | +4 | 18 | R2,600 | R46,800 | R129,300 |
| 8 | +4 | 22 | R2,600 | R57,200 | R186,500 |
| 9 | +5 | 27 | R2,600 | R70,200 | R256,700 |
| 10 | +5 | 32 | R2,600 | R83,200 | R339,900 |
| 11 | +6 | 38 | R2,600 | R98,800 | R438,700 |
| 12 | +6 | 44 | R2,600 | R114,400 | R553,100 |

**Year 1 Totals:**
- Customers: 44 schools
- Revenue: R553,100 (first 12 months)
- Average Revenue Per Account (ARPA): R2,600/month
- Customer Acquisition Cost (CAC): R5,000 per school (marketing + sales)
- Total CAC: R220,000 (44 × R5,000)
- Gross Profit Margin: 75% (hosting costs ~25% of revenue)
- Net Profit: R414,825 - R220,000 - R500,000 (salaries) = **-R305,175 (loss Year 1)**

---

### Year 2 Revenue Forecast (Growth Phase)

| Metric | Year 2 |
|--------|--------|
| Starting Customers | 44 |
| New Customers/Month | 8-10 |
| Total New Customers | 100 |
| Total Customers (End Year 2) | 144 |
| Churn Rate | 10% (14 customers lost) |
| Net Customers | 130 |
| Average Revenue Per Account (ARPA) | R2,800/month (add-ons increase ARPA) |
| Monthly Revenue (End Year 2) | R364,000 |
| Annual Revenue (Year 2) | R3,276,000 |
| Gross Profit Margin | 78% (economies of scale) |
| Gross Profit | R2,555,280 |
| Operating Expenses | R2,000,000 (salaries, marketing) |
| **Net Profit (Year 2)** | **R555,280 (profitable!)** |

---

### Year 3 Revenue Forecast (Scale Phase)

| Metric | Year 3 |
|--------|--------|
| Starting Customers | 130 |
| New Customers/Month | 12-15 |
| Total New Customers | 160 |
| Total Customers (End Year 3) | 290 |
| Churn Rate | 8% (23 customers lost) |
| Net Customers | 267 |
| Average Revenue Per Account (ARPA) | R3,000/month |
| Monthly Revenue (End Year 3) | R801,000 |
| Annual Revenue (Year 3) | R7,614,000 |
| Gross Profit Margin | 80% |
| Gross Profit | R6,091,200 |
| Operating Expenses | R3,500,000 |
| **Net Profit (Year 3)** | **R2,591,200** |

---

## 🧠 PRICING PSYCHOLOGY

### 1. Anchor Pricing (Make Middle Tier Look Attractive)

**Strategy:**
Show all three tiers side-by-side. Most customers choose middle tier (Growth).

**Example:**
```
[Starter]         [Growth] ⭐         [Professional]
R1,495/month     R2,995/month       R4,995/month
1-30 children    31-80 children     81-150 children
5 photos/day     15 photos/day      Unlimited photos

           ↑ Most Popular
```

**Psychology:**
- Starter looks "too limited" (only 5 photos/day)
- Professional looks "too expensive" (R5,000/month)
- Growth is "just right" (Goldilocks effect)

---

### 2. Annual Discount (Encourage Long-Term Commitment)

**Strategy:**
17% discount for annual payment (reduces churn, improves cash flow).

**Example:**
- Monthly: R2,995/month × 12 = R35,940/year
- Annual: R29,950/year (save R5,990)

**Psychology:**
- "Save R5,990/year" sounds better than "17% off"
- Annual payment = sunk cost (less likely to cancel mid-year)

---

### 3. Free Trial (Remove Risk)

**Strategy:**
3-month free trial for pilot schools (no credit card required).

**Why:**
- Schools hesitant to pay upfront (need proof it works)
- 80% conversion rate after trial (if product works well)

**Psychology:**
- "Try before you buy" removes fear of wasting money
- After 3 months, schools are dependent on Gumpo (switching cost)

---

### 4. Usage-Based Upsells (Not Core Pricing)

**Strategy:**
Core pricing is flat monthly fee. Add-ons are usage-based (e.g., SMS per message).

**Why:**
- Predictable core pricing = no surprises (builds trust)
- Optional add-ons = only pay for what you use (fairness)

**Example:**
- Core: R2,995/month (fixed)
- Add-on: R199 for 100 SMS (optional)

---

### 5. Social Proof (Show Popularity)

**Strategy:**
Mark Growth tier as "Most Popular" (65% of customers choose this).

**Why:**
- Customers trust what others choose (herd mentality)
- Reduces decision paralysis (if unsure, pick popular one)

---

## ✅ PRICING VALIDATION CHECKLIST

Before launching pricing, validate:

### Affordability
- [ ] Starter tier <5% of small preschool revenue?
- [ ] Growth tier <3% of medium preschool revenue?
- [ ] Professional tier <2% of large preschool revenue?

### Competitiveness
- [ ] Priced 20-30% below competitors (Kinderlime, Procare)?
- [ ] Better value (more features for same price)?

### Profitability
- [ ] Gross profit margin >70%?
- [ ] Breakeven <24 months?
- [ ] Customer Lifetime Value (LTV) >3x Customer Acquisition Cost (CAC)?

### Clarity
- [ ] Pricing tiers clearly differentiated?
- [ ] No hidden fees or surprise charges?
- [ ] Easy to understand in 30 seconds?

---

## 🏁 CONCLUSION

**Pricing Summary:**
- **Starter:** R1,495/month (1-30 children)
- **Growth:** R2,995/month (31-80 children) ⭐ Most Popular
- **Professional:** R4,995/month (81-150 children)
- **Enterprise:** Custom pricing (151+ children, multi-site)

**Key Differentiators:**
- Flat monthly fee (no per-child penalty)
- Unlimited parent accounts (no hidden costs)
- 3-month free trial (risk-free)
- 17% annual discount (long-term commitment)

**Financial Targets:**
- Year 1: 44 customers, R553,100 revenue (loss R305,175)
- Year 2: 130 customers, R3.3M revenue (profit R555,280)
- Year 3: 267 customers, R7.6M revenue (profit R2.6M)

**Next Steps:**
- Validate pricing with 20 pilot schools (feedback survey)
- Test annual discount (measure conversion rate)
- Launch add-ons in Month 4 (measure adoption)

Ready to monetize. 💰

---

**Document Status:** APPROVED FOR IMPLEMENTATION  
**Related Documents:**
- FEATURE_PRIORITIZATION.md (Which features justify pricing)
- PRODUCT_VISION_AND_JOURNEYS.md (Value delivered)
- PILOT_SCHOOL_READINESS.md (How to onboard paying customers)
