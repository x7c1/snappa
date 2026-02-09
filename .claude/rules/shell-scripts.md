---
paths:
  - "scripts/**/*.sh"
  - ".github/scripts/**/*.sh"
---

- Always start with `#!/bin/bash` and `set -e`
- Include a usage comment near the top: purpose, usage syntax, and any required arguments
- Quote all variable expansions: `"$var"`, `"${array[@]}"`
- Use `[[ ]]` for conditionals instead of `[ ]`
