# 🖨️ CampusPrint – Full-Stack Multi-Vendor Printing Marketplace
**"Your Campus. Your Shop. Your Print."**

A complete multi-vendor online printing marketplace tailored for university students (commencing with the DIU–Ashulia campus) and local printing shop vendors.

---

## 🌟 Tech Stack Architecture
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (Zero frameworks, 100% cleanly separated).
- **Backend:** PHP 8+ (PDO Prepared Statements, Secure Session Management, Password Hashing).
- **Database:** MySQL 8+ / MariaDB (InnoDB, Foreign Key Constraints, utf8mb4).
- **Environment:** Local Development on XAMPP (`Apache` & `MySQL`).
- **Payment Method:** Strictly **Cash on Delivery (COD)** / **Cash on Pickup** (No online gateway).

---

## 📁 Project Directory Structure

```
campusprint/
├── index.html                        ← Modern 12-section Marketplace Homepage
│
├── config/
│   └── db.php                        ← PDO MySQL Database Connection & Helpers
│
├── database/
│   └── campusprint.sql               ← 1-Click Complete Database Schema & Seed Data
│
├── api/                              ← RESTful PHP Backend Endpoints
│   ├── auth/
│   │   ├── login.php                 ← Secure login with password_verify()
│   │   ├── register.php              ← Student registration with password_hash()
│   │   ├── register_shop.php         ← Owner + Shop registration & license upload
│   │   └── logout.php                ← Session destruction
│   ├── orders/
│   │   ├── create.php                ← Order creation & PDF document upload
│   │   ├── update_status.php         ← Shop status updates (Vendor isolation)
│   │   └── mark_paid.php             ← COD payment verification & loyalty points credit
│   ├── shops/
│   │   ├── list.php                  ← Predefined location-based shop search & filter
│   │   └── update_pricing.php        ← Shop-specific individual pricing updates
│   └── admin/
│       └── verify_shop.php           ← Trade license inspection & shop approval
│
├── uploads/                          ← Uploaded Files Storage
│   ├── documents/                    ← Student PDF documents
│   └── licenses/                     ← Vendor Trade License documents
│
├── pages/
│   ├── find-shops.html               ← Shop search with location ID filter
│   ├── shop-details.html             ← Individual shop profile & rates table
│   ├── services.html                 ← Printing & finishing services
│   ├── about.html                    ← About CampusPrint
│   ├── contact.html                  ← Official contact details
│   ├── faq.html                      ← Frequently Asked Questions
│   │
│   ├── customer/                     ← Student Portal
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── place-order.html          ← Live Price Calculator (Shop rates)
│   │   ├── track-order.html          ← 5-stage live status tracker
│   │   ├── my-orders.html
│   │   ├── my-rewards.html           ← Shop loyalty balances (5% & 10% tiers)
│   │   ├── favorite-shops.html
│   │   └── my-profile.html
│   │
│   ├── shop-owner/                   ← Vendor Portal
│   │   ├── login.html
│   │   ├── register.html             ← Step 1: Owner Profile (Confidential NID)
│   │   ├── shop-register.html        ← Step 2: Shop & Trade License
│   │   ├── dashboard.html            ← Verified cash revenue analytics
│   │   ├── manage-orders.html        ← Order status progression & COD collect
│   │   ├── manage-services.html      ← Individual price editor (B&W/Color/Binding)
│   │   ├── delivery-settings.html    ← Delivery coverage area rates
│   │   ├── sales-analytics.html      ← Realized sales breakdown
│   │   ├── manage-loyalty.html       ← Point accrual rate settings
│   │   ├── manage-discounts.html
│   │   └── shop-profile.html
│   │
│   └── admin/                        ← Platform Administration
│       ├── login.html
│       ├── dashboard.html            ← Platform overview
│       ├── shop-approval.html        ← Trade license review & approval
│       ├── user-management.html
│       └── order-monitoring.html     ← Global live orders audit log
│
├── css/                              ← Cleanly separated stylesheets
│   ├── global.css                    ← Design tokens, colors, resets, animations
│   ├── components.css                ← 23 modular reusable components
│   ├── home.css                      ← Homepage layout styles
│   ├── shops.css                     ← Marketplace & shop profiles
│   ├── dashboard-customer.css        ← Student dashboard & timeline
│   └── dashboard-owner.css           ← Vendor dashboard & analytics
│
└── js/
    ├── data/
    │   ├── locations.js              ← Predefined Location IDs (DIU-Ashulia)
    │   ├── shops.js                  ← Verified printing shops data
    │   └── orders.js                 ← Demo order store
    ├── utils/
    │   └── auth.js                   ← Role-based session controller
    ├── components/
    │   ├── navbar.js                 ← Adaptive navbar (Guest / Student / Owner / Admin)
    │   └── footer.js                 ← Shared footer with contact information
    ├── home.js                       ← Homepage dynamic featured shops & search
    ├── find-shops.js                 ← Strict location ID matching & sorting
    ├── shop-details.js               ← Shop rates & review renderer
    └── place-order.js                ← Live price calculation engine
```

---

## ⚡ How to Run on Local XAMPP

### 1. Copy project to XAMPP htdocs
Copy the `campusprint` directory into your XAMPP web root:
`C:\xampp\htdocs\campusprint`

### 2. Start Apache and MySQL
Open **XAMPP Control Panel** and click **Start** for both **Apache** and **MySQL**.

### 3. Import Database
1. Open your browser and go to `http://localhost/phpmyadmin`
2. Click on **Import** tab.
3. Choose file: `campusprint/database/campusprint.sql`.
4. Click **Import** (or **Go**).
5. The `campusprint` database with all 10 tables and pre-configured seed records is ready!

### 4. Open Website
Navigate to:
`http://localhost/campusprint/`

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access / Note |
|---|---|---|---|
| **Student** | `student@diu.edu.bd` | `demo1234` | Full student dashboard & order flow |
| **Shop Owner** | `smartprint.diu@gmail.com` | `demo1234` | Smart Print Point (Orders & Pricing) |
| **Admin** | `admin@campusprint.com` | `admin2026` | Master admin dashboard & shop approval |

*(1-Click Demo Login buttons are also available on all login screens for instant testing).*

---

## 🛡️ Business Rules Enforced
1. **Single-Shop Orders & Individual Pricing:** Each order belongs to one vendor. The live price calculator strictly applies that specific shop's individual rates.
2. **Predefined Location IDs:** Shop location (`shop_location_id`) and delivery coverage (`delivery_area_ids`) use structured IDs — never error-prone free text.
3. **Cash on Delivery / Pickup Only:** No payment gateway. Payment is marked as `paid` only when verified cash is received.
4. **Strict Sales Accounting:** Pending and Cancelled orders are never counted as revenue.
5. **Shop-Specific Loyalty Points:** Points accumulate only on completed and cash-paid orders. 5,000 pts = 5% discount; 10,000 pts = 10% discount.
6. **Confidentiality:** NID numbers and trade license files are shielded from public endpoints and only visible to authorized platform administrators.

---

## 📞 Support & Contacts
- **Email:** `sowrovtaluk07@gmail.com`
- **Phone:** `01921646409`
- **Copyright:** © 2026 CampusPrint. All rights reserved.
