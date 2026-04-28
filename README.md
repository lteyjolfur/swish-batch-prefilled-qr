# Swish Batch QR Generator

Batch generate branded Swish QR codes from CSV.  
Built to simplify payment collection for clubs and organizations.

[Live Preview](https://swish-batch-prefilled-qr.vercel.app/)

![Screenshot](public/screenshot.png)

---

## Why this exists

Managing payments for a judo club meant creating multiple Swish QR codes for different groups (age groups, training tiers, etc.).

The official flow on swish.nu is manual and repetitive—fine for one payment, painful for dozens.

This tool was built to batch-generate QR codes with consistent, clean output.

---

## Features

- Upload a CSV to generate QR codes in bulk
- Automatic validation of input data
- Branded card output (ready for sharing or printing)
- Download all generated QR codes as a ZIP
- Simple UI — no login, no database

---

## CSV format

```csv
payee,amount,message,label
1231231234,100,Membership fee,Active Members
1231231234,150,Training fee,Youth Group
```
