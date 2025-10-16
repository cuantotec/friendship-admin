# Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Build Status
- [x] `npm run build` completed successfully
- [x] No TypeScript errors
- [x] All dependencies installed
- [x] Database schema up to date

### 2. Git Status
- [x] All changes committed to git
- [x] Changes pushed to remote repository
- [x] No uncommitted changes

### 3. Configuration Files
- [x] `vercel.json` configured for Next.js
- [x] `next.config.ts` properly configured
- [x] `package.json` scripts are correct

## 🔧 Environment Variables Required in Vercel

Set these environment variables in your Vercel dashboard:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Authentication
```
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### Stack Auth
```
STACK_PROJECT_ID=your_stack_project_id_here
STACK_API_KEY=your_stack_api_key_here
STACK_PUBLIC_KEY=your_stack_public_key_here
```

### Cloudinary (Image Uploads)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Email Service
```
RESEND_API_KEY=re_your_resend_api_key_here
```

### Admin Configuration
```
ADMIN_EMAILS=[{"email":"admin@friendshipcentergallery.org","name":"Gallery Admin"}]
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
```

### Revalidation (NEW)
```
MAIN_SITE_URL=https://friendshipcentergallery.org
REVALIDATE_SECRET=your-revalidate-secret-here
```

### App Configuration
```
NODE_ENV=production
```

## 🚀 Deployment Steps

1. **Connect Repository to Vercel**
   - Go to Vercel Dashboard
   - Import project from GitHub
   - Select `friendship-admin` repository

2. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all variables listed above
   - Use production values (not localhost)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployed application

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Application loads without errors
- [ ] Login page is accessible
- [ ] Admin dashboard loads (after login)

### 2. Revalidation Testing
- [ ] Test revalidation script: `npx tsx scripts/test-revalidation.ts`
- [ ] Verify revalidation calls to main site
- [ ] Check console logs for revalidation status

### 3. Admin Features
- [ ] Create/update/delete artworks
- [ ] Create/update/delete artists
- [ ] Toggle visibility settings
- [ ] Upload images to Cloudinary

### 4. Email System
- [ ] Test email sending functionality
- [ ] Verify email templates render correctly

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from Vercel
   - Ensure database schema is up to date

3. **Authentication Issues**
   - Verify Stack Auth credentials
   - Check `NEXTAUTH_URL` matches deployment URL
   - Ensure redirect URLs are configured

4. **Revalidation Issues**
   - Check `MAIN_SITE_URL` and `REVALIDATE_SECRET`
   - Verify main site's revalidation endpoint is accessible
   - Check network connectivity

### Debug Commands

```bash
# Test revalidation locally
npx tsx scripts/test-revalidation.ts

# Test email system
npx tsx scripts/test-email.ts

# Check build locally
npm run build
```

## 📊 Monitoring

After deployment, monitor:

1. **Vercel Dashboard**
   - Build logs
   - Function logs
   - Performance metrics

2. **Application Logs**
   - Revalidation success/failure
   - Database connection status
   - Authentication errors

3. **Main Site**
   - Cache invalidation working
   - Data updates reflected
   - Performance impact

## 🎯 Success Criteria

- [ ] Application deploys without errors
- [ ] All admin features work correctly
- [ ] Revalidation system functions properly
- [ ] Email system sends emails successfully
- [ ] Image uploads work with Cloudinary
- [ ] Database operations complete successfully
- [ ] Authentication and authorization work correctly

## 📝 Notes

- The revalidation system will automatically trigger when data is modified
- All admin operations include error handling for revalidation failures
- The system is designed to continue working even if revalidation fails
- Monitor logs for any revalidation issues
