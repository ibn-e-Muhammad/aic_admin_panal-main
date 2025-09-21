# AIC Website Admin Panel

![AIC Website Admin Panel](path_to_logo_or_screenshot.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Overview

The **AIC (Artificial Intelligence Club) Website Admin Panel** is a powerful and intuitive dashboard designed for administrators to manage the key aspects of the AIC website. The panel provides functionalities to handle the following:

- Events organization
- Sponsorship management
- Blog posting and editing
- Payment tracking

This panel ensures that the administrators can easily maintain and update the content of the club’s website without diving deep into code. The panel interacts with the backend, powered by [Supabase](https://supabase.com/), which allows real-time database updates and secure operations.

## Features

### Events Management
- **Create New Events**: Easily add new events with relevant details like date, description, venue, and images.
- **Edit Existing Events**: Modify the event information, including date changes or adding new details.
- **Delete Events**: Remove past or irrelevant events from the website.

### Sponsors Management
- **Add Sponsors**: Input sponsor details, including company name, logo, and sponsorship tier.
- **Edit Sponsors**: Update sponsor agreements, contacts, or tier levels.
- **Remove Sponsors**: Delete sponsors who no longer support the club.

### Blog Management
- **Create Blog Posts**: Add new articles or updates about club events, AI news, or achievements.
- **Edit Blog Posts**: Update existing posts with new information or make corrections.
- **Delete Blog Posts**: Remove outdated or irrelevant posts.

### Payment Management
- **Track Transactions**: Monitor and record payments related to events, memberships, sponsorships, and merchandise sales.
- **Payment History**: View detailed transaction histories for each user or sponsor.
- **Manage Refunds**: Issue refunds and manage other payment disputes.

### Security and Access Control
- **User Authentication**: Role-based authentication ensuring only authorized administrators can access or modify data.
- **Real-time Updates**: Thanks to Supabase’s real-time capabilities, changes made in the admin panel are instantly reflected on the website.

## Tech Stack

### Frontend
- **React**: For building the user interface of the admin panel.
- **Tailwind CSS**: For styling and responsiveness.
- **React Icons**: For a clean and consistent iconography.
- **React Router**: For navigation between different sections of the panel.

### Backend
- **Supabase**: A backend as a service that provides real-time databases and authentication features.
- **Axios**: For handling API requests to communicate with Supabase.

### Deployment
- **Vercel**: Ideal for hosting and deploying the admin panel.
- **Netlify**: Another option for deploying the frontend.

## Database Schema

The following tables are managed within the Supabase database:

### Events Table
| Column        | Type        | Description                        |
|---------------|-------------|------------------------------------|
| id            | UUID        | Unique identifier for each event   |
| title         | Text        | Title of the event                 |
| description   | Text        | Detailed description of the event  |
| date          | Timestamp   | Date and time of the event         |
| venue         | Text        | Location of the event              |
| image_url     | Text        | URL of the event image             |

### Sponsors Table
| Column        | Type        | Description                        |
|---------------|-------------|------------------------------------|
| id            | UUID        | Unique identifier for each sponsor |
| name          | Text        | Sponsor company or individual name |
| logo_url      | Text        | URL of sponsor logo                |
| tier          | Text        | Sponsorship tier (Gold, Silver, etc.) |

### Blogs Table
| Column        | Type        | Description                        |
|---------------|-------------|------------------------------------|
| id            | UUID        | Unique identifier for each blog post|
| title         | Text        | Blog title                         |
| content       | Text        | Blog content in Markdown format    |
| author        | Text        | Name of the blog post author       |
| published_at  | Timestamp   | Date the post was published        |

### Payments Table
| Column        | Type        | Description                        |
|---------------|-------------|------------------------------------|
| id            | UUID        | Unique identifier for each payment |
| user_id       | UUID        | Associated user or sponsor         |
| amount        | Decimal     | Payment amount                     |
| status        | Text        | Payment status (Completed, Pending, Refunded) |
| payment_date  | Timestamp   | Date of the transaction            |

## Setup Instructions

### Prerequisites
- **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Supabase Account**: Create an account at [Supabase](https://supabase.com/) and set up a new project.


