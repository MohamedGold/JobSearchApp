# Job Search App

**Job Search App** is a comprehensive application designed for job seekers and companies. The app allows users to search for jobs relevant to their interests, while companies can post job opportunities and manage applications. It also provides an admin dashboard with GraphQL for managing users and companies.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [API Endpoints](#api-endpoints)
- [GraphQL Admin Dashboard](#graphql-admin-dashboard)
- [Task Scheduling](#task-scheduling)
- [Deployment](#deployment)
- [Postman Collection](#postman-collection)
- [License](#license)
- [New Additions / Modifications](#new-additions--modifications)

## Features

- **Job Search**  
  Filter job opportunities by criteria such as job title, working time, job location, and seniority level.

- **User Management**  
  - User registration with email verification (OTP-based).  
  - Secure sign-in (including Google-based authentication).  
  - Update account information with encrypted mobile number and password updates.  
  - Upload and manage profile & cover images.

- **Company Management**  
  - Add, update, soft delete, and search companies.  
  - Upload and delete company logos and cover images.  
  - Virtual populate related job opportunities.  
  - HR management (assign HRs to a company).

- **Job Management**  
  - Companies (owner or HR) can add, update, and delete job postings.  
  - Applicants (only users) can apply to jobs, with checks to prevent self-application.  
  - Review and update application statuses with email notifications (accepted, rejected, etc.).

- **Application Management**  
  - Apply for jobs with CV uploads (file handled via Cloudinary).  
  - Prevent duplicate applications.  
  - HR can accept, reject, or mark applications as viewed/in consideration with automated email notifications.

- **Chat Functionality**  
  Real-time messaging between HR/company owners and job applicants using Socket.IO.

- **Admin Dashboard (GraphQL)**  
  Manage and view all users and companies. Includes mutations to ban/unban users/companies and approve companies.

- **Task Scheduling**  
  A cron job runs every 6 hours to delete expired OTP codes from the database.

## Requirements

- **Node.js** (v20 or higher recommended)
- **MongoDB** (Cloud or local instance)
- **GitHub** account for code hosting
- **AWS (or any cloud service)** for deployment (recommended)

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **File Storage**: Cloudinary
- **Real-Time Communication**: Socket.IO
- **GraphQL**: graphql, graphql-http
- **Validation**: Joi
- **Task Scheduling**: node-cron
- **Email Service**: nodemailer
- **Excel Generation (Bonus)**: ExcelJS

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/job-search-app.git
   cd job-search-app
 
2. **Install Dependencies**:
   ```bash
   npm install


3. **Set Up Environment Variables**: Create a `.env` file in the root of your project with the following variables (adjust values as needed):

   ```env
   APP_NAME="JobSearchApp"
   NODE_ENV="development"
   PORT="3000"
   DB_URI="your_mongo_connection_string"
   MOOD="DEV"
   ENCRYPTION_KEY="yourEncryptionKey"
   SALT="10"

   EMAIL="youremail@gmail.com"
   EMAIL_PASSWORD="yourEmailPassword"

   USER_ACCESS_TOKEN="yourUserAccessTokenSecret"
   ADMIN_ACCESS_TOKEN="yourAdminAccessTokenSecret"
   USER_REFRESH_TOKEN="yourUserRefreshTokenSecret"
   ADMIN_REFRESH_TOKEN="yourAdminRefreshTokenSecret"

   EXPIRESIN=3600

   CLIENT_ID="your_google_client_id"

   cloud_name="your_cloud_name"
   api_key="your_api_key"
   api_secret="your_api_secret"

   PAGE=1
   SIZE=5
   WHITELIST="http://example1.com,http://example2.com"
   ```

4. **Run the Application**:

   - For development:
     ```bash
     npm run start:dev
     ```
   - For production:
     ```bash
     npm start
     ```

## API Endpoints

Below is an overview of the major API endpoints. Refer to your Postman collection for full details.

- **Auth APIs**

  - `POST /auth/signup`
  - `PATCH /auth/confirm-otp`
  - `POST /auth/signin`
  - `POST /auth/signup-google`
  - `POST /auth/login-google`
  - `PATCH /auth/forget-password`
  - `PATCH /auth/reset-password`
  - `GET /auth/refresh-token`

- **User APIs**

  - `PATCH /user/update-account`
  - `GET /user/me`
  - `GET /user/profile/:userId`
  - `PATCH /user/update-password`
  - `PATCH /user/upload-profile-pic`
  - `PATCH /user/upload-cover-pic`
  - `DELETE /user/delete-profile-pic`
  - `DELETE /user/delete-cover-pic`
  - `DELETE /user/delete-account`

- **Company APIs**

  - `POST /company`
  - `PATCH /company/:companyId`
  - `DELETE /company/:companyId`
  - `GET /company/:companyId` (virtual populate for jobs)
  - `GET /company` (search by name)
  - `GET /company/:companyId/applications/excel?date=YYYY-MM-DD` (Download-Company-Applications-Excel)
  - `PATCH /company/:companyId/logo`
  - `PATCH /company/:companyId/cover`
  - `DELETE /company/:companyId/logo`
  - `DELETE /company/:companyId/cover`

- **Jobs APIs**

  - `POST /job`
  - `PATCH /job/:jobId`
  - `DELETE /job/:jobId`
  - `GET /job` (filters, pagination, merge params)
  - `GET /job/search` (filter with workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills)
  - `GET /job/:jobId/applications`
  - `POST /job/:jobId/apply`
  - `PATCH /job/:jobId/applications/:applicationId`

- **Chat APIs**

  - `GET /chat/:userId`

- **Bonus - Excel Export**

  - `GET /company/:companyId/applications/excel?date=YYYY-MM-DD`\
    Exports an Excel sheet with all applications for the specified company on the given day.

## GraphQL Admin Dashboard

- **Endpoint**: `/admin`

- **Queries**:

  - `users`: Returns all users
  - `companies`: Returns all companies

- **Mutations**:

  - `banUser(userId: ID!)`
  - `unbanUser(userId: ID!)`
  - `banCompany(companyId: ID!)`
  - `unbanCompany(companyId: ID!)`
  - `approveCompany(companyId: ID!)`

## Task Scheduling

A **cron job** runs every 6 hours to delete expired OTP codes from the database:

- File: `src/utils/cron/deleteExpiredOTPs.js`

## Deployment

1. Deploy the project to a hosting service such as **AWS** or **Heroku**.
2. Set the environment variables on the hosting platform.

## Postman Collection

Make sure to export and include your **Postman collection** that contains all endpoints with sample requests.

## License

This project is licensed under the **MIT License**. You’re free to modify and distribute as needed.

## New Additions / Modifications

- **Cascade Deletion Hooks**:\
  Ensures related documents (Applications, Jobs, Chats, and Companies) are deleted when a User or Company is removed via hard delete.

- **Excel Export Endpoint**:\
  `GET /company/:companyId/applications/excel?date=YYYY-MM-DD` for generating an Excel sheet of applications for a specific day.

- **GraphQL Admin Mutations**:\
  Ban/unban users and companies, approve companies, and fetch all data from a single GraphQL endpoint.

- **Closed Jobs**:\
  Users cannot apply to jobs if `job.closed === true`.

- **Banned & Deleted Checks**:\
  Users with `bannedAt` or `deletedAt` cannot access the APIs.


