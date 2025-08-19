# Branch Protection Rules

This document outlines the branch protection rules and workflow for the Shopify Quiz Builder project.

## Protected Branches

### Main Branch (`main`)
- **Requires pull request reviews**: At least 1 approval required
- **Requires status checks to pass**: All CI checks must pass
- **Requires branches to be up to date**: Must be up to date with `develop`
- **Restricts pushes**: No direct pushes allowed
- **Requires linear history**: No merge commits allowed

### Develop Branch (`develop`)
- **Requires status checks to pass**: All CI checks must pass
- **Requires branches to be up to date**: Must be up to date with `main`
- **Restricts pushes**: No direct pushes allowed
- **Requires linear history**: No merge commits allowed

## Branch Workflow

### Feature Development
1. **Create feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/task-15-quiz-templates
   ```

2. **Develop and test** locally
3. **Push and create PR** to `develop`
4. **Code review** and approval
5. **Merge to develop** after CI passes

### Release Process
1. **Create release branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.0.0
   ```

2. **Final testing and bug fixes**
3. **Create PR** to `main`
4. **Code review** and approval
5. **Merge to main** after CI passes
6. **Tag release** and merge back to `develop`

### Hotfix Process
1. **Create hotfix branch** from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-security-patch
   ```

2. **Fix critical issue**
3. **Create PR** to `main`
4. **Code review** and approval
5. **Merge to main** after CI passes
6. **Merge back to develop**

## Required Status Checks

### For `main` branch:
- [ ] **commitlint** - Commit message validation
- [ ] **lint** - Code quality checks
- [ ] **type-check** - TypeScript validation
- [ ] **test** - Unit and integration tests
- [ ] **build** - Build verification
- [ ] **security** - Security audit
- [ ] **bundle-size** - Bundle size analysis

### For `develop` branch:
- [ ] **commitlint** - Commit message validation
- [ ] **lint** - Code quality checks
- [ ] **type-check** - TypeScript validation
- [ ] **test** - Unit and integration tests
- [ ] **build** - Build verification
- [ ] **security** - Security audit

## Pull Request Requirements

### Required Checks
- All CI checks must pass
- Code coverage must not decrease
- Bundle size must not increase significantly
- No security vulnerabilities detected

### Required Reviews
- At least 1 approval from team members
- No changes requested reviews
- No dismissals of stale reviews

### Required Status
- Branch must be up to date with target branch
- No merge conflicts
- All conversations resolved

## Branch Naming Conventions

### Feature Branches
```
feature/task-{number}-{description}
feature/{feature-name}
```

Examples:
- `feature/task-15-quiz-templates`
- `feature/user-authentication`
- `feature/admin-dashboard`

### Bug Fix Branches
```
bugfix/{issue-description}
fix/{issue-description}
```

Examples:
- `bugfix/authentication-token-issue`
- `fix/quiz-submission-error`

### Hotfix Branches
```
hotfix/{critical-issue-description}
```

Examples:
- `hotfix/critical-security-patch`
- `hotfix/database-connection-failure`

### Release Branches
```
release/v{version-number}
```

Examples:
- `release/v1.0.0`
- `release/v1.1.0`

## Merge Strategies

### Squash and Merge (Recommended)
- **Use for**: Feature branches, bug fixes
- **Benefits**: Clean history, single commit per feature
- **When to use**: Most feature development

### Rebase and Merge
- **Use for**: Release branches, hotfixes
- **Benefits**: Linear history, preserves commit structure
- **When to use**: When preserving commit history is important

### Create Merge Commit
- **Use for**: Never (disabled)
- **Reason**: Maintains clean, linear history

## Enforcement

### Automatic Enforcement
- GitHub branch protection rules enforce these requirements
- CI/CD pipeline validates all checks
- Pre-commit hooks prevent local violations

### Manual Enforcement
- Code review process ensures quality
- Team leads can override in emergencies
- Documentation updates required for rule changes

## Emergency Procedures

### Critical Hotfixes
1. **Immediate action required**: Security vulnerabilities, critical bugs
2. **Process**: Create hotfix branch from `main`
3. **Review**: Expedited review process
4. **Deployment**: Immediate deployment after merge

### Bypass Procedures
- **When**: Only in true emergencies
- **Who**: Team leads or project managers
- **Process**: Document reason and create follow-up task
- **Follow-up**: Regular PR created after emergency

## Monitoring and Reporting

### Status Dashboard
- GitHub Actions status
- Code coverage reports
- Security scan results
- Bundle size trends

### Regular Reviews
- Weekly review of protection rules
- Monthly audit of bypasses
- Quarterly workflow optimization

## Best Practices

### For Developers
1. **Always pull latest** before creating branches
2. **Keep branches focused** on single features
3. **Test locally** before pushing
4. **Respond quickly** to review feedback

### For Reviewers
1. **Review promptly** (within 24 hours)
2. **Provide constructive feedback**
3. **Check CI status** before approving
4. **Ensure code quality** standards

### For Team Leads
1. **Monitor protection rules** effectiveness
2. **Review bypass requests** carefully
3. **Optimize workflow** based on team feedback
4. **Maintain documentation** and processes

## Troubleshooting

### Common Issues

#### CI Checks Failing
1. Check local tests: `npm run test`
2. Verify linting: `npm run lint`
3. Check type errors: `npm run type-check`
4. Fix issues locally before pushing

#### Merge Conflicts
1. Update branch with target: `git rebase origin/develop`
2. Resolve conflicts manually
3. Continue rebase: `git rebase --continue`
4. Force push if necessary: `git push --force-with-lease`

#### Branch Protection Errors
1. Ensure all required checks pass
2. Verify branch is up to date
3. Check review requirements
4. Contact team lead if issues persist

## Support

For questions about branch protection:

1. **Check this document** first
2. **Review GitHub settings** in repository
3. **Ask in team discussions**
4. **Contact team lead** for urgent issues

Remember: **Branch protection ensures code quality and team collaboration**. Follow the rules to maintain a healthy development workflow.
