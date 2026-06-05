# Deployment & Setup Guide

## Quick Start

### Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open in browser
open http://localhost:3000
```

### Build for Production
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Environment Setup

### Required Environment Variables
None required for basic testnet functionality.

### Optional Configuration
```env
# Stellar Network (default: testnet)
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# For WalletConnect (future)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Deployment Options

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel deploy

# Set up for production
vercel --prod
```

**Benefits:**
- Automatic deployments from git
- Serverless functions included
- Edge network for global distribution
- Built-in analytics and monitoring

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Self-Hosted
```bash
# Build
pnpm build

# Deploy build files
# Copy .next/, public/, and node_modules/ to server
# Run: NODE_ENV=production pnpm start
```

## Pre-Deployment Checklist

- [ ] All dependencies installed (`pnpm install`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Freighter connection tested
- [ ] Secret key import tested
- [ ] Landing page loads
- [ ] Dashboard displays correctly
- [ ] Mobile responsiveness verified
- [ ] Environment variables set
- [ ] Security review completed

## Testing Before Deployment

### Manual Testing
```bash
# 1. Start dev server
pnpm dev

# 2. Test landing page
# - Open http://localhost:3000
# - Verify landing page loads
# - Click "Connect Wallet" button
# - Test all three connection options

# 3. Test secret key import
# - Use a Stellar testnet secret key
# - Verify public key is derived correctly
# - Check dashboard loads with balance

# 4. Test responsive design
# - Test on mobile (iPhone dimensions)
# - Test on tablet
# - Test on desktop
```

### Automated Testing (Optional)
```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests (if configured)
pnpm test
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
pnpm build --analyze

# Check for unused dependencies
pnpm audit
```

### Runtime Optimization
- **Code Splitting**: Next.js automatically splits code by route
- **Image Optimization**: Use Next.js Image component
- **Caching**: Set appropriate cache headers
- **Compression**: Enable gzip/brotli compression

## Monitoring

### Essential Metrics
- **Lighthouse Score**: Target > 90
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

### Monitoring Tools
- Vercel Analytics
- Google Analytics
- Sentry (for error tracking)
- LogRocket (for session replay)

## Security Best Practices

### Code Security
- ✅ No hardcoded secrets
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced
- ✅ CSP headers configured
- ✅ XSS protection enabled

### Wallet Security
- ✅ Secret keys stored in RAM only
- ✅ No persistence to localStorage
- ✅ Clear on disconnect
- ✅ Freighter: Key never exposed to app
- ✅ User warnings on manual import

### Data Security
- ✅ All API calls over HTTPS
- ✅ No sensitive data in URL parameters
- ✅ Session management with tokens
- ✅ CORS properly configured

## Rollback Plan

### If Deployment Fails
```bash
# Revert to previous version
git revert HEAD
pnpm build
vercel deploy --prod

# Or rollback Vercel deployment
vercel rollback
```

## Maintenance

### Regular Tasks
- **Weekly**: Check error logs, monitor performance
- **Monthly**: Update dependencies, review security advisories
- **Quarterly**: Full security audit, performance review

### Dependency Updates
```bash
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update

# Update specific package
pnpm update @stellar/stellar-sdk
```

## Support & Debugging

### Logs
```bash
# View production logs
vercel logs

# View build logs
vercel logs --follow
```

### Common Issues

**Issue: Freighter connection fails**
- Check if Freighter extension is installed
- Verify extension permissions
- Check browser console for errors
- Ensure testnet is selected in Freighter

**Issue: Secret key import not working**
- Verify key format (must start with 'S')
- Check for hidden spaces or characters
- Ensure key is 56 characters
- Check browser console for validation errors

**Issue: Dashboard won't load**
- Clear browser cache
- Check network tab for failed requests
- Verify Stellar network connectivity
- Check for JavaScript errors in console

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stellar Developer Docs](https://developers.stellar.org/)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Contact & Support

For issues and support:
- GitHub Issues: [Create an issue]
- Email: support@lumen.stellar
- Discord: [Join our community]

---

**Last Updated**: June 2026  
**Maintained By**: Lumen Team  
**Version**: 1.0.0
