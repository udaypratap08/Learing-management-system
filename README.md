# Edemy — Learning Management System (LMS)

A full-stack LMS for discovering courses, managing enrollments, and supporting educators.

🌐 **Live Demo:** https://learing-management-system-7j3t.vercel.app/  
💻 **GitHub:** https://github.com/udaypratap08/Learing-management-system

## Features
- Browse courses and view course details
- Student enrollment and learning progress features
- Educator dashboard and course management
- Clerk authentication integration
- Stripe payment integration
- Cloudinary media storage

## Tech Stack
**Frontend:** React, Vite, JavaScript, Axios  
**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Integrations:** Clerk, Stripe, Cloudinary, Multer  
**Deployment:** Vercel

## Screenshots

### Home Page
![Edemy Home Page](screenshots/home.png)

### Course Details
![Course Details](screenshots/course-details.png)

### Courses
![Courses](screenshots/courses.png)

### Educator Dashboard
![Educator Dashboard](screenshots/educator-dashboard.png)

### Educator Courses
![Educator Courses](screenshots/educator-courses.png)

### Student Enrollments
![Student Enrollments](screenshots/enrollments.png)

### Student List
![Student List](screenshots/student-list.png)

## Run Locally

```bash
git clone https://github.com/udaypratap08/Learing-management-system.git
cd Learing-management-system
```

Install dependencies separately in `client` and `server`:

```bash
cd client
npm install
npm run dev
```

In a second terminal:

```bash
cd server
npm install
```

Run the backend using the start script defined in `server/package.json` (for example, `npm run dev` if available).

## Environment Variables
Configure the environment variables required by your code in `client/.env` and `server/.env`. These may include the backend URL, MongoDB connection string, Clerk credentials, Cloudinary credentials, and Stripe keys. Check your source files for the exact variable names.



## Author
**UDAY PRATAP**  
GitHub: https://github.com/udaypratap08

---
Built as a full-stack web development project.
