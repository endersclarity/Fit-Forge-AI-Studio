const fs = require('fs');
const path = require('path');

const issues = JSON.parse(fs.readFileSync(path.join(__dirname, '_issues.json'), 'utf8'));

issues.forEach(issue => {
  const slug = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  const labels = issue.labels.map(l => l.name).join(', ') || 'none';
  const status = issue.state === 'OPEN' ? '🔴 Open' : '✅ Closed';

  const content = `# Issue #${issue.number}: ${issue.title}

**Status:** ${status}
**Labels:** ${labels}
**Created:** ${new Date(issue.createdAt).toLocaleDateString()}
**Updated:** ${new Date(issue.updatedAt).toLocaleDateString()}

---

${issue.body}

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/${issue.number}
`;

  const filename = path.join(__dirname, `issue-${issue.number}-${slug}.md`);
  fs.writeFileSync(filename, content);
  console.log(`Created: issue-${issue.number}-${slug}.md`);
});

console.log(`\nGenerated ${issues.length} issue files!`);
